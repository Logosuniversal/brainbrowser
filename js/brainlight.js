(function() {
  "use strict";

  var data = window.BrainlightData;
  var regions = {};
  var lobes = {};
  var citations = {};
  var renderer;
  var current_scene;
  var selected_region = null;
  var selected_side = "left";
  var progress = 0;
  var playing = false;
  var ready = false;
  var lobe_map = false;
  var labels_visible = true;
  var previous_time = null;
  var current_step = -1;
  var frame_id;
  var dialog_trigger;
  var scene_duration = 12000;

  function byId(id) { return document.getElementById(id); }
  function textElement(tag, value, class_name) {
    var element = document.createElement(tag);
    element.textContent = value;
    if (class_name) { element.className = class_name; }
    return element;
  }
  function button(value, class_name, handler) {
    var element = textElement("button", value, class_name);
    element.type = "button";
    if (handler) { element.addEventListener("click", handler); }
    return element;
  }
  function clear(element) { while (element.firstChild) { element.removeChild(element.firstChild); } }

  data.regions.forEach(function(region) { regions[region.id] = region; });
  data.lobes.forEach(function(lobe) { lobes[lobe.id] = lobe; });
  data.references.forEach(function(reference) { citations[reference.id] = reference; });

  function openSources(ids, trigger) {
    var dialog = byId("sources-dialog");
    dialog_trigger = trigger || document.activeElement;
    Array.prototype.forEach.call(dialog.querySelectorAll(".source-card"), function(card) {
      card.classList.toggle("is-referenced", !!ids && ids.indexOf(card.dataset.reference) !== -1);
    });
    if (!dialog.open) { dialog.showModal(); }
    if (ids && ids.length && byId("source-" + ids[0])) {
      byId("source-" + ids[0]).scrollIntoView({block: "nearest"});
    } else { dialog.scrollTop = 0; }
    byId("sources-close").focus({preventScroll: true});
  }

  function evidence(element, ids) {
    clear(element);
    element.appendChild(textElement("span", "研究依据", "evidence-label"));
    (ids || []).forEach(function(id) {
      var reference = citations[id];
      if (!reference) { return; }
      var label = reference.authors.split(",")[0].replace(/\s+[A-Z]+$/, "") + " 等 · " + reference.year;
      var link = button(label + " ↗", "citation-link", function() { openSources([id], link); });
      element.appendChild(link);
    });
  }

  function renderReferences() {
    data.references.forEach(function(reference, index) {
      var article = document.createElement("article");
      var link = document.createElement("a");
      article.className = "source-card";
      article.id = "source-" + reference.id;
      article.dataset.reference = reference.id;
      article.appendChild(textElement("p", "0" + (index + 1) + " / " + reference.authors + " · " + reference.year, "source-meta"));
      article.appendChild(textElement("h3", reference.title));
      article.appendChild(textElement("p", reference.journal, "source-meta"));
      article.appendChild(textElement("p", reference.finding));
      link.href = reference.url || "https://doi.org/" + reference.doi;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.className = "citation-link";
      link.textContent = "DOI: " + reference.doi + " ↗";
      article.appendChild(link);
      byId("sources-list").appendChild(article);
    });
  }

  function renderIndex() {
    data.lobes.forEach(function(lobe) {
      var lobe_regions = data.regions.filter(function(region) { return region.lobe === lobe.id; });
      var group = document.createElement("section");
      var heading = textElement("h3", lobe.label);
      var grid = document.createElement("div");
      var legend = textElement("span", lobe.label, "legend-item");
      var dot = document.createElement("i");
      dot.className = "legend-dot";
      dot.style.backgroundColor = lobe.color;
      legend.insertBefore(dot, legend.firstChild);
      byId("lobe-legend").appendChild(legend);
      if (!lobe_regions.length) { return; }
      group.className = "region-group";
      group.style.setProperty("--lobe-color", lobe.color);
      grid.className = "region-grid";
      group.appendChild(heading);
      lobe_regions.forEach(function(region) {
        var card = button("", "region-card", function() { showRegion(region.id, "left"); });
        card.dataset.region = region.id;
        card.appendChild(textElement("strong", region.short));
        card.appendChild(textElement("small", region.name));
        grid.appendChild(card);
      });
      group.appendChild(grid);
      byId("region-groups").appendChild(group);
    });
  }

  function showRegion(id, side) {
    var region = regions[id];
    if (!region) { return; }
    selected_region = region;
    selected_side = side === "right" ? "right" : "left";
    byId("region-index").hidden = true;
    byId("region-detail").hidden = false;
    byId("region-kicker").textContent = lobes[region.lobe].label + " · " + (selected_side === "left" ? "左半球" : "右半球");
    byId("region-kicker").style.color = lobes[region.lobe].color;
    byId("region-name").textContent = region.name;
    byId("region-english").textContent = region.english;
    byId("region-summary").textContent = region.description;
    byId("region-note").textContent = region.note;
    byId("switch-hemisphere").textContent = selected_side === "left" ? "查看右侧" : "查看左侧";
    clear(byId("region-functions"));
    region.functions.forEach(function(item) { byId("region-functions").appendChild(textElement("li", item)); });
    evidence(byId("region-evidence"), region.evidence);
    clear(byId("related-scenarios"));
    data.scenarios.forEach(function(scenario) {
      if (scenario.steps.some(function(step) { return step.region === id; })) {
        byId("related-scenarios").appendChild(button(scenario.title, "chip", function() { selectScene(scenario.id); }));
      }
    });
    byId("region-detail").scrollTop = 0;
    if (renderer) { renderer.selectRegion(id, selected_side); }
  }

  function selectScene(id) {
    current_scene = data.scenarios.filter(function(scenario) { return scenario.id === id; })[0] || data.scenarios[0];
    progress = 0;
    playing = false;
    current_step = -1;
    selected_region = null;
    byId("region-index").hidden = false;
    byId("region-detail").hidden = true;
    if (renderer) { renderer.selectRegion(null, "left"); }
    Array.prototype.forEach.call(byId("scenario-list").children, function(card) {
      var active = card.dataset.scene === current_scene.id;
      card.classList.toggle("is-active", active);
      card.setAttribute("aria-pressed", String(active));
    });
    byId("scenario-title").textContent = current_scene.title;
    byId("scenario-subtitle").textContent = current_scene.subtitle;
    byId("scenario-description").textContent = current_scene.description;
    clear(byId("step-list"));
    current_scene.steps.forEach(function(step, index) {
      var item = document.createElement("li");
      var step_button = button("", "", function() {
        playing = false;
        progress = index / current_scene.steps.length;
        updateProgress();
        showRegion(step.region, "left");
        if (ready) { focusRegion(step.region, "left"); }
      });
      var copy = document.createElement("span");
      copy.className = "step-copy";
      step_button.appendChild(textElement("span", "0" + (index + 1), "step-number"));
      copy.appendChild(textElement("strong", step.title));
      copy.appendChild(textElement("small", step.description));
      step_button.appendChild(copy);
      item.appendChild(step_button);
      byId("step-list").appendChild(item);
    });
    evidence(byId("scenario-evidence"), current_scene.evidence);
    document.querySelector(".scenario-detail").scrollTop = 0;
    updateProgress();
  }

  function updateProgress() {
    var step_index = Math.min(current_scene.steps.length - 1, Math.floor(progress * current_scene.steps.length));
    var active = {};
    byId("progress").value = Math.round(progress * 1000);
    byId("progress-readout").textContent = Math.round(progress * 100) + "%";
    byId("progress").style.setProperty("--progress", Math.round(progress * 100) + "%");
    byId("play-toggle").textContent = playing ? "Ⅱ 暂停" : (progress >= 1 ? "↺ 重播" : "▶ 播放");
    byId("play-toggle").setAttribute("aria-label", playing ? "暂停视觉场景演示" : "播放视觉场景演示");
    if (step_index !== current_step) {
      current_step = step_index;
      Array.prototype.forEach.call(byId("step-list").children, function(item, index) {
        item.classList.toggle("step-active", index === step_index);
        if (index === step_index) { item.firstChild.setAttribute("aria-current", "step"); }
        else { item.firstChild.removeAttribute("aria-current"); }
      });
      current_scene.steps.forEach(function(step, index) {
        if (index <= step_index) { active[step.region] = index === step_index ? 1 : 0.24; }
      });
      if (renderer) { renderer.setActivity(active); }
    }
  }

  function togglePlay() {
    if (!ready) { return; }
    if (progress >= 1) { progress = 0; }
    playing = !playing;
    previous_time = null;
    updateProgress();
  }

  function tick(time) {
    if (playing && previous_time !== null) {
      progress = Math.min(1, progress + Math.min(time - previous_time, 100) * Number(byId("speed-select").value) / scene_duration);
      if (progress >= 1) { playing = false; }
      updateProgress();
    }
    previous_time = time;
    frame_id = window.requestAnimationFrame(tick);
  }

  function setOpacity(value) {
    byId("cortex-opacity").value = Math.round(value * 100);
    byId("inside-toggle").textContent = value < 0.8 ? "合上皮层" : "看内侧";
    byId("inside-toggle").setAttribute("aria-pressed", String(value < 0.8));
    renderer.setOpacity(value);
  }

  function setView(view) {
    renderer.setView(view);
    syncViewButtons(view);
  }

  function syncViewButtons(view) {
    Array.prototype.forEach.call(document.querySelectorAll("[data-view]"), function(item) {
      item.classList.toggle("is-active", item.dataset.view === view);
      item.setAttribute("aria-pressed", String(item.dataset.view === view));
    });
  }

  function focusRegion(id, side) {
    renderer.focusRegion(id, side);
    syncViewButtons(renderer.getDebugState().currentView);
  }

  renderReferences();
  renderIndex();
  data.scenarios.forEach(function(scenario, index) {
    var card = button("", "scenario-card", function() { selectScene(scenario.id); });
    card.dataset.scene = scenario.id;
    card.appendChild(textElement("span", "0" + (index + 1), "scenario-number"));
    card.appendChild(textElement("h3", scenario.title));
    card.appendChild(textElement("p", scenario.subtitle));
    byId("scenario-list").appendChild(card);
  });
  selectScene(data.scenarios[0].id);

  renderer = window.BrainlightRenderer.create({
    element: byId("brain-viewport"),
    labelsElement: byId("brain-labels"),
    data: data,
    onReady: function() {
      ready = true;
      byId("loading-state").hidden = true;
      byId("play-toggle").disabled = false;
      byId("progress").disabled = false;
      current_step = -1;
      updateProgress();
      byId("model-status").textContent = "皮层模型已就绪 · " + data.regions.length + " 个视觉相关分区";
    },
    onPick: function(id, side) { showRegion(id, side); },
    onHover: function(id, side, x, y) {
      var tooltip = byId("brain-tooltip");
      var region = regions[id];
      tooltip.hidden = !region;
      if (region) {
        tooltip.querySelector(".tooltip-title").textContent = region.name;
        tooltip.querySelector(".tooltip-meta").textContent = (side === "right" ? "右" : "左") + "半球 · " + lobes[region.lobe].label;
        tooltip.style.left = Math.max(8, Math.min(x + 16, byId("brain-viewport").clientWidth - 220)) + "px";
        tooltip.style.top = Math.max(8, Math.min(y + 16, byId("brain-viewport").clientHeight - 70)) + "px";
      }
    },
    onError: function(message) {
      byId("loading-state").hidden = true;
      byId("viewport-error").hidden = false;
      byId("viewport-error").querySelector("p").textContent = message;
      byId("model-status").textContent = "脑区说明与参考文献仍可阅读";
    }
  });

  Array.prototype.forEach.call(document.querySelectorAll("[data-view]"), function(item) {
    item.addEventListener("click", function() { setView(item.dataset.view); });
  });
  byId("reset-view").addEventListener("click", function() {
    renderer.reset();
    setView("left");
    setOpacity(1);
    current_step = -1;
    updateProgress();
    if (selected_region) { renderer.selectRegion(selected_region.id, selected_side); }
  });
  byId("cortex-opacity").addEventListener("input", function() { setOpacity(Number(this.value) / 100); });
  byId("inside-toggle").addEventListener("click", function() { setOpacity(Number(byId("cortex-opacity").value) < 80 ? 1 : 0.25); });
  byId("lobe-toggle").addEventListener("click", function() {
    lobe_map = !lobe_map;
    this.setAttribute("aria-checked", String(lobe_map));
    byId("lobe-legend").hidden = !lobe_map;
    renderer.setLobeMap(lobe_map);
  });
  byId("labels-toggle").addEventListener("click", function() {
    labels_visible = !labels_visible;
    this.setAttribute("aria-checked", String(labels_visible));
    renderer.setLabels(labels_visible);
  });
  byId("back-to-index").addEventListener("click", function() {
    byId("region-index").hidden = false;
    byId("region-detail").hidden = true;
    selected_region = null;
    renderer.selectRegion(null, "left");
  });
  byId("fly-to-region").addEventListener("click", function() { if (selected_region && ready) { focusRegion(selected_region.id, selected_side); } });
  byId("switch-hemisphere").addEventListener("click", function() {
    if (selected_region) {
      showRegion(selected_region.id, selected_side === "left" ? "right" : "left");
      if (ready) { focusRegion(selected_region.id, selected_side); }
    }
  });
  byId("play-toggle").addEventListener("click", togglePlay);
  byId("progress").addEventListener("input", function() { playing = false; progress = Number(this.value) / 1000; updateProgress(); });
  byId("sources-open").addEventListener("click", function() { openSources(null, this); });
  byId("sources-close").addEventListener("click", function() { byId("sources-dialog").close(); });
  byId("sources-dialog").addEventListener("close", function() { if (dialog_trigger) { dialog_trigger.focus({preventScroll: true}); } });
  byId("sources-dialog").addEventListener("click", function(event) { if (event.target === this) { this.close(); } });
  byId("retry-load").addEventListener("click", function() { window.location.reload(); });
  document.addEventListener("visibilitychange", function() { previous_time = null; if (document.hidden) { playing = false; updateProgress(); } });
  document.addEventListener("keydown", function(event) {
    if (event.code === "Space" && !/^(INPUT|SELECT|BUTTON|A|TEXTAREA)$/.test(event.target.tagName) && !byId("sources-dialog").open) {
      event.preventDefault(); togglePlay();
    }
  });
  frame_id = window.requestAnimationFrame(tick);
  window.addEventListener("pagehide", function() { window.cancelAnimationFrame(frame_id); renderer.destroy(); });
  window.Brainlight = {
    data: data,
    renderer: renderer,
    getState: function() { return {ready: ready, playing: playing, progress: progress, scenario: current_scene.id, step: current_step, selected: selected_region && selected_region.id, side: selected_side}; }
  };
})();
