(function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  // Loader
  function ready() { document.body.classList.remove("is-loading"); }
  window.addEventListener("load", function () { setTimeout(ready, 300); });
  setTimeout(ready, 2500);

  // Portfolio
  var labels = { graphics: "Graphics", websites: "Website", webapps: "Web App", mobile: "Mobile App", seo: "SEO" };
  var grid = document.getElementById("work-grid");
  function render(filter) {
    grid.innerHTML = "";
    var i = 0;
    (window.WORK || []).forEach(function (item) {
      if (filter !== "all" && item.category !== filter) return;
      var el = document.createElement(item.link ? "a" : "div");
      el.className = "work tilt";
      el.style.animationDelay = (i++ * 70) + "ms";
      if (item.link) { el.href = item.link; el.target = "_blank"; el.rel = "noopener"; }
      if (item.image) {
        var img = document.createElement("img");
        img.src = item.image; img.alt = item.title; img.loading = "lazy";
        el.appendChild(img);
      } else {
        el.innerHTML = '<div class="work-placeholder"><span>Coming soon</span></div>';
      }
      var info = document.createElement("div");
      info.className = "work-info";
      info.innerHTML = "<small></small><h3></h3>";
      info.querySelector("small").textContent = labels[item.category] || item.category;
      info.querySelector("h3").textContent = item.title;
      el.appendChild(info);
      grid.appendChild(el);
      bindTilt(el);
    });
  }
  document.querySelectorAll(".filter").forEach(function (btn) {
    btn.addEventListener("click", function () {
      document.querySelectorAll(".filter").forEach(function (b) { b.classList.remove("is-active"); });
      btn.classList.add("is-active");
      render(btn.dataset.filter);
    });
  });

  // 3D tilt + spotlight
  function bindTilt(el) {
    if (!finePointer || reduce) return;
    el.addEventListener("mousemove", function (e) {
      var r = el.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      el.style.transform = "rotateX(" + ((0.5 - y) * 12) + "deg) rotateY(" + ((x - 0.5) * 12) + "deg) translateZ(0)";
      el.style.setProperty("--mx", x * 100 + "%");
      el.style.setProperty("--my", y * 100 + "%");
    });
    el.addEventListener("mouseleave", function () { el.style.transform = ""; });
  }
  document.querySelectorAll(".tilt").forEach(bindTilt);
  render("all");

  // Mobile menu
  var menuBtn = document.querySelector(".menu-btn");
  var menu = document.getElementById("menu");
  menuBtn.addEventListener("click", function () {
    var open = menu.classList.toggle("open");
    menuBtn.setAttribute("aria-expanded", open);
  });
  menu.querySelectorAll("a").forEach(function (a) {
    a.addEventListener("click", function () { menu.classList.remove("open"); menuBtn.setAttribute("aria-expanded", false); });
  });

  // Scroll reveal
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (!en.isIntersecting) return;
      var el = en.target;
      var siblings = Array.prototype.indexOf.call(el.parentNode.children, el);
      el.style.transitionDelay = Math.min(siblings, 5) * 80 + "ms";
      el.classList.add("is-in");
      setTimeout(function () { el.style.transitionDelay = ""; }, 1200);
      io.unobserve(el);
    });
  }, { threshold: 0.12 });
  document.querySelectorAll(".reveal").forEach(function (el) { io.observe(el); });

  // Counters
  var co = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (!en.isIntersecting) return;
      var el = en.target, end = +el.dataset.count, suf = el.dataset.suffix || "", t0 = null;
      function step(t) {
        if (!t0) t0 = t;
        var p = Math.min((t - t0) / 1400, 1), v = Math.round(end * (1 - Math.pow(1 - p, 3)));
        el.textContent = v + suf;
        if (p < 1) requestAnimationFrame(step);
      }
      reduce ? (el.textContent = end + suf) : requestAnimationFrame(step);
      co.unobserve(el);
    });
  }, { threshold: 0.5 });
  document.querySelectorAll("[data-count]").forEach(function (el) { co.observe(el); });

  // Custom cursor + magnetic buttons
  if (finePointer && !reduce) {
    var dot = document.querySelector(".cursor"), ring = document.querySelector(".cursor-ring");
    var mx = 0, my = 0, rx = 0, ry = 0;
    document.addEventListener("mousemove", function (e) {
      mx = e.clientX; my = e.clientY;
      dot.style.transform = "translate(" + mx + "px," + my + "px) translate(-50%,-50%)";
      document.body.classList.add("has-cursor");
    });
    (function loop() {
      rx += (mx - rx) * 0.15; ry += (my - ry) * 0.15;
      ring.style.transform = "translate(" + rx + "px," + ry + "px) translate(-50%,-50%)";
      requestAnimationFrame(loop);
    })();
    document.addEventListener("mouseover", function (e) {
      ring.classList.toggle("is-hover", !!e.target.closest("a, button, .tilt, input, select, textarea"));
    });
    document.querySelectorAll(".magnetic").forEach(function (b) {
      b.addEventListener("mousemove", function (e) {
        var r = b.getBoundingClientRect();
        b.style.transform = "translate(" + (e.clientX - r.left - r.width / 2) * 0.25 + "px," + (e.clientY - r.top - r.height / 2) * 0.35 + "px)";
      });
      b.addEventListener("mouseleave", function () { b.style.transform = ""; });
    });
  }

  document.getElementById("year").textContent = new Date().getFullYear();
})();
