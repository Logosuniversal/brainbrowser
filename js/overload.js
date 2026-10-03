(function() {
  "use strict";

  var data = window.OverloadData;
  var renderer;
  var ready = false;
  var active_mechanism;
  var region_by_id = {};
  var reference_by_id = {};
  var source_trigger;
  var transparent = false;
  var running = false;
  var accepting = false;
  var trial_index = 0;
  var sequence = [];
  var responses = [];
  var trial_started = 0;
  var deadline_timer;
  var gap_timer;
  var run_token = 0;
  var condition = "stable";
  var results = {};
  var condition_labels = {stable: "A · 固定规则", "switch": "B · 规则切换", distract: "C · 切换＋视觉干扰"};
  var distractor_messages = ["待阅 · 3 条更新", "新的任务卡片", "稍后再看", "进度更新", "还有一项提醒", "日程有变动"];

  function el(id) { return document.getElementById(id); }
  function text(tag, value, class_name) {
    var node = document.createElement(tag);
    node.textContent = value;
    if (class_name) { node.className = class_name; }
    return node;
  }
  function clear(node) { while (node.firstChild) { node.removeChild(node.firstChild); } }
  function button(label, class_name, handler) {
    var node = text("button", label, class_name);
    node.type = "button";
    node.addEventListener("click", handler);
    return node;
  }

  data.regions.forEach(function(region) { region_by_id[region.id] = region; });
  data.references.forEach(function(reference) { reference_by_id[reference.id] = reference; });
  el("reference-count").textContent = data.references.length + " 篇经典研究与综述";

  function openSources(ids, trigger) {
    stopRound("查看文献中断了本轮，本轮未计入记录。阅读后可重新开始。");
    source_trigger = trigger || document.activeElement;
    Array.prototype.forEach.call(el("overload-source-list").children, function(card) {
      card.classList.toggle("is-referenced", !!ids && ids.indexOf(card.dataset.reference) !== -1);
    });
    el("overload-sources").showModal();
    if (ids && ids.length) { el("overload-source-" + ids[0]).scrollIntoView({block: "nearest"}); }
    else { el("overload-sources").scrollTop = 0; }
    el("overload-sources-close").focus({preventScroll: true});
  }

  function citations(target, ids) {
    clear(target);
    (ids || []).forEach(function(id) {
      var reference = reference_by_id[id];
      if (!reference) { return; }
      var label = reference.authors.split(",")[0].replace(/\s+[A-Z]+$/, "") + " 等 · " + reference.year;
      var link = button(label + " ↗", "citation-link", function() { openSources([id], link); });
      target.appendChild(link);
    });
  }

  function setView(name) {
    if (renderer) { renderer.setView(name); }
    syncView(name);
  }

  function syncView(name) {
    Array.prototype.forEach.call(document.querySelectorAll("[data-brain-view]"), function(item) {
      item.setAttribute("aria-pressed", String(item.dataset.brainView === name));
    });
  }

  function setTransparent(value) {
    transparent = value;
    el("overload-inside").setAttribute("aria-checked", String(transparent));
    el("overload-inside").textContent = transparent ? "恢复表面" : "透视皮层";
    if (renderer) { renderer.setOpacity(transparent ? 0.26 : 1); }
  }

  function selectRegion(id, side) {
    var region = region_by_id[id];
    if (!region) { return; }
    el("region-insight").hidden = false;
    el("overload-region-name").textContent = region.name + " · " + (side === "right" ? "右" : "左") + "半球";
    el("overload-region-name").style.color = region.color;
    Array.prototype.forEach.call(el("network-regions").children, function(control) {
      control.setAttribute("aria-pressed", String(control.dataset.region === id));
    });
    el("overload-region-description").textContent = region.description;
    el("overload-region-note").textContent = region.note;
    citations(el("overload-region-evidence"), region.evidence);
    if (renderer && ready) {
      setTransparent(id === "acc" || id === "insula");
      renderer.focusRegion(id, side || "left");
      syncView(renderer.getDebugState().currentView);
    }
  }

  function selectMechanism(id, focus) {
    active_mechanism = data.mechanisms.filter(function(item) { return item.id === id; })[0] || data.mechanisms[0];
    var index = data.mechanisms.indexOf(active_mechanism);
    Array.prototype.forEach.call(el("mechanism-tabs").children, function(item) {
      var active = item.dataset.mechanism === active_mechanism.id;
      item.setAttribute("aria-selected", String(active));
      item.tabIndex = active ? 0 : -1;
      if (active && focus) { item.focus(); }
    });
    el("mechanism-number").textContent = "机制 0" + (index + 1) + " / 05";
    el("mechanism-title").textContent = active_mechanism.title;
    el("mechanism-detail").setAttribute("aria-labelledby", "mechanism-tab-" + active_mechanism.id);
    el("mechanism-summary").textContent = active_mechanism.summary;
    clear(el("mechanism-body"));
    var paragraphs = Array.isArray(active_mechanism.body) ? active_mechanism.body : [active_mechanism.body];
    paragraphs.forEach(function(paragraph) { el("mechanism-body").appendChild(text("p", paragraph)); });
    el("mechanism-takeaway").textContent = active_mechanism.takeaway;
    citations(el("mechanism-evidence"), active_mechanism.evidence);
    clear(el("network-regions"));
    el("region-insight").hidden = true;
    var highlight = {};
    active_mechanism.regions.forEach(function(id) {
      var region = region_by_id[id];
      if (!region) { return; }
      highlight[id] = 0.72;
      var control = button(region.name, "region-chip", function() { selectRegion(id, "left"); });
      control.dataset.region = id;
      control.style.setProperty("--region-color", region.color);
      control.setAttribute("aria-pressed", "false");
      el("network-regions").appendChild(control);
    });
    if (renderer && ready) {
      renderer.selectRegion(null);
      renderer.setActivity(highlight);
      setTransparent(false);
      setView("left");
    }
  }

  data.mechanisms.forEach(function(mechanism, index) {
    var control = button("", "mechanism-tab", function() { selectMechanism(mechanism.id); });
    control.dataset.mechanism = mechanism.id;
    control.id = "mechanism-tab-" + mechanism.id;
    control.setAttribute("role", "tab");
    control.setAttribute("aria-controls", "mechanism-detail");
    control.appendChild(text("span", "0" + (index + 1), "step-index"));
    control.appendChild(text("strong", mechanism.title));
    control.appendChild(text("small", mechanism.summary));
    el("mechanism-tabs").appendChild(control);
  });
  el("mechanism-tabs").addEventListener("keydown", function(event) {
    var index = data.mechanisms.indexOf(active_mechanism);
    if (event.key === "ArrowDown" || event.key === "ArrowRight") { index = (index + 1) % data.mechanisms.length; }
    else if (event.key === "ArrowUp" || event.key === "ArrowLeft") { index = (index + data.mechanisms.length - 1) % data.mechanisms.length; }
    else if (event.key === "Home") { index = 0; }
    else if (event.key === "End") { index = data.mechanisms.length - 1; }
    else { return; }
    event.preventDefault();
    selectMechanism(data.mechanisms[index].id, true);
  });

  data.references.forEach(function(reference, index) {
    var card = document.createElement("article");
    card.className = "source-card";
    card.id = "overload-source-" + reference.id;
    card.dataset.reference = reference.id;
    card.appendChild(text("p", String(index + 1).padStart(2, "0") + " / " + reference.authors + " · " + reference.year, "source-meta"));
    card.appendChild(text("h3", reference.title));
    card.appendChild(text("p", reference.journal, "source-meta"));
    card.appendChild(text("span", reference.evidenceType, "evidence-badge"));
    card.appendChild(text("p", reference.finding));
    card.appendChild(text("p", "证据边界：" + reference.limitation, "provenance-note"));
    var link = text("a", "DOI: " + reference.doi + " ↗", "citation-link");
    link.href = reference.url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    card.appendChild(link);
    el("overload-source-list").appendChild(card);
  });

  data.corrections.forEach(function(item) {
    var card = document.createElement("article");
    var sources = document.createElement("div");
    card.className = "correction-card";
    card.appendChild(text("p", item.claim, "claim"));
    card.appendChild(text("p", item.correction, "correction"));
    citations(sources, item.evidence);
    card.appendChild(sources);
    el("correction-cards").appendChild(card);
  });
  data.recommendations.forEach(function(item) {
    var card = document.createElement("article");
    var sources = document.createElement("div");
    card.appendChild(text("h3", item.title));
    card.appendChild(text("p", item.why));
    citations(sources, item.evidence);
    card.appendChild(sources);
    el("recommendation-cards").appendChild(card);
  });

  selectMechanism(data.mechanisms[0].id);
  renderer = window.BrainlightRenderer.create({element: el("overload-brain"), labelsElement: el("overload-labels"), data: data,
    onReady: function() {
      ready = true;
      el("overload-loading").hidden = true;
      selectMechanism(active_mechanism.id);
    },
    onPick: function(id, side) { selectRegion(id, side); },
    onError: function(message) { el("overload-loading").hidden = true; el("overload-error").hidden = false; el("overload-error").textContent = message + " 研究正文与视觉体验仍可使用。"; }
  });
  Array.prototype.forEach.call(document.querySelectorAll("[data-brain-view]"), function(control) {
    control.addEventListener("click", function() { setView(control.dataset.brainView); });
  });
  el("overload-inside").addEventListener("click", function() { setTransparent(!transparent); });
  el("overload-sources-open").addEventListener("click", function() { openSources(null, this); });
  el("overload-sources-close").addEventListener("click", function() { el("overload-sources").close(); });
  el("overload-sources").addEventListener("close", function() { if (source_trigger) { source_trigger.focus({preventScroll: true}); } });
  el("overload-sources").addEventListener("click", function(event) { if (event.target === this) { this.close(); } });

  // A small, explicitly non-diagnostic classification exercise. Its results are
  // behavioral observations, never an estimate of brain activation or overload.
  function shuffle(items) {
    var i, j, value;
    for (i = items.length - 1; i > 0; i--) {
      j = Math.floor(Math.random() * (i + 1));
      value = items[i]; items[i] = items[j]; items[j] = value;
    }
    return items;
  }

  function makeSequence(count, trial_condition) {
    var items = [];
    var rules = [];
    var i;
    for (i = 0; i < count; i++) {
      items.push({shape: i % 2 ? "square" : "circle", color: Math.floor(i / 2) % 2 ? "amber" : "blue"});
      rules.push(trial_condition === "stable" || i % 2 === 0 ? "shape" : "color");
    }
    shuffle(items); shuffle(rules);
    return items.map(function(item, index) { item.rule = rules[index]; return item; });
  }

  function enableResponses(value) {
    el("respond-left").disabled = !value;
    el("respond-right").disabled = !value;
  }

  function showTrial(token) {
    if (!running || token !== run_token) { return; }
    var trial = sequence[trial_index];
    el("trial-progress").textContent = (trial_index + 1) + " / " + sequence.length;
    el("task-status").textContent = trial.rule === "shape" ? "这一题：按形状判断" : "这一题：按颜色判断";
    el("task-status").dataset.rule = trial.rule;
    el("task-target").hidden = false;
    el("task-target").className = "target-" + trial.shape + " target-" + trial.color;
    el("task-target").setAttribute("aria-label", (trial.color === "blue" ? "蓝色" : "杏色") + (trial.shape === "circle" ? "圆形" : "方形"));
    clear(el("task-distractors"));
    if (condition === "distract") {
      distractor_messages.forEach(function(message, index) {
        var card = text("span", message, "distractor-card distractor-" + index);
        el("task-distractors").appendChild(card);
      });
    }
    el("trial-message").textContent = "只回应中央图形；忽略周围提示。";
    window.requestAnimationFrame(function() {
      if (!running || token !== run_token) { return; }
      trial_started = performance.now();
      accepting = true;
      enableResponses(true);
      deadline_timer = setTimeout(function() { recordResponse(null); }, 3500);
    });
  }

  function recordResponse(answer) {
    if (!running || !accepting) { return; }
    var trial = sequence[trial_index];
    var expected = trial.rule === "shape" ? (trial.shape === "circle" ? "left" : "right") : (trial.color === "blue" ? "left" : "right");
    accepting = false;
    clearTimeout(deadline_timer);
    enableResponses(false);
    responses.push({correct: answer === expected, missed: answer === null, rt: answer === null ? null : performance.now() - trial_started,
      rule: trial.rule, switched: trial_index > 0 && trial.rule !== sequence[trial_index - 1].rule});
    el("task-target").hidden = true;
    el("trial-message").textContent = answer === null ? "本题超时，继续下一题。" : (answer === expected ? "符合本题规则。" : "本题应按“" + (trial.rule === "shape" ? "形状" : "颜色") + "”判断。继续观察。" );
    trial_index++;
    if (trial_index >= sequence.length) { finishRound(); }
    else { var token = run_token; gap_timer = setTimeout(function() { showTrial(token); }, 380); }
  }

  function median(values) {
    if (!values.length) { return null; }
    values.sort(function(a, b) { return a - b; });
    var mid = Math.floor(values.length / 2);
    return values.length % 2 ? values[mid] : (values[mid - 1] + values[mid]) / 2;
  }

  function resetControls() {
    el("trial-condition").disabled = false;
    el("trial-length").disabled = false;
    el("trial-start").disabled = false;
    el("trial-reset").disabled = false;
    el("trial-stop").disabled = true;
    el("task-target").hidden = true;
    el("task-idle").hidden = false;
    clear(el("task-distractors"));
    enableResponses(false);
  }

  function finishRound() {
    running = false;
    accepting = false;
    var correct = responses.filter(function(item) { return item.correct; });
    var missed = responses.filter(function(item) { return item.missed; });
    results[condition] = {total: responses.length, correct: correct.length, missed: missed.length,
      errors: responses.length - correct.length - missed.length, median: median(correct.map(function(item) { return item.rt; }))};
    resetControls();
    renderResults();
    el("task-status").textContent = "本轮完成 · " + condition_labels[condition];
    el("trial-message").textContent = "已记录本轮表现。可以换一种条件体验；单轮差异不能解释为神经功能差异。";
  }

  function stopRound(reason) {
    if (!running) { return; }
    running = false;
    accepting = false;
    run_token++;
    clearTimeout(deadline_timer); clearTimeout(gap_timer);
    resetControls();
    el("task-status").textContent = "本轮已停止";
    el("trial-message").textContent = reason || "未完成的这一轮不计入记录。可以准备好后重新开始。";
  }

  function startRound() {
    if (running) { return; }
    condition = el("trial-condition").value;
    sequence = makeSequence(Number(el("trial-length").value), condition);
    responses = [];
    trial_index = 0;
    run_token++;
    running = true;
    accepting = false;
    el("trial-condition").disabled = true;
    el("trial-length").disabled = true;
    el("trial-start").disabled = true;
    el("trial-reset").disabled = true;
    el("trial-stop").disabled = false;
    el("task-idle").hidden = true;
    el("task-status").textContent = "准备：先读规则，再作答";
    el("trial-message").textContent = "即将开始，准备阶段不计时。";
    el("task-field").scrollIntoView({block: "nearest", behavior: "instant"});
    var token = run_token;
    gap_timer = setTimeout(function() { showTrial(token); }, 750);
  }

  function renderResults() {
    clear(el("trial-results"));
    Object.keys(condition_labels).forEach(function(key) {
      var card = document.createElement("article");
      var result = results[key];
      card.className = "result-card";
      card.dataset.condition = key;
      card.appendChild(text("h4", condition_labels[key]));
      if (!result) { card.appendChild(text("p", "尚未完成", "empty-result")); }
      else {
        card.appendChild(text("strong", Math.round(100 * result.correct / result.total) + "%", "result-primary"));
        card.appendChild(text("p", "正确 " + result.correct + " / " + result.total + " · 误答 " + result.errors + " · 超时 " + result.missed));
        card.appendChild(text("p", "正确反应中位数：" + (result.median === null ? "—" : Math.round(result.median) + " ms")));
      }
      el("trial-results").appendChild(card);
    });
  }

  el("trial-start").addEventListener("click", startRound);
  el("trial-stop").addEventListener("click", function() { stopRound(); });
  el("respond-left").addEventListener("click", function() { recordResponse("left"); });
  el("respond-right").addEventListener("click", function() { recordResponse("right"); });
  el("trial-reset").addEventListener("click", function() { results = {}; renderResults(); el("trial-message").textContent = "本页面的体验记录已清空。"; });
  el("trial-length").addEventListener("change", function() { el("trial-progress").textContent = "0 / " + this.value; });
  document.addEventListener("keydown", function(event) {
    if (!accepting || event.repeat || el("overload-sources").open) { return; }
    if (/^(INPUT|SELECT|TEXTAREA)$/.test(event.target.tagName)) { return; }
    if (event.code === "KeyF" || event.code === "KeyJ") { event.preventDefault(); recordResponse(event.code === "KeyF" ? "left" : "right"); }
  });
  document.addEventListener("visibilitychange", function() {
    if (document.hidden) { stopRound("切换标签页中断了计时，本轮未计入记录。返回后可重新开始。" ); }
  });
  window.addEventListener("pagehide", function() { stopRound(); renderer.destroy(); });
  renderResults();
  window.Overload = {data: data, renderer: renderer, getState: function() {
    return {ready: ready, mechanism: active_mechanism.id, running: running, accepting: accepting, trialIndex: trial_index,
      condition: condition, currentTrial: running ? sequence[trial_index] : null, responses: responses.slice(), results: results};
  }};
})();
