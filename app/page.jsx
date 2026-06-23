"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "@supabase/supabase-js";
// ── Supabase client ──────────────────────────────────────────────────────────
// — Supabase client —
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);


// ── CSS injection ─────────────────────────────────────────────────────────────
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400&family=Inter:wght@300;400;500;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --black: #0A0A0A;
    --black2: #111111;
    --black3: #1A1A1A;
    --crimson: #DC143C;
    --crimson-dark: #A00E2B;
    --crimson-deep: #1A0008;
    --white: #F5F5F5;
    --muted: #888888;
    --border: #222222;
    --font-display: 'Playfair Display', Georgia, serif;
    --font-body: 'Inter', system-ui, sans-serif;
  }

  html { scroll-behavior: smooth; }

  body {
    background: var(--black);
    color: var(--white);
    font-family: var(--font-body);
    font-size: 15px;
    line-height: 1.6;
    min-height: 100vh;
    overflow-x: hidden;
  }

  /* ── NAV ── */
  .nav {
    position: fixed; top: 0; left: 0; right: 0; z-index: 100;
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 2.5rem;
    height: 64px;
    background: rgba(10,10,10,0.92);
    backdrop-filter: blur(12px);
    border-bottom: 1px solid var(--border);
  }
  .nav-logo {
    font-family: var(--font-display);
    font-size: 1.4rem;
    font-weight: 700;
    color: var(--white);
    cursor: pointer;
    letter-spacing: 0.02em;
  }
  .nav-logo span { color: var(--crimson); }
  .nav-links {
    display: flex; gap: 0.25rem; align-items: center;
  }
  .nav-btn {
    background: none; border: none; cursor: pointer;
    font-family: var(--font-body); font-size: 0.82rem;
    font-weight: 500; letter-spacing: 0.08em; text-transform: uppercase;
    color: var(--muted);
    padding: 0.5rem 1rem; border-radius: 4px;
    transition: color 0.2s, background 0.2s;
  }
  .nav-btn:hover, .nav-btn.active { color: var(--white); background: var(--black3); }
  .nav-btn.active { color: var(--crimson); }

  /* ── HERO ── */
  .hero {
    height: 100vh; display: flex; flex-direction: column;
    align-items: center; justify-content: center; text-align: center;
    position: relative; overflow: hidden;
  }
  .hero-bg {
    position: absolute; inset: 0;
    background: radial-gradient(ellipse 80% 60% at 50% 40%, #3D0015 0%, var(--black) 70%);
  }
  .hero-line {
    position: absolute; bottom: 0; left: 50%; transform: translateX(-50%);
    width: 1px; background: linear-gradient(to bottom, transparent, var(--crimson));
    animation: line-grow 1.8s ease-out forwards;
    transform-origin: top;
  }
  @keyframes line-grow {
    from { height: 0; opacity: 0; }
    to { height: 120px; opacity: 1; }
  }
  .hero-content { position: relative; z-index: 1; }
  .hero-eyebrow {
    font-size: 0.72rem; letter-spacing: 0.2em; text-transform: uppercase;
    color: var(--crimson); margin-bottom: 1.2rem; font-weight: 500;
  }
  .hero-title {
    font-family: var(--font-display);
    font-size: clamp(3rem, 8vw, 7rem);
    font-weight: 900; line-height: 1;
    color: var(--white); margin-bottom: 1.5rem;
    animation: fade-up 1s 0.2s both;
  }
  .hero-title em { color: var(--crimson); font-style: italic; }
  .hero-sub {
    font-size: 1rem; color: var(--muted); max-width: 440px; margin: 0 auto 2.5rem;
    animation: fade-up 1s 0.4s both;
  }
  .hero-cta {
    display: inline-block; padding: 0.85rem 2.2rem;
    background: var(--crimson); color: var(--white);
    border: none; border-radius: 2px; cursor: pointer;
    font-family: var(--font-body); font-size: 0.8rem;
    font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase;
    transition: background 0.2s, transform 0.15s;
    animation: fade-up 1s 0.6s both;
  }
  .hero-cta:hover { background: var(--crimson-dark); transform: translateY(-1px); }
  @keyframes fade-up {
    from { opacity: 0; transform: translateY(24px); }
    to { opacity: 1; transform: translateY(0); }
  }

  /* ── GALLERY PAGE ── */
  .gallery-page { padding: 100px 2.5rem 4rem; max-width: 1600px; margin: 0 auto; }

  .gallery-header {
    display: flex; align-items: flex-start; justify-content: space-between;
    flex-wrap: wrap; gap: 1.5rem; margin-bottom: 2.5rem;
  }
  .section-title {
    font-family: var(--font-display);
    font-size: clamp(1.8rem, 4vw, 2.8rem);
    font-weight: 700; color: var(--white); line-height: 1.1;
  }
  .section-title span { color: var(--crimson); }

  /* search + filter */
  .controls { display: flex; gap: 0.75rem; flex-wrap: wrap; align-items: center; }
  .search-wrap { position: relative; }
  .search-input {
    background: var(--black3); border: 1px solid var(--border);
    color: var(--white); padding: 0.6rem 1rem 0.6rem 2.4rem;
    border-radius: 4px; font-family: var(--font-body); font-size: 0.85rem;
    width: 220px; transition: border-color 0.2s;
  }
  .search-input:focus { outline: none; border-color: var(--crimson); }
  .search-icon {
    position: absolute; left: 0.75rem; top: 50%; transform: translateY(-50%);
    color: var(--muted); pointer-events: none; font-size: 0.9rem;
  }

  .categories { display: flex; gap: 0.5rem; flex-wrap: wrap; }
  .cat-btn {
    background: var(--black3); border: 1px solid var(--border);
    color: var(--muted); padding: 0.45rem 1rem;
    border-radius: 2px; cursor: pointer;
    font-family: var(--font-body); font-size: 0.75rem;
    font-weight: 500; letter-spacing: 0.06em; text-transform: uppercase;
    transition: all 0.2s;
  }
  .cat-btn:hover { color: var(--white); border-color: var(--crimson); }
  .cat-btn.active { background: var(--crimson); color: var(--white); border-color: var(--crimson); }

  /* masonry grid */
  .masonry {
    columns: 4; column-gap: 12px;
  }
  @media (max-width: 1200px) { .masonry { columns: 3; } }
  @media (max-width: 768px) { .masonry { columns: 2; } }
  @media (max-width: 480px) { .masonry { columns: 1; } }

  .masonry-item {
    break-inside: avoid; margin-bottom: 12px;
    position: relative; overflow: hidden; border-radius: 2px;
    cursor: pointer; display: block;
  }
  .masonry-item img {
    width: 100%; display: block;
    transition: transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  }
  .masonry-item:hover img { transform: scale(1.04); }
  .masonry-overlay {
    position: absolute; inset: 0;
    background: linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(220,20,60,0.15) 100%);
    opacity: 0; transition: opacity 0.35s;
    display: flex; flex-direction: column; justify-content: flex-end; padding: 1.2rem;
  }
  .masonry-item:hover .masonry-overlay { opacity: 1; }
  .masonry-title {
    font-family: var(--font-display); font-size: 1rem; font-weight: 700;
    color: var(--white); margin-bottom: 0.25rem;
  }
  .masonry-desc { font-size: 0.75rem; color: rgba(245,245,245,0.75); line-height: 1.4; }
  .masonry-category {
    position: absolute; top: 0.75rem; left: 0.75rem;
    background: var(--crimson); color: var(--white);
    font-size: 0.65rem; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase;
    padding: 0.25rem 0.6rem; border-radius: 2px;
  }

  /* empty state */
  .empty-state {
    text-align: center; padding: 5rem 2rem; color: var(--muted);
  }
  .empty-icon { font-size: 3rem; margin-bottom: 1rem; opacity: 0.4; }
  .empty-text { font-family: var(--font-display); font-size: 1.4rem; margin-bottom: 0.5rem; color: var(--white); }

  /* loading skeleton */
  .skeleton-grid { columns: 4; column-gap: 12px; }
  @media (max-width: 1200px) { .skeleton-grid { columns: 3; } }
  @media (max-width: 768px) { .skeleton-grid { columns: 2; } }
  .skeleton {
    break-inside: avoid; margin-bottom: 12px;
    background: var(--black3); border-radius: 2px;
    animation: pulse 1.5s ease-in-out infinite;
  }
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }

  /* ── LIGHTBOX ── */
  .lightbox {
    position: fixed; inset: 0; z-index: 200;
    background: rgba(0,0,0,0.97);
    display: flex; align-items: center; justify-content: center;
    animation: lb-in 0.25s ease;
  }
  @keyframes lb-in { from { opacity: 0; } to { opacity: 1; } }
  .lb-inner {
    position: relative; max-width: 90vw; max-height: 90vh;
    display: flex; flex-direction: column; align-items: center;
  }
  .lb-img-wrap {
    position: relative; max-width: 90vw; max-height: 80vh;
    overflow: hidden; border-radius: 2px;
  }
  .lb-img {
    max-width: 90vw; max-height: 80vh;
    object-fit: contain; display: block;
    border: 1px solid var(--border);
  }
  .lb-info {
    text-align: center; margin-top: 1.25rem; max-width: 600px;
  }
  .lb-title {
    font-family: var(--font-display); font-size: 1.3rem; font-weight: 700;
    color: var(--white); margin-bottom: 0.4rem;
  }
  .lb-desc { font-size: 0.85rem; color: var(--muted); }
  .lb-date { font-size: 0.72rem; color: var(--crimson); margin-top: 0.4rem; letter-spacing: 0.06em; }

  .lb-close {
    position: absolute; top: -3rem; right: 0;
    background: none; border: none; color: var(--muted);
    font-size: 1.5rem; cursor: pointer; width: 40px; height: 40px;
    display: flex; align-items: center; justify-content: center;
    border-radius: 50%; transition: color 0.2s, background 0.2s;
  }
  .lb-close:hover { color: var(--white); background: var(--black3); }

  .lb-nav {
    position: absolute; top: 50%; transform: translateY(-50%);
    background: rgba(10,10,10,0.7); border: 1px solid var(--border);
    color: var(--white); width: 44px; height: 44px;
    display: flex; align-items: center; justify-content: center;
    border-radius: 50%; cursor: pointer; transition: background 0.2s, color 0.2s;
    font-size: 1.1rem;
  }
  .lb-nav:hover { background: var(--crimson); border-color: var(--crimson); }
  .lb-prev { left: -3.5rem; }
  .lb-next { right: -3.5rem; }

  .lb-counter {
    position: absolute; top: -3rem; left: 0;
    font-size: 0.75rem; color: var(--muted); letter-spacing: 0.08em;
  }

  /* ── ABOUT ── */
  .about-page {
    min-height: 100vh; padding: 110px 2.5rem 5rem;
    max-width: 1100px; margin: 0 auto;
  }
  .about-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 5rem; align-items: center; }
  @media (max-width: 768px) { .about-grid { grid-template-columns: 1fr; gap: 2.5rem; } }

  .about-img-wrap {
    position: relative; aspect-ratio: 3/4; overflow: hidden; border-radius: 2px;
  }
  .about-img-wrap img { width: 100%; height: 100%; object-fit: cover; }
  .about-img-accent {
    position: absolute; top: -1rem; left: -1rem;
    width: 60%; height: 60%; border: 2px solid var(--crimson); border-radius: 2px;
    z-index: -1;
  }
  .about-eyebrow {
    font-size: 0.72rem; letter-spacing: 0.2em; text-transform: uppercase;
    color: var(--crimson); margin-bottom: 1rem; font-weight: 500;
  }
  .about-title {
    font-family: var(--font-display); font-size: clamp(2rem, 4vw, 3rem);
    font-weight: 900; color: var(--white); line-height: 1.1; margin-bottom: 1.5rem;
  }
  .about-title em { color: var(--crimson); font-style: italic; }
  .about-body { color: var(--muted); line-height: 1.8; margin-bottom: 1.5rem; font-size: 0.95rem; }

  .stats { display: flex; gap: 2rem; margin-top: 2rem; }
  .stat-number {
    font-family: var(--font-display); font-size: 2.5rem; font-weight: 900;
    color: var(--crimson); line-height: 1;
  }
  .stat-label { font-size: 0.75rem; color: var(--muted); text-transform: uppercase; letter-spacing: 0.1em; margin-top: 0.25rem; }

  /* ── CONTACT ── */
  .contact-page {
    min-height: 100vh; padding: 110px 2.5rem 5rem;
    max-width: 800px; margin: 0 auto;
  }
  .contact-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 4rem; margin-top: 3rem; }
  @media (max-width: 640px) { .contact-grid { grid-template-columns: 1fr; } }

  .contact-info-item { margin-bottom: 2rem; }
  .contact-label {
    font-size: 0.7rem; letter-spacing: 0.15em; text-transform: uppercase;
    color: var(--crimson); margin-bottom: 0.4rem; font-weight: 600;
  }
  .contact-value { font-size: 0.95rem; color: var(--white); }
  .contact-value a { color: var(--white); text-decoration: none; transition: color 0.2s; }
  .contact-value a:hover { color: var(--crimson); }

  .divider {
    width: 60px; height: 2px; background: var(--crimson); margin: 1.5rem 0;
  }

  .contact-form { display: flex; flex-direction: column; gap: 1.25rem; }
  .form-group { display: flex; flex-direction: column; gap: 0.4rem; }
  .form-label { font-size: 0.75rem; letter-spacing: 0.1em; text-transform: uppercase; color: var(--muted); }
  .form-input, .form-textarea {
    background: var(--black3); border: 1px solid var(--border);
    color: var(--white); padding: 0.75rem 1rem;
    border-radius: 2px; font-family: var(--font-body); font-size: 0.9rem;
    transition: border-color 0.2s; resize: none;
  }
  .form-input:focus, .form-textarea:focus {
    outline: none; border-color: var(--crimson);
  }
  .form-submit {
    background: var(--crimson); color: var(--white); border: none;
    padding: 0.9rem 2rem; border-radius: 2px; cursor: pointer;
    font-family: var(--font-body); font-size: 0.8rem;
    font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase;
    transition: background 0.2s, transform 0.15s;
    align-self: flex-start;
  }
  .form-submit:hover { background: var(--crimson-dark); transform: translateY(-1px); }

  /* ── FOOTER ── */
  .footer {
    border-top: 1px solid var(--border);
    padding: 2rem 2.5rem;
    display: flex; align-items: center; justify-content: space-between;
    flex-wrap: wrap; gap: 1rem;
  }
  .footer-logo {
    font-family: var(--font-display); font-size: 1.1rem; font-weight: 700;
    color: var(--white);
  }
  .footer-logo span { color: var(--crimson); }
  .footer-copy { font-size: 0.75rem; color: var(--muted); }

  /* ── TOAST ── */
  .toast {
    position: fixed; bottom: 2rem; left: 50%; transform: translateX(-50%);
    background: var(--black3); border: 1px solid var(--crimson);
    color: var(--white); padding: 0.75rem 1.5rem; border-radius: 4px;
    font-size: 0.85rem; z-index: 300; animation: toast-in 0.3s ease;
  }
  @keyframes toast-in {
    from { opacity: 0; transform: translateX(-50%) translateY(10px); }
    to { opacity: 1; transform: translateX(-50%) translateY(0); }
  }

  /* ── UTIL ── */
  .crimson-dot { display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: var(--crimson); margin-right: 0.5rem; }
  .page-fade { animation: fade-up 0.5s ease; }
`;

// Inject styles
if (!document.getElementById("portfolio-styles")) {
  const s = document.createElement("style");
  s.id = "portfolio-styles";
  s.textContent = CSS;
  document.head.appendChild(s);
}

// ── helpers ───────────────────────────────────────────────────────────────────
function getCategory(photo) {
  return photo.category || (photo.description?.match(/\[(\w+)\]/)?.[1]) || "Uncategorized";
}

function formatDate(ts) {
  return new Date(ts).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
function Skeleton() {
  const heights = [220, 300, 180, 260, 340, 200, 280, 240];
  return (
    <div className="skeleton-grid">
      {heights.map((h, i) => (
        <div key={i} className="skeleton" style={{ height: h }} />
      ))}
    </div>
  );
}

// ── Lightbox ──────────────────────────────────────────────────────────────────
function Lightbox({ photos, index, onClose, onNav }) {
  const photo = photos[index];
  useEffect(() => {
    const fn = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onNav(-1);
      if (e.key === "ArrowRight") onNav(1);
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [onClose, onNav]);

  return (
    <div className="lightbox" onClick={onClose}>
      <div className="lb-inner" onClick={(e) => e.stopPropagation()}>
        <button className="lb-close" onClick={onClose}>✕</button>
        <span className="lb-counter">{index + 1} / {photos.length}</span>
        <div className="lb-img-wrap">
          <img className="lb-img" src={photo.image_url} alt={photo.title} />
          {index > 0 && (
            <button className="lb-nav lb-prev" onClick={() => onNav(-1)}>‹</button>
          )}
          {index < photos.length - 1 && (
            <button className="lb-nav lb-next" onClick={() => onNav(1)}>›</button>
          )}
        </div>
        <div className="lb-info">
          <div className="lb-title">{photo.title}</div>
          {photo.description && <div className="lb-desc">{photo.description.replace(/\[\w+\]/g, "").trim()}</div>}
          <div className="lb-date">{formatDate(photo.created_at)}</div>
        </div>
      </div>
    </div>
  );
}

// ── Gallery ───────────────────────────────────────────────────────────────────
function Gallery({ photos, loading }) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [lbIndex, setLbIndex] = useState(null);

  const categories = ["All", ...Array.from(new Set(photos.map(getCategory)))];

  const filtered = photos.filter((p) => {
    const matchCat = category === "All" || getCategory(p) === category;
    const q = search.toLowerCase();
    const matchSearch = !q ||
      p.title?.toLowerCase().includes(q) ||
      p.description?.toLowerCase().includes(q);
    return matchCat && matchSearch;
  });

  const handleNav = useCallback((dir) => {
    setLbIndex((i) => Math.max(0, Math.min(filtered.length - 1, i + dir)));
  }, [filtered.length]);

  return (
    <div className="gallery-page page-fade">
      <div className="gallery-header">
        <div>
          <div className="section-title">The <span>Gallery</span></div>
          <div style={{ color: "var(--muted)", fontSize: "0.85rem", marginTop: "0.4rem" }}>
            {filtered.length} image{filtered.length !== 1 ? "s" : ""} found
          </div>
        </div>
        <div className="controls">
          <div className="search-wrap">
            <span className="search-icon">⌕</span>
            <input
              className="search-input"
              placeholder="Search photos…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="categories">
            {categories.map((c) => (
              <button
                key={c}
                className={`cat-btn ${category === c ? "active" : ""}`}
                onClick={() => setCategory(c)}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <Skeleton />
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">◻</div>
          <div className="empty-text">No photos found</div>
          <div>Try a different search or category</div>
        </div>
      ) : (
        <div className="masonry">
          {filtered.map((photo, i) => (
            <div
              key={photo.id}
              className="masonry-item"
              onClick={() => setLbIndex(i)}
              style={{ animationDelay: `${i * 0.04}s` }}
            >
              <img
                src={photo.image_url}
                alt={photo.title}
                loading="lazy"
              />
              <div className="masonry-overlay">
                <div className="masonry-title">{photo.title}</div>
                {photo.description && (
                  <div className="masonry-desc">
                    {photo.description.replace(/\[\w+\]/g, "").trim().slice(0, 80)}
                    {photo.description.length > 80 ? "…" : ""}
                  </div>
                )}
              </div>
              <div className="masonry-category">{getCategory(photo)}</div>
            </div>
          ))}
        </div>
      )}

      {lbIndex !== null && (
        <Lightbox
          photos={filtered}
          index={lbIndex}
          onClose={() => setLbIndex(null)}
          onNav={handleNav}
        />
      )}
    </div>
  );
}

// ── About ─────────────────────────────────────────────────────────────────────
function About() {
  return (
    <div className="about-page page-fade">
      <div className="about-grid">
        <div style={{ position: "relative" }}>
          <div className="about-img-wrap">
            <img
              src="https://images.unsplash.com/photo-1554080353-a576cf803bda?w=600"
              alt="Yashwanth B"
            />
          </div>
          <div className="about-img-accent" />
        </div>
        <div>
          <div className="about-eyebrow"><span className="crimson-dot" />The Artist</div>
          <div className="about-title">
            Capturing <em>moments</em> that<br />refuse to be forgotten.
          </div>
          <p className="about-body">
            I'm a visual storyteller obsessed with the tension between light and shadow.
            Every frame is a conversation between what's seen and what's felt — the quiet
            drama of a street at dusk, the raw emotion of a portrait, the abstraction hidden
            inside the ordinary.
          </p>
          <p className="about-body">
            Based out of nowhere in particular, I travel with a single camera and an
            unshakeable belief that the best photographs are the ones that make you stop
            scrolling.
          </p>
          <div className="divider" />
          <div className="stats">
            <div>
              <div className="stat-number">12+</div>
              <div className="stat-label">Years shooting</div>
            </div>
            <div>
              <div className="stat-number">40K</div>
              <div className="stat-label">Frames captured</div>
            </div>
            <div>
              <div className="stat-number">30+</div>
              <div className="stat-label">Countries visited</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Contact ───────────────────────────────────────────────────────────────────
function Contact({ showToast }) {
  const [sent, setSent] = useState(false);
  const handle = (e) => {
    e.preventDefault();
    setSent(true);
    showToast("Message sent — I'll be in touch soon.");
  };

  return (
    <div className="contact-page page-fade">
      <div className="about-eyebrow"><span className="crimson-dot" />Get in Touch</div>
      <div className="section-title">Let's <span style={{ color: "var(--crimson)" }}>talk.</span></div>
      <div className="contact-grid">
        <div>
          <div className="contact-info-item">
            <div className="contact-label">Email</div>
            <div className="contact-value"><a href="mailto:hello@portfolio.com">hello@portfolio.com</a></div>
          </div>
          <div className="contact-info-item">
            <div className="contact-label">Instagram</div>
            <div className="contact-value"><a href="#">@yourhandle</a></div>
          </div>
          <div className="contact-info-item">
            <div className="contact-label">Availability</div>
            <div className="contact-value">Open for commissions & collaborations</div>
          </div>
          <div className="divider" />
          <p style={{ color: "var(--muted)", fontSize: "0.85rem", lineHeight: 1.7 }}>
            Whether it's a commission, a collaboration, or just a note about a photo that moved you — 
            I read every message personally.
          </p>
        </div>
        <form className="contact-form" onSubmit={handle}>
          <div className="form-group">
            <label className="form-label">Name</label>
            <input className="form-input" type="text" required placeholder="Yashwanth B" />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="form-input" type="email" required placeholder="your@email.com" />
          </div>
          <div className="form-group">
            <label className="form-label">Message</label>
            <textarea className="form-textarea" rows={5} required placeholder="What's on your mind…" />
          </div>
          <button className="form-submit" type="submit" disabled={sent}>
            {sent ? "Sent ✓" : "Send Message"}
          </button>
        </form>
      </div>
    </div>
  );
}

// ── App ───────────────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState("home");
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);

  const showToast = useCallback((msg) => {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3500);
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("portfolio")
          .select("*")
          .order("created_at", { ascending: false });
        if (error) throw error;
        setPhotos(data || []);
      } catch (err) {
        console.error("Supabase error:", err);
        showToast("Could not load photos — check your API key.");
      } finally {
        setLoading(false);
      }
    })();
  }, [showToast]);

  const nav = (p) => setPage(p);

  return (
    <div>
      {/* Nav */}
      <nav className="nav">
        <div className="nav-logo" onClick={() => nav("home")}>
          B's<span>PHOTOGRAHY</span>
        </div>
        <div className="nav-links">
          <button className={`nav-btn ${page === "home" ? "active" : ""}`} onClick={() => nav("home")}>Home</button>
          <button className={`nav-btn ${page === "gallery" ? "active" : ""}`} onClick={() => nav("gallery")}>Gallery</button>
          <button className={`nav-btn ${page === "about" ? "active" : ""}`} onClick={() => nav("about")}>About</button>
          <button className={`nav-btn ${page === "contact" ? "active" : ""}`} onClick={() => nav("contact")}>Contact</button>
        </div>
      </nav>

      {/* Pages */}
      {page === "home" && (
        <div className="hero">
          <div className="hero-bg" />
          <div className="hero-line" />
          <div className="hero-content">
            <div className="hero-eyebrow"><span className="crimson-dot" />THROUGH MY LENS</div>
            <div className="hero-title">
              Light.<br /><em>Shadow.</em><br />Truth.
            </div>
            <div className="hero-sub">
              A curated collection of images that live between the decisive moment and the dream.
            </div>
            <button className="hero-cta" onClick={() => nav("gallery")}>
              View the Gallery
            </button>
          </div>
        </div>
      )}

      {page === "gallery" && <Gallery photos={photos} loading={loading} />}
      {page === "about" && <About />}
      {page === "contact" && <Contact showToast={showToast} />}

      {/* Footer */}
      {page !== "home" && (
        <footer className="footer">
          <div className="footer-logo">B's<span>PHOTOGRAPHY</span></div>
          <div className="footer-copy">© {new Date().getFullYear()} All rights reserved.</div>
        </footer>
      )}

      {/* Toast */}
      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
