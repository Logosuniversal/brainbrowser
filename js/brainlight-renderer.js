/* Brainlight: an interactive view of the bundled anatomical cortical surface.
 * Uses the repository's MNI surface and AAL labels; it does not generate anatomy.
 * The educational activity overlay is supplied separately from the anatomy.
 */
/* global BrainBrowser, pako */
(function(root) {
  "use strict";

  function create(options) {
    var THREE = BrainBrowser.SurfaceViewer.THREE;
    var element = options.element;
    var labelLayer = options.labelsElement;
    var data = options.data;
    var viewer, camera, renderer, modelData, atlas, colorBuffer;
    var ready = false;
    var destroyed = false;
    var sceneReady = false;
    var labelsVisible = true;
    var lobeMap = false;
    var opacity = 1;
    var selected = null;
    var currentView = "left";
    var activities = {};
    var regions = {};
    var atlasRegions = {};
    var lobeColors = {};
    var anchors = [];
    var requests = [];
    var blobURLs = [];
    var pointerStart = null;
    var lastHover = 0;
    var transition = 0;
    var resizeObserver;
    var baseZoom = 1;
    var center = new THREE.Vector3();
    var base = new THREE.Color("#c98e7b");
    var highlight = new THREE.Color("#ffd292");
    var shade;
    var api = {};

    data.lobes.forEach(function(lobe) {
      lobeColors[lobe.id] = new THREE.Color(lobe.color);
    });
    data.regions.forEach(function(region) {
      regions[region.id] = region;
      region.atlas.forEach(function(value) {
        // AAL Heschl parcels are deliberately excluded from interaction.
        if (value !== 79 && value !== 80) {
          atlasRegions[value] = region;
        }
      });
    });

    function reportError(message) {
      if (!destroyed && options.onError) {
        options.onError(message);
      }
    }

    function gzipText(url, callback) {
      var request = new XMLHttpRequest();
      requests.push(request);
      request.open("GET", url);
      request.responseType = "arraybuffer";
      request.timeout = 45000;
      request.onload = function() {
        if (destroyed) { return; }
        if (request.status < 200 || request.status >= 300) {
          reportError("无法加载本地脑模型（HTTP " + request.status + "）。请使用 HTTP 服务打开演示。");
          return;
        }
        try {
          callback(pako.ungzip(new Uint8Array(request.response), {to: "string"}));
        } catch (error) {
          reportError("脑模型数据无法读取：" + error.message);
        }
      };
      request.onerror = request.ontimeout = function() {
        reportError("脑模型加载失败。请检查连接后重新加载。");
      };
      request.send();
    }

    function colorForAtlas(value) {
      var region = atlasRegions[value];
      if (region && lobeColors[region.lobe]) {
        return lobeColors[region.lobe];
      }
      // Complete the anatomical lobe map without adding selectable regions.
      if (value >= 43 && value <= 54) { return lobeColors.occipital || base; }
      if (value >= 57 && value <= 70) { return lobeColors.parietal || base; }
      if (value >= 79 && value <= 90 || value >= 55 && value <= 56) {
        return lobeColors.temporal || base;
      }
      if (value >= 1 && value <= 28 || value === 69 || value === 70) {
        return lobeColors.frontal || base;
      }
      if (value === 29 || value === 30) { return lobeColors.insula || base; }
      if (value >= 31 && value <= 40) { return lobeColors.limbic || base; }
      return base;
    }

    function updateColors() {
      if (!ready || destroyed) { return; }
      var i, value, region, color, amount, side, strength;
      for (i = 0; i < atlas.length; i++) {
        value = Math.round(atlas[i]);
        region = atlasRegions[value];
        side = value % 2 ? "left" : "right";
        color = lobeMap ? colorForAtlas(value) : base;
        amount = region ? Math.max(0, Math.min(1, activities[region.id] || 0)) : 0;
        if (region && selected && selected.id === region.id &&
            (!selected.side || selected.side === side)) {
          amount = Math.max(amount, 0.76);
        }
        strength = shade[i];
        colorBuffer[i * 4] = (color.r * (1 - amount) + highlight.r * amount) * strength;
        colorBuffer[i * 4 + 1] = (color.g * (1 - amount) + highlight.g * amount) * strength;
        colorBuffer[i * 4 + 2] = (color.b * (1 - amount) + highlight.b * amount) * strength;
        colorBuffer[i * 4 + 3] = 1;
      }
      viewer.model.children.forEach(function(shape) {
        var attribute = shape.geometry.attributes.color;
        var colors = attribute.array;
        var indices = shape.userData.original_data.indices;
        var j, k;
        if (BrainBrowser.WEBGL_UINT_INDEX_ENABLED) {
          colors.set(colorBuffer);
        } else {
          for (j = 0; j < indices.length; j++) {
            for (k = 0; k < 4; k++) {
              colors[j * 4 + k] = colorBuffer[indices[j] * 4 + k];
            }
          }
        }
        attribute.needsUpdate = true;
      });
      viewer.updated = true;
    }

    function createAnchors() {
      var groups = {};
      var vertices = modelData.vertices;
      var normals = modelData.normals;
      var i, value, region, side, key, group;
      for (i = 0; i < atlas.length; i++) {
        value = Math.round(atlas[i]);
        region = atlasRegions[value];
        if (!region) { continue; }
        side = value % 2 ? "left" : "right";
        key = region.id + ":" + side;
        if (!groups[key]) {
          groups[key] = {region: region, side: side, points: [],
            position: new THREE.Vector3(), normal: new THREE.Vector3()};
        }
        group = groups[key];
        group.points.push(i);
        group.position.x += vertices[i * 3];
        group.position.y += vertices[i * 3 + 1];
        group.position.z += vertices[i * 3 + 2];
        if (normals) {
          group.normal.x += normals[i * 3];
          group.normal.y += normals[i * 3 + 1];
          group.normal.z += normals[i * 3 + 2];
        }
      }
      Object.keys(groups).forEach(function(name) {
        var anchor = groups[name];
        var nearest = -1;
        var best = Infinity;
        var x, y, z, distance;
        anchor.position.multiplyScalar(1 / anchor.points.length);
        anchor.centroid = anchor.position.clone();
        anchor.normal.normalize();
        // Labels attach to a real vertex near the parcel's centroid.
        anchor.points.forEach(function(index) {
          x = vertices[index * 3] - anchor.position.x;
          y = vertices[index * 3 + 1] - anchor.position.y;
          z = vertices[index * 3 + 2] - anchor.position.z;
          distance = x * x + y * y + z * z;
          if (distance < best) { best = distance; nearest = index; }
        });
        anchor.position.set(vertices[nearest * 3], vertices[nearest * 3 + 1], vertices[nearest * 3 + 2]);
        anchor.position.sub(center);
        if (labelLayer) {
          var button = document.createElement("button");
          button.type = "button";
          button.className = "brain-label";
          button.textContent = (anchor.region.short || anchor.region.name) + (anchor.side === "left" ? " L" : " R");
          button.setAttribute("aria-label", anchor.region.name + (anchor.side === "left" ? "（左半球）" : "（右半球）"));
          button.style.position = "absolute";
          button.style.pointerEvents = "auto";
          button.style.transform = "translate(-50%, -50%)";
          button.addEventListener("click", function(event) {
            event.stopPropagation();
            if (options.onPick) { options.onPick(anchor.region.id, anchor.side); }
          });
          labelLayer.appendChild(button);
          anchor.element = button;
        }
        anchors.push(anchor);
      });
    }

    function updateLabels() {
      if (!camera || !ready || !labelLayer || destroyed) { return; }
      var width = element.clientWidth;
      var height = element.clientHeight;
      var occupied = [];
      viewer.model.updateMatrixWorld(true);
      var inverse = new THREE.Matrix4().getInverse(viewer.model.matrixWorld);
      var eye = camera.position.clone().applyMatrix4(inverse).add(center);
      var vertices = modelData.vertices;
      var normals = modelData.normals;
      var signature = Array.prototype.join.call(viewer.model.matrixWorld.elements, ",") +
        ":" + camera.position.x + ":" + camera.position.y + ":" + camera.position.z +
        ":" + width + ":" + height + ":" + opacity + ":" + labelsVisible;
      var ordered = anchors.slice().sort(function(a, b) {
        var av = selected && a.region.id === selected.id ? 3 : activities[a.region.id] || 0;
        var bv = selected && b.region.id === selected.id ? 3 : activities[b.region.id] || 0;
        return bv - av;
      });
      ordered.forEach(function(anchor) {
        var button = anchor.element;
        var active = selected && anchor.region.id === selected.id &&
          (!selected.side || anchor.side === selected.side);
        var x, y, facing, visible;
        if (anchor.projection && anchor.projection.signature === signature) {
          x = anchor.projection.x;
          y = anchor.projection.y;
          facing = anchor.projection.facing;
          visible = anchor.projection.visible;
        } else {
          // Use an exposed vertex from this parcel for the current camera, so a
          // centroid inside a sulcus does not make its entire label disappear.
          var direction = eye.clone().sub(anchor.centroid).normalize();
          var bestScore = -Infinity;
          var bestIndex = -1;
          anchor.points.forEach(function(index) {
            var x = vertices[index * 3] - anchor.centroid.x;
            var y = vertices[index * 3 + 1] - anchor.centroid.y;
            var z = vertices[index * 3 + 2] - anchor.centroid.z;
            var depth = x * direction.x + y * direction.y + z * direction.z;
            var normalFacing = normals ? normals[index * 3] * direction.x +
              normals[index * 3 + 1] * direction.y + normals[index * 3 + 2] * direction.z : 1;
            var lateral = Math.sqrt(Math.max(0, x * x + y * y + z * z - depth * depth));
            var score = depth - lateral * 0.2;
            if (normalFacing > 0.12 && score > bestScore) { bestScore = score; bestIndex = index; }
          });
          if (bestIndex >= 0) {
            anchor.position.set(vertices[bestIndex * 3] - center.x,
              vertices[bestIndex * 3 + 1] - center.y, vertices[bestIndex * 3 + 2] - center.z);
            if (normals) {
              anchor.normal.set(normals[bestIndex * 3], normals[bestIndex * 3 + 1], normals[bestIndex * 3 + 2]);
            }
          }
          var normal = anchor.normal.clone().transformDirection(viewer.model.matrixWorld);
          var point = anchor.position.clone().applyMatrix4(viewer.model.matrixWorld);
          var towardCamera = camera.position.clone().sub(point).normalize();
          facing = normal.dot(towardCamera);
          point.project(camera);
          x = (point.x + 1) * width / 2;
          y = (1 - point.y) * height / 2;
          visible = labelsVisible && point.z > -1 && point.z < 1 &&
            x > 28 && x < width - 28 && y > 25 && y < height - 25 &&
            (facing > 0.12 || opacity < 0.55);
          // A far hemisphere's medial parcel can face the camera while hidden
          // behind the nearer hemisphere. Check the real surface intersection.
          if (visible && opacity >= 0.55) {
            var surface = viewer.pick(x, y, 0);
            var expected = anchor.position.clone().add(center);
            visible = !!surface && surface.point.distanceTo(expected) < 7;
          }
          anchor.projection = {signature: signature, x: x, y: y, facing: facing, visible: visible};
        }
        var halfWidth = Math.max(32, button.offsetWidth / 2);
        if (visible && !active) {
          occupied.forEach(function(rect) {
            if (Math.abs(rect.x - x) < halfWidth + rect.w + 5 && Math.abs(rect.y - y) < 29) {
              visible = false;
            }
          });
        }
        button.style.display = visible ? "block" : "none";
        if (!visible) { return; }
        occupied.push({x: x, y: y, w: halfWidth});
        button.style.left = x.toFixed(1) + "px";
        button.style.top = y.toFixed(1) + "px";
        button.className = "brain-label" + (active ? " is-selected" : "") +
          ((activities[anchor.region.id] || 0) > 0.15 ? " is-active" : "");
        button.style.opacity = active ? "1" : String(Math.min(1, 0.5 + Math.max(0, facing) * 0.5));
      });
    }

    function computeShading() {
      var count = modelData.vertices.length / 3;
      var vertices = modelData.vertices;
      var normals = modelData.normals;
      var curvature = new Float32Array(count);
      var neighbors = new Uint16Array(count);
      shade = new Float32Array(count);
      if (normals) {
        modelData.shapes.forEach(function(shape) {
          var indices = shape.indices;
          var i, j, a, b;
          for (i = 0; i < indices.length; i += 3) {
            for (j = 0; j < 3; j++) {
              a = indices[i + j];
              b = indices[i + (j + 1) % 3];
              curvature[a] += (vertices[b * 3] - vertices[a * 3]) * normals[a * 3] +
                (vertices[b * 3 + 1] - vertices[a * 3 + 1]) * normals[a * 3 + 1] +
                (vertices[b * 3 + 2] - vertices[a * 3 + 2]) * normals[a * 3 + 2];
              neighbors[a]++;
            }
          }
        });
      }
      for (var i = 0; i < count; i++) {
        // A mild geometry-derived sulcal shade preserves the actual mesh folds.
        shade[i] = Math.max(0.65, Math.min(1.08, 1 -
          (neighbors[i] ? curvature[i] / neighbors[i] : 0) * 0.8));
      }
    }

    function setOpacity(value) {
      opacity = Math.max(0, Math.min(1, Number(value)));
      if (!viewer || !ready) { return; }
      viewer.model.children.forEach(function(shape) {
        shape.material.opacity = opacity;
        shape.material.transparent = opacity < 1;
        shape.material.depthWrite = opacity >= 0.98;
      });
      viewer.updated = true;
    }

    function viewQuaternion(name) {
      var directions = {
        left: [-1, 0, 0], right: [1, 0, 0], front: [0, 1, 0],
        back: [0, -1, 0], top: [0, 0, 1], bottom: [0, 0, -1]
      };
      var direction = directions[name] || directions.right;
      var forward = new THREE.Vector3(direction[0], direction[1], direction[2]);
      var up = name === "top" || name === "bottom" ? new THREE.Vector3(0, 1, 0) : new THREE.Vector3(0, 0, 1);
      var right = up.clone().cross(forward).normalize();
      up = forward.clone().cross(right).normalize();
      var matrix = new THREE.Matrix4();
      matrix.set(right.x, right.y, right.z, 0, up.x, up.y, up.z, 0,
        forward.x, forward.y, forward.z, 0, 0, 0, 0, 1);
      return new THREE.Quaternion().setFromRotationMatrix(matrix);
    }

    function animateView(quaternion, zoom) {
      if (!viewer || destroyed) { return; }
      if (root.matchMedia && root.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        transition++;
        viewer.model.quaternion.copy(quaternion);
        viewer.zoom = zoom;
        viewer.updated = true;
        return;
      }
      var initial = viewer.model.quaternion.clone();
      var initialZoom = viewer.zoom;
      var start = Date.now();
      var token = ++transition;
      function frame() {
        if (destroyed || token !== transition) { return; }
        var t = Math.min(1, (Date.now() - start) / 560);
        var eased = 1 - Math.pow(1 - t, 3);
        THREE.Quaternion.slerp(initial, quaternion, viewer.model.quaternion, eased);
        viewer.zoom = initialZoom + (zoom - initialZoom) * eased;
        viewer.updated = true;
        if (t < 1) { root.requestAnimationFrame(frame); }
      }
      frame();
    }

    function setView(name) {
      if (["left", "right", "front", "back", "top", "bottom"].indexOf(name) === -1) { return; }
      currentView = name;
      if (!ready) { return; }
      viewer.setCameraPosition(0, 0, 500 / baseZoom);
      animateView(viewQuaternion(name), baseZoom);
    }

    function pick(event) {
      if (!ready || destroyed) { return null; }
      var rect = element.getBoundingClientRect();
      var result = viewer.pick(event.clientX - rect.left, event.clientY - rect.top, 0);
      if (!result) { return null; }
      var value = Math.round(atlas[result.index]);
      var region = atlasRegions[value];
      return region ? {id: region.id, side: value % 2 ? "left" : "right"} : null;
    }

    function pointerDown(event) {
      transition++;
      pointerStart = {x: event.clientX, y: event.clientY, time: Date.now()};
    }

    function pointerUp(event) {
      if (!pointerStart) { return; }
      var dx = pointerStart.x - event.clientX;
      var dy = pointerStart.y - event.clientY;
      var shortClick = Date.now() - pointerStart.time < 700;
      pointerStart = null;
      if (dx * dx + dy * dy < 36 && shortClick) {
        var result = pick(event);
        if (result && options.onPick) { options.onPick(result.id, result.side); }
      }
    }

    function pointerMove(event) {
      if (pointerStart || Date.now() - lastHover < 90) { return; }
      lastHover = Date.now();
      var result = pick(event);
      var rect = element.getBoundingClientRect();
      element.style.cursor = result ? "pointer" : "grab";
      if (options.onHover) {
        options.onHover(result ? result.id : null, result ? result.side : null,
          event.clientX - rect.left, event.clientY - rect.top);
      }
    }

    function pointerLeave() {
      pointerStart = null;
      if (options.onHover) { options.onHover(null, null, 0, 0); }
    }

    function resize() {
      if (viewer && !destroyed && element.clientWidth && element.clientHeight) {
        viewer.updateViewport();
        baseZoom = Math.max(0.6, Math.min(1.22, element.clientWidth / element.clientHeight * 1.15));
        viewer.zoom = baseZoom;
      }
    }

    function initializeScene(event) {
      camera = event.camera;
      renderer = event.renderer;
      if (!sceneReady) {
        sceneReady = true;
        // THREE r69 leaves nonzero clear RGB in its premultiplied canvas.
        // Transparent black avoids adding a colored rectangle to the page.
        renderer.setClearColor(0x000000, 0);
        event.scene.children.forEach(function(child) {
          if (child instanceof THREE.PointLight) { child.intensity = 0.46; }
        });
        event.scene.add(new THREE.AmbientLight(0x40343a));
        var key = new THREE.DirectionalLight(0xffe3d1, 0.43);
        key.position.set(-160, 230, 300);
        event.scene.add(key);
        var rim = new THREE.DirectionalLight(0xc4ccd9, 0.25);
        rim.position.set(200, -40, -100);
        event.scene.add(rim);
        // SurfaceViewer emits draw after rendering; request the lighting pass.
        root.requestAnimationFrame(function() { viewer.updated = !destroyed; });
      }
      updateLabels();
    }

    function finishLoading() {
      if (destroyed) { return; }
      modelData = viewer.model_data.get();
      if (!modelData || atlas.length !== modelData.vertices.length / 3) {
        reportError("脑表面与分区数据不匹配。");
        return;
      }
      var bounds = modelData.bounding_box;
      center.set((bounds.min_x + bounds.max_x) / 2, (bounds.min_y + bounds.max_y) / 2,
        (bounds.min_z + bounds.max_z) / 2);
      viewer.model.children.forEach(function(shape) {
        shape.position.sub(center);
        shape.material.color.setHex(0xffffff);
        shape.material.ambient.setHex(0xffffff);
        shape.material.specular.setHex(0x30231e);
        shape.material.shininess = 28;
      });
      colorBuffer = new Float32Array(atlas.length * 4);
      computeShading();
      createAnchors();
      ready = true;
      resize();
      viewer.model.quaternion.copy(viewQuaternion(currentView));
      setOpacity(opacity);
      updateColors();
      if (options.onReady) { options.onReady(api); }
    }

    api.setView = setView;
    api.setOpacity = setOpacity;
    api.setLobeMap = function(value) { lobeMap = !!value; updateColors(); };
    api.setLabels = function(value) {
      labelsVisible = !!value;
      if (labelLayer) { labelLayer.style.display = labelsVisible ? "" : "none"; }
      if (viewer) { viewer.updated = true; }
    };
    api.setActivity = function(value) { activities = value || {}; updateColors(); };
    api.selectRegion = function(id, side) {
      selected = id && regions[id] ? {id: id, side: side || null} : null;
      updateColors();
    };
    api.focusRegion = function(id, side) {
      var region = regions[id];
      if (!region || !ready) { return; }
      api.selectRegion(id, side);
      var targetView = region.view || side || "right";
      if (targetView === "left" || targetView === "right") { targetView = side || targetView; }
      if (targetView === "posterior") { targetView = "back"; }
      if (targetView === "inferior") { targetView = "bottom"; }
      currentView = targetView;
      viewer.setCameraPosition(0, 0, 500 / baseZoom);
      animateView(viewQuaternion(targetView), baseZoom * 1.06);
    };
    api.reset = function() {
      selected = null;
      activities = {};
      setOpacity(1);
      setView("left");
      updateColors();
    };
    api.getDebugState = function() {
      return {ready: ready, vertexCount: atlas ? atlas.length : 0,
        mappedAtlas: Object.keys(atlasRegions).map(Number), currentView: currentView,
        selected: selected, opacity: opacity, lobeMap: lobeMap, labels: labelsVisible,
        activity: activities, anchorCount: anchors.length};
    };
    api.destroy = function() {
      destroyed = true;
      transition++;
      requests.forEach(function(request) { request.abort(); });
      blobURLs.forEach(function(url) { root.URL.revokeObjectURL(url); });
      if (resizeObserver) { resizeObserver.disconnect(); }
      root.removeEventListener("resize", resize);
      element.removeEventListener("pointerdown", pointerDown);
      element.removeEventListener("pointerup", pointerUp);
      element.removeEventListener("pointermove", pointerMove);
      element.removeEventListener("pointerleave", pointerLeave);
      anchors.forEach(function(anchor) {
        if (anchor.element && anchor.element.parentNode) { anchor.element.parentNode.removeChild(anchor.element); }
      });
      if (viewer) {
        viewer.model.children.forEach(function(shape) {
          shape.geometry.dispose();
          shape.material.dispose();
        });
        viewer.clearScreen();
        viewer.updated = false;
      }
      if (renderer && renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
    };

    if (!BrainBrowser.WEBGL_ENABLED) {
      root.setTimeout(function() { reportError("此浏览器无法使用 WebGL。请启用硬件加速或使用新版 Chrome / Edge。"); }, 0);
      return api;
    }
    BrainBrowser.config.set("worker_dir", "js/brainbrowser/workers/");
    try {
      BrainBrowser.SurfaceViewer.start(element, function(instance) {
        if (destroyed) { return; }
        viewer = instance;
        api.viewer = viewer;
        viewer.addEventListener("draw", initializeScene);
        viewer.render();
        viewer.setClearColor(0x000000, 0);
        element.addEventListener("pointerdown", pointerDown);
        element.addEventListener("pointerup", pointerUp);
        element.addEventListener("pointermove", pointerMove);
        element.addEventListener("pointerleave", pointerLeave);
        root.addEventListener("resize", resize);
        if (root.ResizeObserver) {
          resizeObserver = new root.ResizeObserver(resize);
          resizeObserver.observe(element);
        }
        gzipText("models/atlas-values.txt.gz", function(text) {
          atlas = new Float32Array(text.trim().split(/\s+/).map(Number));
          gzipText("models/brain-surface.obj.gz", function(modelText) {
            var url = root.URL.createObjectURL(new Blob([modelText], {type: "text/plain"}));
            blobURLs.push(url);
            viewer.loadModelFromURL(url, {format: "mniobj", complete: function() {
              root.URL.revokeObjectURL(url);
              finishLoading();
            }});
          });
        });
      });
    } catch (error) {
      root.setTimeout(function() { reportError("3D 查看器启动失败：" + error.message); }, 0);
    }
    return api;
  }

  root.BrainlightRenderer = {create: create};
})(window);
