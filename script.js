(function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  var hasGsap = window.gsap && window.ScrollTrigger;

  /* ---------- Portfolio cards ---------- */
  var labels = { graphics: "Graphics", websites: "Website", webapps: "Web App", mobile: "Mobile App", seo: "SEO" };
  var mocks = {
    graphics: '<div class="mock mock-graphics"><b>Your<em>brand</em></b><i></i></div>',
    websites: '<div class="mock mock-web"><div class="win"><div class="bar"><i></i><i></i><i></i></div><div class="pg"><b>Built to <em>grow</em><br>your business.</b><s></s><s style="width:45%"></s><u>Get started</u></div></div></div>',
    webapps: '<div class="mock mock-app"><div class="side"><s></s><s></s><s></s><s></s><s></s></div><div class="main"><div class="kpis"><div>₦2.4m<small>Revenue</small></div><div>184<small>Bookings</small></div><div>+32%<small>Growth</small></div></div><div class="chart"><i style="height:40%"></i><i style="height:55%"></i><i style="height:48%"></i><i style="height:70%"></i><i style="height:62%"></i><i style="height:85%"></i><i style="height:74%"></i><i style="height:95%"></i></div></div></div>',
    mobile: '<div class="mock mock-mobile"><div class="ph"><b>Book a slot</b><s></s><s></s><s></s></div><div class="ph"><b>Confirmed ✓</b><s></s><s></s></div></div>',
    seo: '<div class="mock mock-seo"><div class="q">🔍 best web designer near me</div><div class="graph"><svg viewBox="0 0 100 60" preserveAspectRatio="none"><path d="M0 55 L15 50 L30 46 L45 38 L60 30 L75 18 L100 4" fill="none" stroke="#e3241b" stroke-width="1.4" vector-effect="non-scaling-stroke"/></svg><b>#1<small>on Google</small></b></div></div>'
  };
  var track = document.getElementById("work-track");
  (window.WORK || []).forEach(function (item) {
    var el = document.createElement(item.link ? "a" : "article");
    el.className = "project";
    if (item.link) { el.href = item.link; el.target = "_blank"; el.rel = "noopener"; }
    var media = document.createElement("div");
    media.className = "project-media";
    if (item.image) {
      var img = document.createElement("img");
      img.src = item.image; img.alt = item.title; img.loading = "lazy";
      media.appendChild(img);
    } else {
      media.innerHTML = mocks[item.category] || mocks.graphics;
    }
    var meta = document.createElement("div");
    meta.className = "project-meta";
    meta.innerHTML = "<h3></h3><span></span>";
    meta.querySelector("h3").textContent = item.title;
    meta.querySelector("span").textContent = (labels[item.category] || item.category) + (item.tag ? " · " + item.tag : "");
    el.appendChild(media); el.appendChild(meta);
    track.appendChild(el);
  });

  /* ---------- Form: combine chosen services ---------- */
  var form = document.querySelector(".form");
  form.addEventListener("submit", function () {
    var vals = Array.prototype.map.call(form.querySelectorAll("[data-service]:checked"), function (c) { return c.value; });
    document.getElementById("services-field").value = vals.join(", ");
  });

  /* ---------- Menu ---------- */
  var menuBtn = document.querySelector(".menu-btn"), menu = document.getElementById("menu");
  function setMenu(open) {
    menu.classList.toggle("open", open);
    menuBtn.setAttribute("aria-expanded", open);
    if (window.lenis) open ? lenis.stop() : lenis.start();
  }
  menuBtn.addEventListener("click", function () { setMenu(!menu.classList.contains("open")); });

  document.getElementById("year").textContent = new Date().getFullYear();

  /* ---------- Smooth anchor links ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener("click", function (e) {
      var id = a.getAttribute("href");
      var target = id === "#top" ? 0 : document.querySelector(id);
      if (target === null) return;
      e.preventDefault();
      setMenu(false);
      if (window.lenis) lenis.scrollTo(target, { duration: 1.6 });
      else if (target === 0) window.scrollTo({ top: 0, behavior: "smooth" });
      else target.scrollIntoView({ behavior: "smooth" });
    });
  });

  /* ---------- Cursor + magnetic ---------- */
  if (fine && !reduce) {
    var cur = document.querySelector(".cursor"), cx = 0, cy = 0, x = 0, y = 0;
    document.addEventListener("mousemove", function (e) { cx = e.clientX; cy = e.clientY; cur.classList.add("is-on"); });
    document.addEventListener("mouseleave", function () { cur.classList.remove("is-on"); });
    (function loop() { x += (cx - x) * 0.2; y += (cy - y) * 0.2; cur.style.transform = "translate(" + x + "px," + y + "px)"; requestAnimationFrame(loop); })();
    document.addEventListener("mouseover", function (e) {
      var t = e.target;
      cur.classList.toggle("is-view", !!t.closest(".project"));
      cur.classList.toggle("is-link", !t.closest(".project") && !!t.closest("a, button, label, input, textarea"));
    });
    document.querySelectorAll(".magnetic").forEach(function (b) {
      b.addEventListener("mousemove", function (e) {
        var r = b.getBoundingClientRect();
        b.style.transform = "translate(" + (e.clientX - r.left - r.width / 2) * 0.3 + "px," + (e.clientY - r.top - r.height / 2) * 0.4 + "px)";
      });
      b.addEventListener("mouseleave", function () { b.style.transition = "transform .6s cubic-bezier(.16,1,.3,1)"; b.style.transform = ""; setTimeout(function () { b.style.transition = ""; }, 600); });
    });
  }

  /* ---------- Without GSAP: show everything ---------- */
  function finishLoad() { document.body.classList.remove("is-loading"); var l = document.querySelector(".loader"); if (l) l.style.display = "none"; }
  if (!hasGsap) { finishLoad(); return; }

  gsap.registerPlugin(ScrollTrigger);
  if (window.SplitText) gsap.registerPlugin(SplitText);

  /* ---------- Smooth scroll ---------- */
  if (!reduce && window.Lenis) {
    window.lenis = new Lenis({ lerp: 0.09, smoothWheel: true });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
    lenis.stop();
  }

  /* ---------- Nav hide on scroll down ---------- */
  var nav = document.querySelector(".nav"), lastY = 0;
  ScrollTrigger.create({ onUpdate: function (self) {
    var y = self.scroll();
    nav.classList.toggle("is-hidden", y > 200 && y > lastY && !menu.classList.contains("open"));
    lastY = y;
  }});

  /* ---------- Split helpers ---------- */
  function splitLines(el) {
    if (!window.SplitText) return null;
    return SplitText.create(el, { type: "lines", linesClass: "line", mask: "lines" });
  }

  /* ---------- Intro ---------- */
  var heroSplit = splitLines(document.querySelector(".split-hero"));
  var heroLines = heroSplit ? heroSplit.lines : document.querySelectorAll(".hero-title .row");
  gsap.set(heroLines, { yPercent: 110 });
  gsap.set(".hero-side, .hero-meta", { autoAlpha: 0, y: 20 });

  var counter = { v: 0 }, countEl = document.getElementById("count");
  var intro = gsap.timeline({ paused: true });
  intro
    .to(counter, { v: 100, duration: reduce ? 0.2 : 1.6, ease: "power2.inOut", onUpdate: function () { countEl.textContent = Math.round(counter.v); } })
    .to(".loader-count span", { yPercent: -110, duration: 0.6, ease: "power3.in" })
    .to(".loader", { clipPath: "inset(0 0 100% 0)", duration: 1, ease: "expo.inOut" }, "-=0.1")
    .add(function () { document.body.classList.remove("is-loading"); if (window.lenis) lenis.start(); window.dispatchEvent(new Event("te:intro")); }, "-=0.6")
    .to(heroLines, { yPercent: 0, duration: 1.3, stagger: 0.1, ease: "expo.out" }, "-=0.55")
    .to(".hero-side, .hero-meta", { autoAlpha: 1, y: 0, duration: 1, stagger: 0.08, ease: "power3.out" }, "-=1")
    .set(".loader", { display: "none" });

  var started = false;
  function go() { if (started) return; started = true; intro.play(); }
  if (document.readyState === "complete") go(); else window.addEventListener("load", go);
  setTimeout(go, 3000);

  /* ---------- Section headings ---------- */
  document.querySelectorAll(".split").forEach(function (el) {
    var s = splitLines(el); if (!s) return;
    gsap.from(s.lines, { yPercent: 110, duration: 1.2, stagger: 0.08, ease: "expo.out", scrollTrigger: { trigger: el, start: "top 88%" } });
  });

  document.querySelectorAll(".fade-up:not(.hero-side)").forEach(function (el) {
    gsap.from(el, { y: 40, autoAlpha: 0, duration: 1.1, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 90%" } });
  });

  /* ---------- Statement words light up ---------- */
  var st = document.getElementById("statement");
  if (window.SplitText) {
    var sw = SplitText.create(st, { type: "words", wordsClass: "word" });
    gsap.to(sw.words, { opacity: 1, stagger: 0.1, ease: "none", scrollTrigger: { trigger: st, start: "top 80%", end: "bottom 50%", scrub: true } });
  }

  /* ---------- Stacked service cards ---------- */
  var cards = gsap.utils.toArray(".svc");
  cards.forEach(function (card, i) {
    if (i === cards.length - 1) return;
    gsap.to(card, {
      scale: 0.94, filter: "brightness(0.6)", ease: "none",
      scrollTrigger: { trigger: cards[i + 1], start: "top 70%", end: "top 15%", scrub: true }
    });
  });
  gsap.utils.toArray(".svc-art").forEach(function (art) {
    gsap.fromTo(art, { rotate: -8, y: 40 }, { rotate: 8, y: -40, ease: "none", scrollTrigger: { trigger: art.parentNode, start: "top bottom", end: "bottom top", scrub: true } });
  });

  /* ---------- Horizontal work (desktop) ---------- */
  var mm = gsap.matchMedia();
  mm.add("(min-width: 861px)", function () {
    var pin = document.querySelector(".work-pin");
    function dist() { return Math.max(0, track.scrollWidth - window.innerWidth); }
    gsap.to(track, {
      x: function () { return -dist(); }, ease: "none",
      scrollTrigger: {
        trigger: ".work", start: "top top", end: function () { return "+=" + dist(); },
        pin: true, scrub: 1, invalidateOnRefresh: true,
        onUpdate: function (self) { gsap.set(".work-progress span", { scaleX: self.progress }); }
      }
    });
    gsap.utils.toArray(".project-media > img, .project-media > .mock").forEach(function (m) { gsap.set(m, { scale: 1.12 }); });
  });
  mm.add("(max-width: 860px)", function () {
    gsap.utils.toArray(".project").forEach(function (p) {
      gsap.from(p, { y: 60, autoAlpha: 0, duration: 1.1, ease: "power3.out", scrollTrigger: { trigger: p, start: "top 90%" } });
    });
  });

  /* ---------- Marquee driven by scroll ---------- */
  var bm = document.querySelector(".bm-track");
  var loop = gsap.to(bm, { xPercent: -50, duration: 22, ease: "none", repeat: -1 });
  ScrollTrigger.create({ trigger: ".big-marquee", start: "top bottom", end: "bottom top", onUpdate: function (self) {
    gsap.to(loop, { timeScale: self.direction * (1 + Math.min(Math.abs(self.getVelocity()) / 400, 4)), duration: 0.3, overwrite: true });
  }});

  /* ---------- Process lines ---------- */
  gsap.from(".step-line", { scaleX: 0, duration: 1.4, stagger: 0.15, ease: "expo.out", scrollTrigger: { trigger: ".steps", start: "top 80%" } });
  gsap.from(".step h3, .step p, .step-num", { y: 30, autoAlpha: 0, duration: 1, stagger: 0.05, ease: "power3.out", scrollTrigger: { trigger: ".steps", start: "top 80%" } });

  /* ---------- About image ---------- */
  gsap.from(".about-img", { clipPath: "inset(100% 0 0 0 round 26px)", duration: 1.6, ease: "expo.inOut", scrollTrigger: { trigger: ".about", start: "top 75%" } });
  gsap.fromTo(".about-img img", { yPercent: -10 }, { yPercent: 0, ease: "none", scrollTrigger: { trigger: ".about", start: "top bottom", end: "bottom top", scrub: true } });

  /* ---------- Counters ---------- */
  document.querySelectorAll("[data-count]").forEach(function (el) {
    var o = { v: 0 }, suf = el.dataset.suffix || "";
    gsap.to(o, { v: +el.dataset.count, duration: 2, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 90%" }, onUpdate: function () { el.textContent = Math.round(o.v) + suf; } });
  });

  /* ---------- Footer word ---------- */
  gsap.from(".footer-word", { yPercent: 40, opacity: 0, duration: 1.4, ease: "expo.out", scrollTrigger: { trigger: ".footer", start: "top 85%" } });

  window.addEventListener("load", function () { ScrollTrigger.refresh(); });
})();
