"use client";
import { useState, useEffect, useRef } from "react";
import {
  supabase,
  signOut,
  fetchPhotos,
  insertPhoto,
  updatePhoto,
  deletePhoto,
  uploadImage,
} from "../lib/supabase";

// ── Tiny Toast ────────────────────────────────────────────────────────────────
function Toast({ msg, type }) {
  if (!msg) return null;
  return (
    <div style={{
      position: "fixed", bottom: "1.5rem", left: "50%", transform: "translateX(-50%)",
      background: type === "error" ? "rgba(220,20,60,0.15)" : "#1A1A1A",
      border: `1px solid ${type === "error" ? "#DC143C" : "#333"}`,
      color: type === "error" ? "#ff6b6b" : "#F5F5F5",
      padding: "0.75rem 1.5rem", borderRadius: "4px",
      fontSize: "0.85rem", zIndex: 999, whiteSpace: "nowrap",
      fontFamily: "'Inter', system-ui, sans-serif",
      boxShadow: "0 4px 24px rgba(0,0,0,0.5)",
    }}>
      {msg}
    </div>
  );
}

// ── Upload / Edit Form ────────────────────────────────────────────────────────
function PhotoForm({ editing, onSave, onCancel }) {
  const isEdit = !!editing;
  const [title, setTitle] = useState(editing?.title || "");
  const [description, setDescription] = useState(editing?.description || "");
  const [category, setCategory] = useState(editing?.category || "");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(editing?.image_url || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef();

  const pickFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!isEdit && !file) { setError("Please select an image."); return; }
    setLoading(true);
    try {
  let image_url = editing?.image_url || "";

  if (file) image_url = await uploadImage(file);

  console.log("Image URL:", image_url);
  console.log({
    title,
    description,
    category,
    image_url
  });

  if (isEdit) {
    await updatePhoto(editing.id, {
      title,
      description,
      category,
      image_url
    });
  } else {
    await insertPhoto({
      title,
      description,
      category,
      image_url
    });
  }

  onSave();
} catch (err) {
  console.log("FULL ERROR:", err);
  console.log("MESSAGE:", err.message);
  console.log("DETAILS:", err.details);
  console.log("HINT:", err.hint);

  setError(err.message || "Something went wrong.");
} finally {
  setLoading(false);
}
  };

  return (
    <div style={s.formOverlay} onClick={onCancel}>
      <div style={s.formCard} onClick={(e) => e.stopPropagation()}>
        <div style={s.formHeader}>
          <span style={s.formTitle}>{isEdit ? "Edit Photo" : "Upload New Photo"}</span>
          <button style={s.closeBtn} onClick={onCancel}>✕</button>
        </div>

        {error && <div style={s.errorBox}>{error}</div>}

        <form onSubmit={handleSubmit} style={s.form}>
          {/* Image picker */}
          <div
            style={{ ...s.dropzone, borderColor: preview ? "#DC143C" : "#333" }}
            onClick={() => fileRef.current.click()}
          >
            {preview ? (
              <img src={preview} alt="preview" style={s.previewImg} />
            ) : (
              <div style={s.dropPlaceholder}>
                <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>📷</div>
                <div style={{ fontSize: "0.85rem", color: "#888" }}>Click to choose image</div>
                <div style={{ fontSize: "0.72rem", color: "#555", marginTop: "0.25rem" }}>JPG, PNG, WEBP up to 10MB</div>
              </div>
            )}
            <input ref={fileRef} type="file" accept="image/*" onChange={pickFile} style={{ display: "none" }} />
          </div>
          {preview && (
            <button type="button" style={s.changeBtn} onClick={() => fileRef.current.click()}>
              Change image
            </button>
          )}

          <div style={s.row}>
            <div style={s.group}>
              <label style={s.label}>Title *</label>
              <input style={s.input} required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Golden Hour at Marina" />
            </div>
            <div style={s.group}>
              <label style={s.label}>Category</label>
              <input style={s.input} value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g. Portraits, Street, Nature" list="cat-list" />
              <datalist id="cat-list">
                {["Portrait", "Street", "Nature", "Event", "Architecture", "Travel", "Abstract"].map(c => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </div>
          </div>

          <div style={s.group}>
            <label style={s.label}>Description</label>
            <textarea
              style={{ ...s.input, resize: "vertical", minHeight: "80px" }}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="A short caption or story behind the shot…"
            />
          </div>

          <div style={s.formActions}>
            <button type="button" style={s.cancelBtn} onClick={onCancel}>Cancel</button>
            <button type="submit" style={{ ...s.submitBtn, opacity: loading ? 0.7 : 1 }} disabled={loading}>
              {loading ? (isEdit ? "Saving…" : "Uploading…") : (isEdit ? "Save Changes" : "Upload Photo")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Confirm Dialog ────────────────────────────────────────────────────────────
function Confirm({ msg, onConfirm, onCancel }) {
  return (
    <div style={s.formOverlay} onClick={onCancel}>
      <div style={{ ...s.formCard, maxWidth: 380 }} onClick={(e) => e.stopPropagation()}>
        <div style={{ fontSize: "1.5rem", marginBottom: "0.75rem", textAlign: "center" }}>🗑️</div>
        <p style={{ color: "#F5F5F5", textAlign: "center", marginBottom: "1.5rem", fontSize: "0.95rem" }}>{msg}</p>
        <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center" }}>
          <button style={s.cancelBtn} onClick={onCancel}>Cancel</button>
          <button style={{ ...s.submitBtn, background: "#8B0000" }} onClick={onConfirm}>Delete</button>
        </div>
      </div>
    </div>
  );
}

// ── Main Dashboard ────────────────────────────────────────────────────────────
export default function AdminDashboard({ session }) {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [toast, setToast] = useState({ msg: "", type: "ok" });
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("All");

  const notify = (msg, type = "ok") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "ok" }), 3500);
  };

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchPhotos();
      setPhotos(data);
    } catch (e) {
      notify(e.message, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleSaved = () => {
    setShowForm(false);
    setEditTarget(null);
    notify(editTarget ? "Photo updated successfully." : "Photo uploaded successfully.");
    load();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deletePhoto(deleteTarget.id, deleteTarget.image_url);
      notify("Photo deleted.");
      setDeleteTarget(null);
      load();
    } catch (e) {
      notify(e.message, "error");
    }
  };

  const categories = ["All", ...Array.from(new Set(photos.map((p) => p.category || "Uncategorized")))];
  const filtered = photos.filter((p) => {
    const matchCat = catFilter === "All" || (p.category || "Uncategorized") === catFilter;
    const q = search.toLowerCase();
    return matchCat && (!q || p.title?.toLowerCase().includes(q) || p.category?.toLowerCase().includes(q));
  });

  return (
    <div style={s.wrap}>
      {/* Header */}
      <header style={s.header}>
        <div>
          <div style={s.headerLogo}>B's<span style={{ color: "#DC143C" }}>PHOTOGRAPHY</span></div>
          <div style={s.headerSub}>Admin Dashboard</div>
        </div>
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
          <span style={s.userBadge}>📧 {session?.user?.email}</span>
          <button style={s.uploadBtn} onClick={() => { setEditTarget(null); setShowForm(true); }}>
            + Upload Photo
          </button>
          <button style={s.logoutBtn} onClick={signOut}>Sign Out</button>
        </div>
      </header>

      {/* Stats bar */}
      <div style={s.statsBar}>
        <div style={s.statChip}><span style={s.statNum}>{photos.length}</span> Total Photos</div>
        <div style={s.statChip}><span style={s.statNum}>{categories.length - 1}</span> Categories</div>
        <div style={s.statChip}><span style={s.statNum}>{filtered.length}</span> Showing</div>
      </div>

      {/* Filters */}
      <div style={s.controls}>
        <div style={{ position: "relative" }}>
          <span style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "#555", pointerEvents: "none" }}>⌕</span>
          <input
            style={{ ...s.searchInput }}
            placeholder="Search photos…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div style={s.catRow}>
          {categories.map((c) => (
            <button
              key={c}
              style={{ ...s.catBtn, ...(catFilter === c ? s.catActive : {}) }}
              onClick={() => setCatFilter(c)}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div style={s.loadingWrap}>
          <div style={s.spinner} />
          <div style={{ color: "#555", marginTop: "1rem", fontSize: "0.85rem" }}>Loading photos…</div>
        </div>
      ) : filtered.length === 0 ? (
        <div style={s.empty}>
          <div style={{ fontSize: "3rem", opacity: 0.3 }}>📷</div>
          <div style={{ color: "#F5F5F5", fontFamily: "'Playfair Display', serif", fontSize: "1.3rem", marginTop: "0.75rem" }}>No photos found</div>
          <div style={{ color: "#555", fontSize: "0.85rem", marginTop: "0.25rem" }}>Upload your first photo to get started.</div>
          <button style={{ ...s.uploadBtn, marginTop: "1.5rem" }} onClick={() => setShowForm(true)}>+ Upload Photo</button>
        </div>
      ) : (
        <div style={s.grid}>
          {filtered.map((photo) => (
            <div key={photo.id} style={s.card}>
              <div style={s.thumb} className="admin-thumb">
               <img src={photo.image_url} alt={photo.title} style={s.thumbImg} loading="lazy" />
               <div style={s.thumbOverlay} className="admin-overlay">
                  <button style={s.editBtn} onClick={() => { setEditTarget(photo); setShowForm(true); }}>✏️ Edit</button>
                  <button style={s.deleteBtn} onClick={() => setDeleteTarget(photo)}>🗑️ Delete</button>
                </div>
              </div>
              <div style={s.cardBody}>
                <div style={s.cardTitle}>{photo.title}</div>
                <div style={s.cardMeta}>
                  <span style={s.catTag}>{photo.category || "Uncategorized"}</span>
                  <span style={s.cardDate}>{new Date(photo.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                </div>
                {photo.description && (
                  <div style={s.cardDesc}>{photo.description.slice(0, 80)}{photo.description.length > 80 ? "…" : ""}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      {showForm && (
        <PhotoForm
          editing={editTarget}
          onSave={handleSaved}
          onCancel={() => { setShowForm(false); setEditTarget(null); }}
        />
      )}
      {deleteTarget && (
        <Confirm
          msg={`Delete "${deleteTarget.title}"? This cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
      <Toast msg={toast.msg} type={toast.type} />
    </div>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const s = {
  wrap: {
    minHeight: "100vh",
    background: "#0A0A0A",
    fontFamily: "'Inter', system-ui, sans-serif",
    color: "#F5F5F5",
    paddingBottom: "4rem",
  },
  header: {
    background: "rgba(10,10,10,0.95)",
    borderBottom: "1px solid #1E1E1E",
    padding: "1rem 2rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: "1rem",
    position: "sticky",
    top: 0,
    zIndex: 50,
    backdropFilter: "blur(12px)",
  },
  headerLogo: {
    fontFamily: "'Playfair Display', Georgia, serif",
    fontSize: "1.2rem",
    fontWeight: 700,
    color: "#F5F5F5",
  },
  headerSub: { fontSize: "0.72rem", color: "#555", letterSpacing: "0.12em", textTransform: "uppercase", marginTop: "2px" },
  userBadge: { fontSize: "0.75rem", color: "#888", background: "#1A1A1A", border: "1px solid #222", borderRadius: "20px", padding: "0.35rem 0.75rem" },
  uploadBtn: {
    background: "#DC143C", color: "#fff", border: "none", borderRadius: "4px",
    padding: "0.6rem 1.25rem", fontSize: "0.8rem", fontWeight: 600,
    letterSpacing: "0.06em", cursor: "pointer", fontFamily: "inherit",
  },
  logoutBtn: {
    background: "transparent", color: "#888", border: "1px solid #333", borderRadius: "4px",
    padding: "0.6rem 1rem", fontSize: "0.78rem", cursor: "pointer", fontFamily: "inherit",
  },
  statsBar: {
    display: "flex", gap: "1rem", padding: "1.25rem 2rem",
    borderBottom: "1px solid #1A1A1A", flexWrap: "wrap",
  },
  statChip: { background: "#111", border: "1px solid #222", borderRadius: "4px", padding: "0.5rem 1rem", fontSize: "0.8rem", color: "#888" },
  statNum: { color: "#DC143C", fontWeight: 700, fontFamily: "'Playfair Display', serif", fontSize: "1.1rem", marginRight: "0.4rem" },
  controls: { padding: "1.25rem 2rem", display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "center", borderBottom: "1px solid #1A1A1A" },
  searchInput: {
    background: "#1A1A1A", border: "1px solid #2A2A2A", color: "#F5F5F5",
    padding: "0.55rem 1rem 0.55rem 2.2rem", borderRadius: "4px", fontSize: "0.85rem",
    fontFamily: "inherit", width: "220px", outline: "none",
  },
  catRow: { display: "flex", gap: "0.4rem", flexWrap: "wrap" },
  catBtn: {
    background: "#1A1A1A", border: "1px solid #2A2A2A", color: "#888",
    padding: "0.4rem 0.9rem", borderRadius: "2px", cursor: "pointer",
    fontSize: "0.72rem", fontWeight: 600, letterSpacing: "0.08em",
    textTransform: "uppercase", fontFamily: "inherit",
  },
  catActive: { background: "#DC143C", color: "#fff", borderColor: "#DC143C" },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
    gap: "1rem",
    padding: "1.5rem 2rem",
  },
  card: { background: "#111", border: "1px solid #1E1E1E", borderRadius: "6px", overflow: "hidden" },
  thumb: { position: "relative", aspectRatio: "4/3", overflow: "hidden" },
  thumbImg: { width: "100%", height: "100%", objectFit: "cover", display: "block", transition: "transform 0.4s" },
  thumbOverlay: {
    position: "absolute", inset: 0, background: "rgba(0,0,0,0.7)",
    display: "flex", alignItems: "center", justifyContent: "center", gap: "0.75rem",
    opacity: 0, transition: "opacity 0.25s",
    // show on hover via inline — use a wrapper trick below
  },
  editBtn: {
    background: "rgba(220,20,60,0.9)", color: "#fff", border: "none",
    borderRadius: "4px", padding: "0.55rem 1rem", fontSize: "0.8rem",
    cursor: "pointer", fontFamily: "inherit", fontWeight: 600,
  },
  deleteBtn: {
    background: "rgba(80,0,0,0.9)", color: "#ff6b6b", border: "1px solid #8B0000",
    borderRadius: "4px", padding: "0.55rem 1rem", fontSize: "0.8rem",
    cursor: "pointer", fontFamily: "inherit", fontWeight: 600,
  },
  cardBody: { padding: "0.85rem 1rem" },
  cardTitle: { fontWeight: 600, fontSize: "0.9rem", color: "#F5F5F5", marginBottom: "0.4rem" },
  cardMeta: { display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.4rem" },
  catTag: {
    background: "rgba(220,20,60,0.15)", color: "#DC143C",
    fontSize: "0.65rem", fontWeight: 600, letterSpacing: "0.08em",
    textTransform: "uppercase", padding: "0.2rem 0.5rem", borderRadius: "2px",
  },
  cardDate: { fontSize: "0.72rem", color: "#555" },
  cardDesc: { fontSize: "0.78rem", color: "#666", lineHeight: 1.5 },
  loadingWrap: { display: "flex", flexDirection: "column", alignItems: "center", padding: "5rem 2rem" },
  spinner: {
    width: 36, height: 36, border: "3px solid #1E1E1E",
    borderTop: "3px solid #DC143C", borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
  empty: { display: "flex", flexDirection: "column", alignItems: "center", padding: "5rem 2rem", textAlign: "center" },

  // Form modal
  formOverlay: {
    position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)",
    display: "flex", alignItems: "center", justifyContent: "center",
    zIndex: 200, padding: "1rem",
  },
  formCard: {
    background: "#111", border: "1px solid #222", borderRadius: "8px",
    padding: "2rem", width: "100%", maxWidth: 600,
    maxHeight: "90vh", overflowY: "auto",
  },
  formHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" },
  formTitle: { fontFamily: "'Playfair Display', serif", fontSize: "1.2rem", fontWeight: 700, color: "#F5F5F5" },
  closeBtn: { background: "none", border: "none", color: "#666", fontSize: "1.2rem", cursor: "pointer" },
  form: { display: "flex", flexDirection: "column", gap: "1.1rem" },
  row: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" },
  group: { display: "flex", flexDirection: "column", gap: "0.35rem" },
  label: { fontSize: "0.72rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "#888" },
  input: {
    background: "#1A1A1A", border: "1px solid #2A2A2A", color: "#F5F5F5",
    padding: "0.7rem 0.9rem", borderRadius: "4px", fontSize: "0.88rem",
    fontFamily: "inherit", outline: "none",
  },
  dropzone: {
    border: "2px dashed #333", borderRadius: "6px",
    cursor: "pointer", overflow: "hidden", minHeight: 140,
    display: "flex", alignItems: "center", justifyContent: "center",
    transition: "border-color 0.2s",
  },
  dropPlaceholder: { textAlign: "center", padding: "1.5rem" },
  previewImg: { width: "100%", maxHeight: 240, objectFit: "cover", display: "block" },
  changeBtn: {
    background: "transparent", border: "1px solid #333", color: "#888",
    borderRadius: "4px", padding: "0.4rem 0.85rem", fontSize: "0.75rem",
    cursor: "pointer", fontFamily: "inherit", alignSelf: "flex-start",
  },
  formActions: { display: "flex", gap: "0.75rem", justifyContent: "flex-end", marginTop: "0.5rem" },
  cancelBtn: {
    background: "transparent", color: "#888", border: "1px solid #333",
    borderRadius: "4px", padding: "0.65rem 1.25rem", fontSize: "0.82rem",
    cursor: "pointer", fontFamily: "inherit",
  },
  submitBtn: {
    background: "#DC143C", color: "#fff", border: "none",
    borderRadius: "4px", padding: "0.65rem 1.5rem", fontSize: "0.82rem",
    fontWeight: 600, cursor: "pointer", fontFamily: "inherit", letterSpacing: "0.05em",
  },
  errorBox: {
    background: "rgba(220,20,60,0.1)", border: "1px solid rgba(220,20,60,0.3)",
    color: "#ff6b6b", borderRadius: "4px", padding: "0.65rem 0.9rem",
    fontSize: "0.82rem", marginBottom: "0.5rem",
  },
};

// Inject hover effect for thumb overlay (CSS can't be inlined easily)
if (typeof document !== "undefined") {
  const id = "admin-styles";
  if (!document.getElementById(id)) {
    const el = document.createElement("style");
    el.id = id;
    el.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Inter:wght@400;500;600&display=swap');
      @keyframes spin { to { transform: rotate(360deg); } }
      .admin-thumb:hover .admin-overlay { opacity: 1 !important; }
      .admin-thumb:hover img { transform: scale(1.05); }
    `;
    document.head.appendChild(el);
  }
}
