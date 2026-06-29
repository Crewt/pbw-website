// PBW Admin — shell: login, view switching, section nav, shared helpers.
// Exposes window.AdminUI for the per-section scripts to use.
(function () {
  if (!window.PBW) {
    document.body.innerHTML = '<div style="max-width:480px;margin:80px auto;padding:24px;background:#fdecec;border:1px solid #e0c2c2;border-radius:8px;font-family:system-ui;color:#9b1f1f;"><h2 style="margin:0 0 8px;">Skript konnte nicht geladen werden</h2><p>Die Datei <code>js/admin-store.js</code> wurde nicht gefunden oder enthält einen Fehler. Bitte Seite neu laden (Strg/Cmd + Shift + R).</p></div>';
    return;
  }

  const { Auth } = window.PBW;

  // ---------- shared helpers ----------
  function escapeHtml(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])); }
  function escapeAttr(s) { return String(s == null ? "" : s).replace(/[<>"]/g, c => ({ "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])); }
  function slugify(s) { return String(s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""); }

  let toastTimer;
  function toast(msg) {
    const t = document.getElementById("toast");
    if (!t) return;
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove("show"), 2200);
  }

  // image/file uploader: uploads the chosen file to /api/uploads and keeps the
  // returned web path (e.g. "/uploads/ab12….jpg") as its value.
  function bindUploader(opts) {
    // opts: { input, preview, uploader, clearBtn, placeholder }
    let data = "";
    function render() {
      if (data) {
        opts.preview.innerHTML = '<img src="' + escapeAttr(data) + '" alt="">';
        if (opts.uploader) opts.uploader.classList.add("has-image");
      } else {
        opts.preview.textContent = opts.placeholder || "Kein Bild";
        if (opts.uploader) opts.uploader.classList.remove("has-image");
      }
    }
    opts.input.addEventListener("change", async () => {
      const file = opts.input.files && opts.input.files[0];
      if (!file) return;
      try {
        if (opts.uploader) opts.uploader.classList.add("uploading");
        const r = await window.PBW.uploadFile(file);
        data = r.url;
        render();
      } catch (e) {
        toast(e.message || "Upload fehlgeschlagen");
      } finally {
        if (opts.uploader) opts.uploader.classList.remove("uploading");
        opts.input.value = "";
      }
    });
    if (opts.clearBtn) opts.clearBtn.addEventListener("click", () => { opts.input.value = ""; data = ""; render(); });
    return {
      set(v) { data = v || ""; opts.input.value = ""; render(); },
      get() { return data; }
    };
  }

  window.AdminUI = { escapeHtml, escapeAttr, slugify, toast, bindUploader, onShow: [] };

  // ---------- view switch ----------
  const loginView = document.getElementById("loginView");
  const adminView = document.getElementById("adminView");
  function showLogin() { loginView.style.display = "flex"; adminView.style.display = "none"; document.getElementById("lPass").focus(); }
  function showAdmin() {
    loginView.style.display = "none";
    adminView.style.display = "";
    // notify all registered section renderers
    window.AdminUI.onShow.forEach(fn => { try { fn(); } catch (e) { console.error(e); } });
  }
  window.AdminUI.showAdmin = showAdmin;

  // ---------- login ----------
  document.getElementById("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const u = document.getElementById("lUser").value.trim();
    const p = document.getElementById("lPass").value;
    const btn = e.target.querySelector('button[type="submit"]');
    if (btn) btn.disabled = true;
    try {
      if (await Auth.login(u, p)) {
        document.getElementById("loginErr").classList.remove("show");
        document.getElementById("lPass").value = "";
        showAdmin();
      } else {
        document.getElementById("loginErr").classList.add("show");
      }
    } finally {
      if (btn) btn.disabled = false;
    }
  });
  document.getElementById("logoutBtn").addEventListener("click", async () => { await Auth.logout(); showLogin(); });

  // ---------- section nav ----------
  const sideItems = [...document.querySelectorAll(".side-item[data-panel]")];
  const panels = [...document.querySelectorAll(".panel[data-panel]")];
  function activate(name) {
    sideItems.forEach(b => b.classList.toggle("active", b.dataset.panel === name));
    panels.forEach(p => p.classList.toggle("active", p.dataset.panel === name));
    try { localStorage.setItem("pbw_admin_panel", name); } catch (e) {}
  }
  sideItems.forEach(b => b.addEventListener("click", () => activate(b.dataset.panel)));
  // restore last panel
  let startPanel = "kurse";
  try { startPanel = localStorage.getItem("pbw_admin_panel") || "kurse"; } catch (e) {}
  if (!panels.some(p => p.dataset.panel === startPanel)) startPanel = "kurse";
  activate(startPanel);

  // ---------- reset ----------
  document.getElementById("resetBtn").addEventListener("click", async () => {
    if (!confirm("Alle Inhalte (Kurse, Kolleg:innen, Zertifikate, Referenzen, Kontakt, Über-mich-Bild) auf die Beispieldaten zurücksetzen?")) return;
    try {
      await window.PBW.resetSeed();
      window.AdminUI.onShow.forEach(fn => { try { fn(); } catch (e) {} });
      toast("Beispieldaten wiederhergestellt");
    } catch (e) {
      toast(e.message || "Zurücksetzen fehlgeschlagen");
    }
  });

  // ---------- count badges ----------
  async function updateCounts() {
    try {
      const [courses, content] = await Promise.all([
        window.PBW.Store.all(),
        window.PBW.Content.data()
      ]);
      const map = {
        kurse: courses.length,
        kollegen: content.kollegen.length,
        zertifikate: content.zertifikate.length,
        referenzen: content.referenzen.length,
        ressourcen: content.ressourcen.length
      };
      Object.entries(map).forEach(([k, v]) => {
        const el = document.querySelector('[data-count="' + k + '"]');
        if (el) el.textContent = v;
      });
    } catch (e) {
      /* counts are best-effort */
    }
  }
  window.AdminUI.updateCounts = updateCounts;
  window.AdminUI.onShow.push(updateCounts);

  // ---------- bootstrap ----------
  // Wait for all section scripts to register their renderers (onShow) first.
  window.addEventListener("load", async () => {
    if (await Auth.isAuthed()) showAdmin(); else showLogin();
  });
})();
