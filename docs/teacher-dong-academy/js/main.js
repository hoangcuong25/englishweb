/* ==========================================================
   Teacher Dong Academy — main.js
   Modules: render, nav, language, filter, dialog, form, scroll effects
   Phụ thuộc: js/data.js, js/i18n.js
   ========================================================== */
(function () {
  "use strict";

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const t = I18N.t;
  const cat = (id) => CATEGORIES.find((c) => c.id === id) || {};
  const catName = (id) => t("cat." + id + ".title");
  const ic = (name) => `<svg class="ic" aria-hidden="true"><use href="#i-${name}"/></svg>`;
  const tile = (name, tone) => `<span class="tile t-${tone || "blue"}">${ic(name)}</span>`;

  let currentFilter = "all";

  /* ---------- Render ---------- */
  function renderCategories() {
    $("#category-grid").innerHTML = CATEGORIES.map((c, i) => `
      <li><button type="button" class="card cat-card" data-filter="${c.id}">
        <span class="cat-top">${tile(c.icon, c.tone)}<span class="num" aria-hidden="true">${String(i + 1).padStart(2, "0")}</span></span>
        <h3>${esc(t("cat." + c.id + ".title"))}</h3>
        <p>${esc(t("cat." + c.id + ".desc"))}</p>
        <span class="cat-link">${esc(t("cat.view"))} <span class="arrow-dot">${ic("arrow")}</span></span>
      </button></li>`).join("");
    $("#category-grid").classList.add("stagger");

    $("#footer-cats").innerHTML = CATEGORIES.map((c) =>
      `<li><a href="#courses" data-filter="${c.id}">${esc(catName(c.id))}</a></li>`).join("");
  }

  function renderInterestOptions() {
    const sel = $("#cf-interest");
    const prev = sel.value;
    sel.innerHTML = `<option value="">${esc(t("form.none"))}</option>` +
      CATEGORIES.map((c) => `<option value="${c.id}">${esc(catName(c.id))}</option>`).join("");
    sel.value = prev;
  }

  function renderFilters() {
    const items = [{ id: "all", label: t("filter.all") }, ...CATEGORIES.map((c) => ({ id: c.id, label: catName(c.id) }))];
    $("#course-filters").innerHTML = items.map((c) =>
      `<button type="button" class="chip" data-filter="${c.id}" aria-pressed="${c.id === currentFilter}">${esc(c.label)}</button>`).join("");
  }

  function renderCourses() {
    const list = COURSES.filter((c) => currentFilter === "all" || c.cat === currentFilter);
    const grid = $("#course-grid");
    grid.classList.remove("stagger", "in");
    grid.innerHTML = list.length ? list.map((c) => `
      <li><article class="card course-card" data-cat="${c.cat}">
        <div class="course-thumb" aria-hidden="true"><span class="sample-badge">${esc(t("badge.sample"))}</span><span class="thumb-icon">${ic(cat(c.cat).icon)}</span></div>
        <div class="course-body">
          <p class="course-meta">${esc(catName(c.cat))}</p>
          <h3>${esc(t("course." + c.id + ".title"))}</h3>
          <p>${esc(t("course." + c.id + ".desc"))}</p>
          <ul class="course-facts">
            <li>${ic("users")}${esc(t("level." + c.level))}</li>
            <li>${ic("clock")}${esc(t("course.duration"))}</li>
            <li>${ic("monitor")}${esc(t("course.format"))}</li>
          </ul>
          <button type="button" class="link-btn" data-open="course:${c.id}">${esc(t("course.detail"))} ${ic("arrow")}</button>
        </div>
      </article></li>`).join("") : `<li>${esc(t("course.empty"))}</li>`;
    grid.classList.add("stagger");
    requestAnimationFrame(() => grid.classList.add("in"));
  }

  function renderResources() {
    $("#resource-grid").innerHTML = RESOURCES.map((r) => `
      <li><button type="button" class="res-card" data-open="resource:${r.id}">
        <span class="res-icon">${ic(r.icon)}</span>
        <span class="res-text"><h3>${esc(t("res." + r.id + ".title"))}</h3><p>${esc(t("res." + r.id + ".desc"))}</p></span>
        <span class="arrow-dot">${ic("arrow")}</span>
      </button></li>`).join("");
    $("#resource-grid").classList.add("stagger");
  }

  function renderPosts() {
    $("#blog-grid").innerHTML = POSTS.map((p) => `
      <li><article class="card blog-card">
        <div class="blog-cover t-${p.tone}" aria-hidden="true"><span class="cover-icon">${ic(p.icon)}</span></div>
        <div class="blog-body">
          <span class="tag">${esc(t("post." + p.id + ".tag"))}</span>
          <h3>${esc(t("post." + p.id + ".title"))}</h3>
          <p>${esc(t("post." + p.id + ".excerpt"))}</p>
          <button type="button" class="link-btn" data-open="post:${p.id}">${esc(t("blog.more"))} ${ic("arrow")}</button>
        </div>
      </article></li>`).join("");
    $("#blog-grid").classList.add("stagger");
  }

  function renderAll() {
    renderCategories();
    renderInterestOptions();
    renderFilters();
    renderCourses();
    renderResources();
    renderPosts();
  }

  /* ---------- Navigation ---------- */
  function initNav() {
    const header = $(".site-header");
    const toggle = $(".nav-toggle");
    const nav = $("#primary-nav");
    const syncToggle = () => {
      const open = nav.classList.contains("open");
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", t(open ? "nav.menuClose" : "nav.menuOpen"));
    };
    const setOpen = (open) => { nav.classList.toggle("open", open); syncToggle(); };
    toggle.addEventListener("click", () => setOpen(!nav.classList.contains("open")));
    nav.addEventListener("click", (e) => { if (e.target.closest("a")) setOpen(false); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") setOpen(false); });
    document.addEventListener("click", (e) => {
      if (nav.classList.contains("open") && !e.target.closest(".header-inner")) setOpen(false);
    });
    I18N.onChange(syncToggle);
    syncToggle();

    const onScroll = () => {
      header.classList.toggle("scrolled", window.scrollY > 8);
      $("#to-top").hidden = window.scrollY < 600;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    $("#to-top").addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

    // Active link highlight
    const links = $$('.primary-nav a[href^="#"]:not(.btn)');
    const map = new Map(links.map((a) => [a.getAttribute("href").slice(1), a]));
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting && map.has(en.target.id)) {
          links.forEach((l) => l.classList.remove("active"));
          map.get(en.target.id).classList.add("active");
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    map.forEach((_, id) => { const s = document.getElementById(id); if (s) io.observe(s); });
  }

  /* ---------- Language ---------- */
  function initLanguage() {
    $("#lang-select").addEventListener("change", (e) => I18N.set(e.target.value));
    I18N.onChange(renderAll);
  }

  /* ---------- Filtering ---------- */
  function applyFilter(filter) {
    currentFilter = filter;
    $$("#course-filters .chip").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.filter === filter)));
    renderCourses();
  }
  function initFilter() {
    document.addEventListener("click", (e) => {
      const trigger = e.target.closest("[data-filter]");
      if (!trigger) return;
      applyFilter(trigger.dataset.filter);
      if (!trigger.closest("#course-filters")) {
        e.preventDefault();
        document.getElementById("courses").scrollIntoView({ behavior: "smooth" });
      }
    });
  }

  /* ---------- Dialog ---------- */
  function initDialog() {
    const dlg = $("#detail-dialog");
    let lastFocus = null;
    const KINDS = {
      course:   { list: COURSES,   kicker: "courses.eyebrow", title: (i) => t("course." + i.id + ".title"), body: (i) => t("course." + i.id + ".desc") },
      resource: { list: RESOURCES, kicker: "nav.resources",   title: (i) => t("res." + i.id + ".title"),    body: (i) => t("res." + i.id + ".desc") },
      post:     { list: POSTS,     kicker: "dlg.post",        title: (i) => t("post." + i.id + ".title"),   body: (i) => t("post." + i.id + ".excerpt") }
    };

    document.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-open]");
      if (!btn) return;
      const [type, id] = btn.dataset.open.split(":");
      const kind = KINDS[type];
      const item = kind && kind.list.find((x) => x.id === id);
      if (!item) return;
      lastFocus = btn;
      $("#dlg-kicker").textContent = t(kind.kicker);
      $("#dlg-title").textContent = kind.title(item);
      $("#dlg-body").textContent = kind.body(item);
      dlg.dataset.interest = type === "course" ? item.cat : "";
      dlg.showModal();
    });

    dlg.addEventListener("click", (e) => { if (e.target === dlg) dlg.close(); });
    dlg.addEventListener("close", () => { if (lastFocus) lastFocus.focus(); });
    $("#dlg-cta").addEventListener("click", () => {
      if (dlg.dataset.interest) $("#cf-interest").value = dlg.dataset.interest;
      dlg.close();
    });
  }

  /* ---------- Contact form (mailto) ---------- */
  function initForm() {
    const form = $("#contact-form");
    const setErr = (field, key) => {
      $("#err-" + field).textContent = key ? t(key) : "";
      $("#cf-" + field).classList.toggle("invalid", Boolean(key));
      $("#cf-" + field).setAttribute("aria-invalid", String(Boolean(key)));
    };
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = form.name.value.trim();
      const email = form.email.value.trim();
      let ok = true;
      setErr("name", ""); setErr("email", "");
      if (!name) { setErr("name", "form.errName"); ok = false; }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setErr("email", "form.errEmail"); ok = false; }
      if (!ok) { (form.querySelector(".invalid") || form.name).focus(); return; }

      const interest = form.interest.value ? catName(form.interest.value) : t("form.none");
      const body = [
        t("form.name") + ": " + name,
        t("form.email") + ": " + email,
        t("form.interest") + ": " + interest,
        "",
        form.message.value.trim()
      ].join("\n");
      window.location.href = "mailto:" + SITE.contactEmail +
        "?subject=" + encodeURIComponent(t("mail.subject")) + "&body=" + encodeURIComponent(body);
    });
    // Xóa thông báo lỗi cũ khi đổi ngôn ngữ để không bị lẫn ngôn ngữ
    I18N.onChange(() => { setErr("name", ""); setErr("email", ""); });
  }

  /* ---------- Scroll reveal ---------- */
  function initReveal() {
    const targets = $$(".reveal, .stagger");
    if (!("IntersectionObserver" in window)) { targets.forEach((t) => t.classList.add("in")); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
    }, { threshold: 0.12 });
    targets.forEach((el) => io.observe(el));
  }

  /* ---------- Init ---------- */
  document.addEventListener("DOMContentLoaded", () => {
    I18N.init();          // áp ngôn ngữ đã lưu cho phần chữ tĩnh trong HTML
    renderAll();          // dựng phần nội dung động theo ngôn ngữ hiện tại
    $("#year").textContent = new Date().getFullYear();
    initNav();
    initLanguage();
    initFilter();
    initDialog();
    initForm();
    initReveal();
  });
})();
