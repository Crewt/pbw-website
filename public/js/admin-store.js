// PBW Admin — API client. Exposes the SAME window.PBW surface as the original
// localStorage prototype (js/store.js), but every method talks to the backend
// (/api/...) and returns a Promise. The admin section scripts await these.
//
// Loaded by admin.html INSTEAD of js/store.js. The public pages keep using
// js/store.js until they are wired to the API in a later step.
(function () {
  async function api(method, path, body) {
    const opts = { method: method, credentials: "same-origin", headers: {} };
    if (body !== undefined) {
      opts.headers["Content-Type"] = "application/json";
      opts.body = JSON.stringify(body);
    }
    const res = await fetch(path, opts);
    const text = await res.text();
    let data = null;
    if (text) {
      try {
        data = JSON.parse(text);
      } catch (e) {
        data = null;
      }
    }
    if (!res.ok) {
      const err = new Error((data && data.error) || "Fehler " + res.status);
      err.status = res.status;
      throw err;
    }
    return data;
  }

  function notFoundToNull(e) {
    if (e && e.status === 404) return null;
    throw e;
  }

  async function uploadFile(file) {
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/uploads", { method: "POST", body: fd, credentials: "same-origin" });
    const data = await res.json().catch(() => null);
    if (!res.ok) throw new Error((data && data.error) || "Upload fehlgeschlagen.");
    return data; // { url, name }
  }

  // ---- Courses ----
  const Store = {
    all() {
      return api("GET", "/api/courses");
    },
    get(id) {
      return api("GET", "/api/courses/" + encodeURIComponent(id)).catch(notFoundToNull);
    },
    save(course) {
      return course && course.id
        ? api("PUT", "/api/courses/" + encodeURIComponent(course.id), course)
        : api("POST", "/api/courses", course);
    },
    remove(id) {
      return api("DELETE", "/api/courses/" + encodeURIComponent(id));
    },
  };

  // ---- Site content (collections + singletons) ----
  const Content = {
    data() {
      return api("GET", "/api/content");
    },
    list(coll) {
      return api("GET", "/api/content/" + encodeURIComponent(coll));
    },
    get(coll, id) {
      return api(
        "GET",
        "/api/content/" + encodeURIComponent(coll) + "/" + encodeURIComponent(id)
      ).catch(notFoundToNull);
    },
    saveItem(coll, item) {
      return item && item.id
        ? api(
            "PUT",
            "/api/content/" + encodeURIComponent(coll) + "/" + encodeURIComponent(item.id),
            item
          )
        : api("POST", "/api/content/" + encodeURIComponent(coll), item);
    },
    removeItem(coll, id) {
      return api("DELETE", "/api/content/" + encodeURIComponent(coll) + "/" + encodeURIComponent(id));
    },
    moveItem(coll, id, dir) {
      return api(
        "POST",
        "/api/content/" + encodeURIComponent(coll) + "/" + encodeURIComponent(id) + "/move",
        { dir: dir }
      );
    },
    getSingle(name) {
      return api("GET", "/api/content/single/" + encodeURIComponent(name));
    },
    saveSingle(name, obj) {
      return api("PUT", "/api/content/single/" + encodeURIComponent(name), obj);
    },
  };

  // ---- Auth (server-backed, admin_users table) ----
  const Auth = {
    async login(u, p) {
      try {
        await api("POST", "/api/auth/login", { username: u, password: p });
        return true;
      } catch (e) {
        return false;
      }
    },
    logout() {
      return api("POST", "/api/auth/logout").catch(() => {});
    },
    async isAuthed() {
      try {
        const r = await api("GET", "/api/auth/me");
        return !!(r && r.authed);
      } catch (e) {
        return false;
      }
    },
  };

  // Reset all content to the example defaults (server-side).
  function resetSeed() {
    return api("POST", "/api/admin/reset");
  }

  // Date helpers (kept for parity with js/store.js).
  const DE_MONTHS = ["Januar","Februar","März","April","Mai","Juni","Juli","August","September","Oktober","November","Dezember"];
  function fmtDate(iso) {
    if (!iso) return "";
    const [y, m, d] = String(iso).split("-").map(Number);
    if (!y || !m || !d) return iso;
    return String(d).padStart(2, "0") + ". " + DE_MONTHS[m - 1] + " " + y;
  }
  function fmtDateShort(iso) {
    if (!iso) return "";
    const [y, m, d] = String(iso).split("-").map(Number);
    if (!y || !m || !d) return iso;
    return String(d).padStart(2, "0") + "." + String(m).padStart(2, "0") + "." + y;
  }
  function fmtTermineList(termine) {
    if (!termine || !termine.length) return "";
    return termine.map((t) => fmtDate(t.date) + (t.time ? " · " + t.time : "")).join(" · ");
  }

  window.PBW = { Store, Content, Auth, resetSeed, uploadFile, fmtDate, fmtDateShort, fmtTermineList };
})();
