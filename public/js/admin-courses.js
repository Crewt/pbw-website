// PBW Admin — Kursangebote (courses) section.
(function () {
  if (!window.PBW || !window.AdminUI) return;
  const { Store } = window.PBW;
  const { escapeHtml, escapeAttr, slugify, toast } = window.AdminUI;

  const listEl = document.getElementById("courseList");
  const overlay = document.getElementById("editorOverlay");
  const form = document.getElementById("editorForm");
  const titleEl = document.getElementById("editorTitle");
  const deleteBtn = document.getElementById("deleteBtn");
  let current = null;

  // ---------- list ----------
  async function renderList() {
    const courses = await Store.all();
    if (!courses.length) {
      listEl.innerHTML =
        '<div class="empty-state"><h3>Noch keine Kurse</h3>' +
        '<p>Legen Sie Ihren ersten Kurs an, um Termine und Inhalte zu verwalten.</p>' +
        '<button class="btn-admin-primary" id="emptyNewCourse">Ersten Kurs anlegen</button></div>';
      const b = document.getElementById("emptyNewCourse");
      if (b) b.addEventListener("click", () => openEditor(null));
      window.AdminUI.updateCounts && window.AdminUI.updateCounts();
      return;
    }
    listEl.innerHTML = courses.map(c => `
      <div class="item-row">
        <div class="thumb">${c.image
        ? `<img src="${escapeAttr(c.image)}" alt="">`
        : `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>`}</div>
        <div>
          <h3>${escapeHtml(c.title)}</h3>
          <div class="meta">
            <span>${(c.termine || []).length} Termin(e)</span>
            <span>${c.cost ? escapeHtml(c.cost) : "Kosten n/a"}</span>
            <span>${(c.includes || []).length} Inhalte</span>
          </div>
        </div>
        <div class="acts">
          <a class="icon-btn" title="Auf Website ansehen" target="_blank" href="seminar.html?id=${encodeURIComponent(c.id)}">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
          </a>
          <button class="icon-btn" title="Bearbeiten" data-edit="${c.id}">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>
          </button>
          <button class="icon-btn danger" title="Löschen" data-del="${c.id}">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/></svg>
          </button>
        </div>
      </div>`).join("");

    listEl.querySelectorAll("[data-edit]").forEach(b => b.addEventListener("click", () => openEditor(b.dataset.edit)));
    listEl.querySelectorAll("[data-del]").forEach(b => b.addEventListener("click", async () => {
      const c = await Store.get(b.dataset.del);
      if (c && confirm(`Kurs „${c.title}" wirklich löschen?`)) {
        try { await Store.remove(c.id); await renderList(); toast("Kurs gelöscht"); }
        catch (e) { toast(e.message || "Löschen fehlgeschlagen"); }
      }
    }));
    window.AdminUI.updateCounts && window.AdminUI.updateCounts();
  }

  // ---------- editor ----------
  function blank() { return { title: "", subtitle: "", description: "", cost: "", slug: "", image: "", termine: [], includes: [""], enables: [""] }; }

  async function openEditor(id) {
    try {
      current = id ? structuredClone(await Store.get(id)) : blank();
      if (!current) current = blank();
      titleEl.textContent = id ? "Kurs bearbeiten" : "Neuer Kurs";
      deleteBtn.style.display = id ? "" : "none";
      form.elements["courseId"].value = current.id || "";
      form.title.value = current.title || "";
      form.subtitle.value = current.subtitle || "";
      form.description.value = current.description || "";
      form.cost.value = current.cost || "";
      form.slug.value = current.slug || "";
      setImage(current.image || "");
      renderRepeater("termineRep", current.termine || [], makeTerminRow);
      renderRepeater("includesRep", current.includes || [], makeTextRow);
      renderRepeater("enablesRep", current.enables || [], makeTextRow);
      overlay.classList.add("open");
      overlay.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
      setTimeout(() => form.title.focus(), 100);
    } catch (err) {
      console.error("openEditor failed:", err);
      alert("Editor konnte nicht geöffnet werden: " + err.message);
    }
  }
  function closeEditor() {
    overlay.classList.remove("open");
    overlay.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    current = null;
  }

  document.getElementById("newCourseBtn").addEventListener("click", () => openEditor(null));
  document.getElementById("closeEditor").addEventListener("click", closeEditor);
  document.getElementById("cancelEditor").addEventListener("click", closeEditor);
  overlay.addEventListener("click", (e) => { if (e.target === overlay) closeEditor(); });

  deleteBtn.addEventListener("click", async () => {
    if (!current || !current.id) return;
    if (confirm(`Kurs „${current.title}" wirklich löschen?`)) {
      try { await Store.remove(current.id); closeEditor(); await renderList(); toast("Kurs gelöscht"); }
      catch (e) { toast(e.message || "Löschen fehlgeschlagen"); }
    }
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!form.title.value.trim()) { alert("Bitte geben Sie einen Titel ein."); form.title.focus(); return; }
    const wasEdit = !!form.elements["courseId"].value;
    const data = {
      id: form.elements["courseId"].value || undefined,
      title: form.title.value.trim(),
      subtitle: form.subtitle.value.trim(),
      description: form.description.value.trim(),
      cost: form.cost.value.trim(),
      slug: (form.slug.value.trim() || slugify(form.title.value)),
      image: getImage(),
      termine: collect("termineRep").map(r => ({ date: r.date.value, time: r.time.value.trim() })).filter(t => t.date),
      includes: collect("includesRep").map(r => r.text.value.trim()).filter(Boolean),
      enables: collect("enablesRep").map(r => r.text.value.trim()).filter(Boolean)
    };
    try {
      await Store.save(data);
      closeEditor();
      await renderList();
      toast(wasEdit ? "Kurs gespeichert" : "Kurs angelegt");
    } catch (err) {
      toast(err.message || "Speichern fehlgeschlagen");
    }
  });

  // ---------- image ----------
  const imgPreview = document.getElementById("imgPreview");
  const imgUploader = document.getElementById("imgUploader");
  const img = window.AdminUI.bindUploader({
    input: document.getElementById("fImage"),
    preview: imgPreview,
    uploader: imgUploader,
    clearBtn: document.getElementById("imgClear"),
    placeholder: "Kein Bild"
  });
  function setImage(src) { img.set(src); }
  function getImage() { return img.get(); }

  // ---------- repeaters ----------
  function renderRepeater(id, items, mk) {
    const el = document.getElementById(id);
    el.innerHTML = "";
    (items.length ? items : [null]).forEach(item => el.appendChild(mk(item)));
  }
  function makeTextRow(value) {
    const row = document.createElement("div");
    row.className = "repeater-row";
    row.dataset.kind = "text";
    row.innerHTML =
      '<span class="drag">⋮⋮</span>' +
      '<input type="text" class="r-text" placeholder="Punkt eingeben…" value="' + escapeAttr(value || "") + '">' +
      '<button type="button" class="icon-btn danger r-del" title="Entfernen"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>';
    row.querySelector(".r-del").addEventListener("click", () => row.remove());
    return row;
  }
  function makeTerminRow(value) {
    const row = document.createElement("div");
    row.className = "repeater-row term-row";
    row.dataset.kind = "termin";
    row.innerHTML =
      '<span class="drag">⋮⋮</span>' +
      '<input type="date" class="r-date" value="' + escapeAttr((value && value.date) || "") + '">' +
      '<input type="text" class="r-time" placeholder="z.B. 09:30-18:00 Uhr" value="' + escapeAttr((value && value.time) || "") + '">' +
      '<button type="button" class="icon-btn danger r-del" title="Entfernen"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>';
    row.querySelector(".r-del").addEventListener("click", () => row.remove());
    return row;
  }
  function collect(id) {
    return [...document.getElementById(id).querySelectorAll(".repeater-row")].map(row => {
      if (row.dataset.kind === "termin") return { date: row.querySelector(".r-date"), time: row.querySelector(".r-time") };
      return { text: row.querySelector(".r-text") };
    });
  }
  document.getElementById("addTermin").addEventListener("click", () => document.getElementById("termineRep").appendChild(makeTerminRow(null)));
  document.getElementById("addInclude").addEventListener("click", () => document.getElementById("includesRep").appendChild(makeTextRow("")));
  document.getElementById("addEnable").addEventListener("click", () => document.getElementById("enablesRep").appendChild(makeTextRow("")));

  // register with shell
  window.AdminUI.onShow.push(renderList);
})();
