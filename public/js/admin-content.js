// PBW Admin — site content: Kolleg:innen, Zertifikate, Referenzen (collections)
// + Kontakt, Über-mich-Bild (singletons). Uses the generic content drawer.
(function () {
  if (!window.PBW || !window.AdminUI) return;
  const { Content } = window.PBW;
  const { escapeHtml, escapeAttr, toast } = window.AdminUI;

  // ---------------- schemas ----------------
  const SCHEMAS = {
    kollegen: {
      singular: "Kolleg:in",
      fields: [
        { key: "name", label: "Name", type: "text", required: true, ph: "z.B. Dr. Maria Weber" },
        { key: "role", label: "Rolle / Fachgebiet", type: "text", ph: "z.B. Systemische Supervision" },
        { key: "bio", label: "Kurzbeschreibung", type: "textarea", ph: "Ein bis zwei Sätze zur Person…" },
        { key: "link", label: "Link (Website oder Profil)", type: "url", ph: "https://…", hint: "Optional. Leer = Button „Profil ansehen“ ohne Ziel." },
        { key: "image", label: "Foto", type: "image", shape: "circle", hint: "Quadratisch empfohlen." },
        { key: "featured", label: "Auf Startseite hervorheben", type: "toggle", desc: "Erscheint als dunkle, hervorgehobene Karte." }
      ]
    },
    zertifikate: {
      singular: "Eintrag",
      fields: [
        { key: "name", label: "Name des Instituts / Zertifikats", type: "text", required: true, ph: "z.B. DGTA - Deutsche Gesellschaft …" },
        { key: "badge", label: "Kennzeichnung", type: "text", ph: "z.B. Zertifiziert, Mitglied, Netzwerk", hint: "Kurzes Label, das als Chip angezeigt wird." },
        { key: "description", label: "Beschreibung", type: "textarea", ph: "Wofür steht dieses Institut / Zertifikat?" },
        { key: "link", label: "Website", type: "url", ph: "https://…" },
        { key: "image", label: "Logo / Bild", type: "image", shape: "rect", hint: "Optional. Logo des Instituts oder Bild der Urkunde." }
      ]
    },
    referenzen: {
      singular: "Referenz",
      fields: [
        { key: "quote", label: "Zitat", type: "textarea", required: true, ph: "Die wörtliche Rückmeldung …" },
        { key: "name", label: "Name", type: "text", ph: "z.B. Sabine M." },
        { key: "org", label: "Rolle / Organisation", type: "text", ph: "z.B. Teamleiterin, öffentlicher Dienst" }
      ]
    },
    ressourcen: {
      singular: "Ressource",
      fields: [
        { key: "title", label: "Titel", type: "text", required: true, ph: "z.B. Leitfaden zur Transaktionsanalyse" },
        { key: "description", label: "Beschreibung", type: "textarea", ph: "Kurze Beschreibung der Ressource…" },
        { key: "type", label: "Typ", type: "select", options: [["link", "Link (externe Website)"], ["download", "Download (Datei)"]], hint: "Bestimmt, ob ein externer Link oder ein Datei-Download angezeigt wird." },
        { key: "url", label: "URL", type: "url", ph: "https://…", showIf: { key: "type", value: "link" }, requiredIf: { key: "type", value: "link" }, hint: "Pflichtfeld bei Typ „Link“." },
        { key: "file", label: "Datei (z. B. PDF)", type: "file", accept: ".pdf,application/pdf", showIf: { key: "type", value: "download" }, requiredIf: { key: "type", value: "download" }, hint: "Pflichtfeld bei Typ „Download“. PDF empfohlen." }
      ]
    }
  };

  // ---------------- list rendering ----------------
  function quoteIcon() {
    return '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.757-2-2-2H4c-1.25 0-2 .75-2 2v6c0 1.25.75 2 2 2h2.5M14 21c3 0 7-1 7-8V5c0-1.25-.757-2-2-2h-4c-1.243 0-2 .75-2 2v6c0 1.25.757 2 2 2h2.5"/></svg>';
  }
  function shieldIcon() {
    return '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>';
  }
  function downloadIcon() {
    return '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>';
  }
  function linkIconBig() {
    return '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>';
  }
  function initials(name) {
    return String(name || "?").trim().split(/\s+/).slice(0, 2).map(w => w[0] || "").join("").toUpperCase();
  }
  function linkChip(url) {
    if (!url) return '<span class="pill muted">kein Link</span>';
    return '<span class="pill"><svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" style="vertical-align:-1px;margin-right:3px;"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>Link</span>';
  }

  async function renderCollection(coll) {
    const el = document.getElementById(coll + "List");
    const items = await Content.list(coll);
    const sch = SCHEMAS[coll];
    if (!items.length) {
      el.innerHTML = '<div class="empty-state"><h3>Noch keine Einträge</h3><p>Fügen Sie Ihren ersten Eintrag hinzu.</p>' +
        '<button class="btn-admin-primary" data-new="' + coll + '">' + escapeHtml(sch.singular) + ' hinzufügen</button></div>';
      bindNewButtons(el);
      window.AdminUI.updateCounts && window.AdminUI.updateCounts();
      return;
    }
    el.innerHTML = items.map((it, i) => {
      let thumb, body;
      if (coll === "kollegen") {
        thumb = '<div class="thumb circle">' + (it.image
          ? '<img src="' + escapeAttr(it.image) + '" alt="">'
          : '<span style="font-weight:600;color:var(--navy);">' + escapeHtml(initials(it.name)) + '</span>') + '</div>';
        body = '<div><h3>' + escapeHtml(it.name) + (it.featured ? ' <span class="pill star">Hervorgehoben</span>' : '') + '</h3>' +
          '<div class="meta"><span>' + escapeHtml(it.role || "—") + '</span>' + linkChip(it.link) + '</div></div>';
      } else if (coll === "zertifikate") {
        thumb = '<div class="thumb">' + (it.image
          ? '<img src="' + escapeAttr(it.image) + '" alt="">'
          : '<span style="color:var(--navy);">' + shieldIcon() + '</span>') + '</div>';
        body = '<div><h3>' + escapeHtml(it.name) + (it.badge ? ' <span class="pill">' + escapeHtml(it.badge) + '</span>' : '') + '</h3>' +
          '<div class="meta"><span>' + escapeHtml((it.description || "").slice(0, 90) + ((it.description || "").length > 90 ? "…" : "")) + '</span></div>' +
          '<div class="meta" style="margin-top:4px;">' + linkChip(it.link) + '</div></div>';
      } else if (coll === "ressourcen") {
        const isDl = it.type === "download";
        thumb = '<div class="thumb"><span style="color:var(--navy);">' + (isDl ? downloadIcon() : linkIconBig()) + '</span></div>';
        const target = isDl
          ? (it.file && it.file.name ? it.file.name : "keine Datei")
          : (it.url || "keine URL");
        body = '<div><h3>' + escapeHtml(it.title) + ' <span class="pill' + (isDl ? " star" : "") + '">' + (isDl ? "Download" : "Link") + '</span></h3>' +
          '<div class="meta"><span>' + escapeHtml((it.description || "").slice(0, 90) + ((it.description || "").length > 90 ? "…" : "")) + '</span></div>' +
          '<div class="meta" style="margin-top:4px;"><span class="pill muted">' + escapeHtml(target) + '</span></div></div>';
      } else { // referenzen
        thumb = '<div class="thumb"><span style="color:var(--navy);">' + quoteIcon() + '</span></div>';
        body = '<div><p class="quote">„' + escapeHtml(it.quote) + '"</p>' +
          '<div class="meta"><span><strong style="color:var(--ink);">' + escapeHtml(it.name || "—") + '</strong></span>' +
          (it.org ? '<span>' + escapeHtml(it.org) + '</span>' : '') + '</div></div>';
      }
      return '<div class="item-row">' + thumb + body +
        '<div class="acts">' +
        '<button class="icon-btn" title="Nach oben" data-move="up" data-id="' + it.id + '"' + (i === 0 ? " disabled" : "") + '><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m18 15-6-6-6 6"/></svg></button>' +
        '<button class="icon-btn" title="Nach unten" data-move="down" data-id="' + it.id + '"' + (i === items.length - 1 ? " disabled" : "") + '><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg></button>' +
        '<button class="icon-btn" title="Bearbeiten" data-edit="' + it.id + '"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg></button>' +
        '<button class="icon-btn danger" title="Löschen" data-del="' + it.id + '"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg></button>' +
        '</div></div>';
    }).join("");

    el.querySelectorAll("[data-edit]").forEach(b => b.addEventListener("click", () => openContent(coll, b.dataset.edit)));
    el.querySelectorAll("[data-del]").forEach(b => b.addEventListener("click", async () => {
      const it = await Content.get(coll, b.dataset.del);
      const label = (it && (it.name || it.quote || it.title)) || "Eintrag";
      if (confirm("„" + label.slice(0, 50) + "\" wirklich löschen?")) {
        try { await Content.removeItem(coll, b.dataset.del); await renderCollection(coll); toast("Eintrag gelöscht"); }
        catch (e) { toast(e.message || "Löschen fehlgeschlagen"); }
      }
    }));
    el.querySelectorAll("[data-move]").forEach(b => b.addEventListener("click", async () => {
      try { await Content.moveItem(coll, b.dataset.id, b.dataset.move === "up" ? -1 : 1); await renderCollection(coll); }
      catch (e) { toast(e.message || "Verschieben fehlgeschlagen"); }
    }));
    window.AdminUI.updateCounts && window.AdminUI.updateCounts();
  }

  function bindNewButtons(scope) {
    (scope || document).querySelectorAll("[data-new]").forEach(b => {
      if (b._bound) return; b._bound = true;
      b.addEventListener("click", () => openContent(b.dataset.new, null));
    });
  }

  // ---------------- generic drawer ----------------
  const overlay = document.getElementById("contentOverlay");
  const form = document.getElementById("contentForm");
  const titleEl = document.getElementById("contentTitle");
  const delBtn = document.getElementById("contentDelete");
  let state = null;      // { coll, id }
  let fieldRefs = [];    // [{ key, type, read() }]

  function fieldHtml(f) {
    const fid = "cf_" + f.key;
    if (f.type === "textarea") {
      return '<div class="field" data-field="' + f.key + '"><label for="' + fid + '">' + escapeHtml(f.label) + '</label>' +
        '<textarea id="' + fid + '" data-key="' + f.key + '" placeholder="' + escapeAttr(f.ph || "") + '"></textarea>' +
        (f.hint ? '<p class="hint">' + escapeHtml(f.hint) + '</p>' : '') + '</div>';
    }
    if (f.type === "image") {
      const shape = f.shape === "circle" ? " circle" : "";
      return '<div class="field" data-field="' + f.key + '"><label>' + escapeHtml(f.label) + '</label>' +
        '<div class="image-uploader" data-up="' + f.key + '">' +
        '<div class="preview' + shape + '" data-prev="' + f.key + '">Kein Bild</div>' +
        '<div class="controls"><p>JPG oder PNG.</p>' +
        '<label class="file-label" for="' + fid + '">Datei wählen</label>' +
        '<input id="' + fid + '" type="file" accept="image/*" data-file="' + f.key + '">' +
        '<button type="button" class="clear" data-clear="' + f.key + '">Entfernen</button>' +
        '</div></div>' +
        (f.hint ? '<p class="hint">' + escapeHtml(f.hint) + '</p>' : '') + '</div>';
    }
    if (f.type === "toggle") {
      return '<div class="field" data-field="' + f.key + '"><div class="toggle-row"><div class="tg-text"><strong>' + escapeHtml(f.label) + '</strong>' +
        (f.desc ? '<span>' + escapeHtml(f.desc) + '</span>' : '') + '</div>' +
        '<label class="switch"><input type="checkbox" data-key="' + f.key + '"><span class="slider"></span></label></div></div>';
    }
    if (f.type === "select") {
      const opts = (f.options || []).map(o => '<option value="' + escapeAttr(o[0]) + '">' + escapeHtml(o[1]) + '</option>').join("");
      return '<div class="field" data-field="' + f.key + '"><label for="' + fid + '">' + escapeHtml(f.label) + '</label>' +
        '<select id="' + fid + '" data-key="' + f.key + '">' + opts + '</select>' +
        (f.hint ? '<p class="hint">' + escapeHtml(f.hint) + '</p>' : '') + '</div>';
    }
    if (f.type === "file") {
      return '<div class="field" data-field="' + f.key + '"><label>' + escapeHtml(f.label) + '</label>' +
        '<div class="image-uploader" data-up="' + f.key + '">' +
        '<div class="preview" data-fname="' + f.key + '" style="width:auto;min-width:120px;max-width:240px;height:auto;min-height:64px;padding:10px 14px;font-size:13px;color:var(--navy);overflow:hidden;text-overflow:ellipsis;">Keine Datei</div>' +
        '<div class="controls"><p>PDF empfohlen.</p>' +
        '<label class="file-label" for="' + fid + '">Datei wählen</label>' +
        '<input id="' + fid + '" type="file" accept="' + escapeAttr(f.accept || "") + '" data-file="' + f.key + '">' +
        '<button type="button" class="clear" data-clear="' + f.key + '">Entfernen</button>' +
        '</div></div>' +
        (f.hint ? '<p class="hint">' + escapeHtml(f.hint) + '</p>' : '') + '</div>';
    }
    const t = f.type === "url" ? "url" : "text";
    return '<div class="field" data-field="' + f.key + '"><label for="' + fid + '">' + escapeHtml(f.label) + '</label>' +
      '<input id="' + fid + '" type="' + t + '" data-key="' + f.key + '" placeholder="' + escapeAttr(f.ph || "") + '">' +
      (f.hint ? '<p class="hint">' + escapeHtml(f.hint) + '</p>' : '') + '</div>';
  }

  async function openContent(coll, id) {
    const sch = SCHEMAS[coll];
    if (!sch) return;
    const item = id ? (await Content.get(coll, id)) || {} : {};
    state = { coll, id: id || null };
    fieldRefs = [];
    titleEl.textContent = (id ? "" : "Neue:r ") + sch.singular + (id ? " bearbeiten" : "");
    delBtn.style.display = id ? "" : "none";
    form.innerHTML = sch.fields.map(fieldHtml).join("");

    sch.fields.forEach(f => {
      if (f.type === "image") {
        const up = window.AdminUI.bindUploader({
          input: form.querySelector('[data-file="' + f.key + '"]'),
          preview: form.querySelector('[data-prev="' + f.key + '"]'),
          uploader: form.querySelector('[data-up="' + f.key + '"]'),
          clearBtn: form.querySelector('[data-clear="' + f.key + '"]'),
          placeholder: "Kein Bild"
        });
        up.set(item[f.key] || "");
        fieldRefs.push({ key: f.key, read: () => up.get() });
      } else if (f.type === "toggle") {
        const cb = form.querySelector('[data-key="' + f.key + '"]');
        cb.checked = !!item[f.key];
        fieldRefs.push({ key: f.key, read: () => cb.checked });
      } else if (f.type === "file") {
        const input = form.querySelector('[data-file="' + f.key + '"]');
        const nameEl = form.querySelector('[data-fname="' + f.key + '"]');
        const clearBtn = form.querySelector('[data-clear="' + f.key + '"]');
        const uploader = form.querySelector('[data-up="' + f.key + '"]');
        let cur = (item[f.key] && typeof item[f.key] === "object") ? Object.assign({}, item[f.key]) : { name: "", url: "" };
        const paintFile = () => {
          nameEl.textContent = cur.name || "Keine Datei";
          if (uploader) uploader.classList.toggle("has-image", !!cur.name);
        };
        paintFile();
        input.addEventListener("change", async () => {
          const file = input.files && input.files[0];
          if (!file) return;
          try {
            if (uploader) uploader.classList.add("uploading");
            const r = await window.PBW.uploadFile(file);
            cur = { name: file.name, url: r.url };
            paintFile();
          } catch (e) {
            toast(e.message || "Upload fehlgeschlagen");
          } finally {
            if (uploader) uploader.classList.remove("uploading");
            input.value = "";
          }
        });
        clearBtn.addEventListener("click", () => { cur = { name: "", url: "" }; input.value = ""; paintFile(); });
        fieldRefs.push({ key: f.key, read: () => (cur.name || cur.url) ? cur : null });
      } else if (f.type === "select") {
        const sel = form.querySelector('[data-key="' + f.key + '"]');
        sel.value = item[f.key] || (f.options && f.options[0] ? f.options[0][0] : "");
        if (!sel.value && f.options && f.options.length) sel.value = f.options[0][0];
        fieldRefs.push({ key: f.key, read: () => sel.value });
      } else {
        const inp = form.querySelector('[data-key="' + f.key + '"]');
        inp.value = item[f.key] || "";
        fieldRefs.push({ key: f.key, read: () => inp.value.trim(), required: f.required, el: inp, label: f.label });
      }
    });

    // conditional fields driven by showIf (e.g. URL vs. Datei je nach Typ)
    function applyConditional() {
      sch.fields.forEach(f => {
        if (!f.showIf) return;
        const wrap = form.querySelector('[data-field="' + f.key + '"]');
        const drv = form.querySelector('[data-key="' + f.showIf.key + '"]');
        if (!wrap || !drv) return;
        wrap.style.display = (drv.value === f.showIf.value) ? "" : "none";
      });
    }
    sch.fields.forEach(f => {
      if (f.type === "select") {
        const sel = form.querySelector('[data-key="' + f.key + '"]');
        if (sel) sel.addEventListener("change", applyConditional);
      }
    });
    applyConditional();

    overlay.classList.add("open");
    overlay.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    const first = form.querySelector("input[type=text], textarea");
    if (first) setTimeout(() => first.focus(), 100);
  }

  function closeContent() {
    overlay.classList.remove("open");
    overlay.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    state = null;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!state) return;
    // validate required (inkl. bedingter Pflichtfelder via requiredIf)
    const sch = SCHEMAS[state.coll];
    const values = {};
    fieldRefs.forEach(r => { values[r.key] = r.read(); });
    for (const f of sch.fields) {
      let req = !!f.required;
      if (f.requiredIf && values[f.requiredIf.key] === f.requiredIf.value) req = true;
      if (!req) continue;
      const v = values[f.key];
      const empty = (f.type === "file") ? !(v && (v.name || v.url)) : !(v && String(v).trim());
      if (empty) {
        alert("Bitte „" + f.label + "“ ausfüllen.");
        const el = form.querySelector('[data-key="' + f.key + '"]') || form.querySelector('[data-file="' + f.key + '"]');
        el && el.focus();
        return;
      }
    }
    const obj = state.id ? Object.assign({}, (await Content.get(state.coll, state.id)) || {}) : {};
    fieldRefs.forEach(r => { obj[r.key] = r.read(); });
    const wasEdit = !!state.id;
    const coll = state.coll;
    try {
      await Content.saveItem(coll, obj);
      closeContent();
      await renderCollection(coll);
      toast(wasEdit ? "Gespeichert" : "Hinzugefügt");
    } catch (e) {
      toast(e.message || "Speichern fehlgeschlagen");
    }
  });

  delBtn.addEventListener("click", async () => {
    if (!state || !state.id) return;
    if (confirm("Diesen Eintrag wirklich löschen?")) {
      const coll = state.coll;
      try {
        await Content.removeItem(coll, state.id);
        closeContent();
        await renderCollection(coll);
        toast("Eintrag gelöscht");
      } catch (e) {
        toast(e.message || "Löschen fehlgeschlagen");
      }
    }
  });

  document.getElementById("closeContent").addEventListener("click", closeContent);
  document.getElementById("cancelContent").addEventListener("click", closeContent);
  overlay.addEventListener("click", (e) => { if (e.target === overlay) closeContent(); });

  // ---------------- singletons: Über mich + Kontakt ----------------
  const aboutUp = window.AdminUI.bindUploader({
    input: document.getElementById("aboutImage"),
    preview: document.getElementById("aboutPreview"),
    uploader: document.getElementById("aboutUploader"),
    clearBtn: document.getElementById("aboutClear"),
    placeholder: "Kein Bild"
  });
  function flag(id) { const el = document.getElementById(id); el.classList.add("show"); setTimeout(() => el.classList.remove("show"), 1800); }

  document.getElementById("aboutSave").addEventListener("click", async () => {
    try {
      await Content.saveSingle("about", { image: aboutUp.get() });
      flag("aboutSaved"); toast("Porträtbild gespeichert");
    } catch (e) {
      toast(e.message || "Speichern fehlgeschlagen");
    }
  });

  const ctEmail = document.getElementById("ctEmail");
  const ctPhone = document.getElementById("ctPhone");
  document.getElementById("ctSave").addEventListener("click", async () => {
    try {
      await Content.saveSingle("kontakt", { email: ctEmail.value.trim(), phone: ctPhone.value.trim() });
      flag("ctSaved"); toast("Kontaktdaten gespeichert");
    } catch (e) {
      toast(e.message || "Speichern fehlgeschlagen");
    }
  });

  async function loadSingletons() {
    const a = await Content.getSingle("about");
    aboutUp.set((a && a.image) || "");
    const k = await Content.getSingle("kontakt");
    ctEmail.value = (k && k.email) || "";
    ctPhone.value = (k && k.phone) || "";
  }

  // ---------------- bootstrap / register ----------------
  async function renderAll() {
    await Promise.all([
      renderCollection("kollegen"),
      renderCollection("zertifikate"),
      renderCollection("referenzen"),
      renderCollection("ressourcen"),
      loadSingletons()
    ]);
  }
  bindNewButtons(document);
  window.AdminUI.onShow.push(renderAll);
})();
