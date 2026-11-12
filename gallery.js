// Graphics gallery + lightbox (used by index.html and portfolio.html)
(function () {
  var designs = window.GRAPHICS || [];
  var grid = document.getElementById("gallery-grid");
  var filterBox = document.getElementById("gallery-filters");
  var lb = document.getElementById("lightbox");
  var lbImg = lb.querySelector("img"), lbTitle = lb.querySelector("figcaption b"), lbType = lb.querySelector("figcaption span");
  var shown = [], current = 0, lastFocus = null;
  if (!grid || !lb) return;
  if (!designs.length) document.getElementById("graphics").hidden = true;

  designs.forEach(function (d, i) {
    var b = document.createElement("button");
    b.type = "button"; b.className = "tile"; b.dataset.type = d.type; b.dataset.i = i;
    b.setAttribute("aria-label", "View " + d.title + " " + d.type.toLowerCase());
    b.innerHTML = '<img loading="lazy" decoding="async" width="720" height="720" alt=""><span class="tile-cap"><b></b><small></small></span><span class="tile-plus" aria-hidden="true">+</span>';
    b.querySelector("img").src = d.image + "-sm.webp";
    b.querySelector("img").alt = d.title + " " + d.type.toLowerCase() + " design by Tech Ease";
    b.querySelector("b").textContent = d.title;
    b.querySelector("small").textContent = d.type;
    b.addEventListener("click", function () { open(i); });
    grid.appendChild(b);
  });

  var types = designs.reduce(function (a, d) { if (a.indexOf(d.type) < 0) a.push(d.type); return a; }, []);
  if (types.length > 1) {
    ["All"].concat(types).forEach(function (t, i) {
      var c = document.createElement("button");
      c.type = "button"; c.className = "chip" + (i === 0 ? " is-active" : "");
      c.setAttribute("aria-pressed", i === 0);
      var n = t === "All" ? designs.length : designs.filter(function (d) { return d.type === t; }).length;
      c.innerHTML = "<span></span><sup>" + n + "</sup>";
      c.querySelector("span").textContent = t === "All" ? "All" : (t === "Packaging" ? t : t + "s");
      c.addEventListener("click", function () {
        filterBox.querySelectorAll(".chip").forEach(function (x) { x.classList.toggle("is-active", x === c); x.setAttribute("aria-pressed", x === c); });
        grid.querySelectorAll(".tile").forEach(function (tile) { tile.hidden = t !== "All" && tile.dataset.type !== t; });
        if (window.ScrollTrigger) ScrollTrigger.refresh();
      });
      filterBox.appendChild(c);
    });
  }

  function visible() {
    return Array.prototype.filter.call(grid.querySelectorAll(".tile"), function (t) { return !t.hidden; }).map(function (t) { return +t.dataset.i; });
  }
  function show(k) {
    current = (k + shown.length) % shown.length;
    var d = designs[shown[current]];
    lbImg.src = d.image + "-lg.webp";
    lbImg.alt = d.title + " " + d.type.toLowerCase() + " design by Tech Ease";
    lbTitle.textContent = d.title;
    lbType.textContent = d.type + " · " + (current + 1) + " / " + shown.length;
  }
  function open(i) {
    shown = visible(); lastFocus = document.activeElement;
    show(shown.indexOf(i));
    lb.hidden = false;
    requestAnimationFrame(function () { lb.classList.add("is-open"); });
    document.documentElement.classList.add("lb-open");
    if (window.lenis) lenis.stop();
    lb.querySelector(".lb-close").focus();
  }
  function close() {
    lb.classList.remove("is-open");
    document.documentElement.classList.remove("lb-open");
    if (window.lenis) lenis.start();
    setTimeout(function () { lb.hidden = true; }, 300);
    if (lastFocus) lastFocus.focus({ preventScroll: true });
  }
  lb.querySelector(".lb-close").addEventListener("click", close);
  lb.querySelector(".lb-prev").addEventListener("click", function () { show(current - 1); });
  lb.querySelector(".lb-next").addEventListener("click", function () { show(current + 1); });
  lb.addEventListener("click", function (e) { if (e.target === lb) close(); });
  document.addEventListener("keydown", function (e) {
    if (lb.hidden) return;
    if (e.key === "Escape") close();
    else if (e.key === "ArrowLeft") show(current - 1);
    else if (e.key === "ArrowRight") show(current + 1);
    else if (e.key === "Tab") {
      var f = lb.querySelectorAll("button"), first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
  var tx = null;
  lb.addEventListener("touchstart", function (e) { tx = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener("touchend", function (e) {
    if (tx === null) return;
    var dx = e.changedTouches[0].clientX - tx; tx = null;
    if (Math.abs(dx) > 50) show(current + (dx < 0 ? 1 : -1));
  });

})();
