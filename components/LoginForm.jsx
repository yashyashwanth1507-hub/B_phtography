"use client";
import { useState } from "react";
import { signIn } from "../lib/supabase";

export default function LoginForm({ onSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handle = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error: err } = await signIn(email, password);
    setLoading(false);
    if (err) {
  console.log(err);
  setError(err.message);
}
  };

  return (
    <div style={styles.wrap}>
      <div style={styles.card}>
        <div style={styles.logo}>
          B's<span style={{ color: "#DC143C" }}>PHOTOGRAPHY</span>
        </div>
        <div style={styles.eyebrow}>Admin Access</div>
        <h1 style={styles.title}>Sign In</h1>

        {error && <div style={styles.errorBox}>{error}</div>}

        <form onSubmit={handle} style={styles.form}>
          <div style={styles.group}>
            <label style={styles.label}>Email</label>
            <input
              style={styles.input}
              type="email"
              required
              autoComplete="email"
              placeholder="admin@yourdomain.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div style={styles.group}>
            <label style={styles.label}>Password</label>
            <input
              style={styles.input}
              type="password"
              required
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button style={{ ...styles.btn, opacity: loading ? 0.7 : 1 }} disabled={loading} type="submit">
            {loading ? "Signing in…" : "Sign In →"}
          </button>
        </form>

        <div style={styles.hint}>
          Only authorised administrators can access this area.
        </div>
      </div>
    </div>
  );
}

const styles = {
  wrap: {
    minHeight: "100vh",
    background: "#0A0A0A",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "1.5rem",
    fontFamily: "'Inter', system-ui, sans-serif",
  },
  card: {
    background: "#111111",
    border: "1px solid #222",
    borderRadius: "6px",
    padding: "2.5rem",
    width: "100%",
    maxWidth: "420px",
  },
  logo: {
    fontFamily: "'Playfair Display', Georgia, serif",
    fontSize: "1.3rem",
    fontWeight: 700,
    color: "#F5F5F5",
    marginBottom: "1.5rem",
    textAlign: "center",
  },
  eyebrow: {
    fontSize: "0.7rem",
    letterSpacing: "0.2em",
    textTransform: "uppercase",
    color: "#DC143C",
    marginBottom: "0.5rem",
    fontWeight: 500,
  },
  title: {
    fontFamily: "'Playfair Display', Georgia, serif",
    fontSize: "1.8rem",
    fontWeight: 900,
    color: "#F5F5F5",
    marginBottom: "1.75rem",
  },
  form: { display: "flex", flexDirection: "column", gap: "1.1rem" },
  group: { display: "flex", flexDirection: "column", gap: "0.35rem" },
  label: {
    fontSize: "0.72rem",
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    color: "#888",
  },
  input: {
    background: "#1A1A1A",
    border: "1px solid #333",
    color: "#F5F5F5",
    padding: "0.75rem 1rem",
    borderRadius: "4px",
    fontSize: "0.9rem",
    fontFamily: "inherit",
    outline: "none",
    transition: "border-color 0.2s",
  },
  btn: {
    marginTop: "0.5rem",
    background: "#DC143C",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    padding: "0.9rem",
    fontSize: "0.85rem",
    fontWeight: 600,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    cursor: "pointer",
    fontFamily: "inherit",
    transition: "background 0.2s",
  },
  errorBox: {
    background: "rgba(220,20,60,0.12)",
    border: "1px solid rgba(220,20,60,0.4)",
    color: "#ff6b6b",
    borderRadius: "4px",
    padding: "0.75rem 1rem",
    fontSize: "0.85rem",
    marginBottom: "1rem",
  },
  hint: {
    marginTop: "1.5rem",
    fontSize: "0.75rem",
    color: "#555",
    textAlign: "center",
  },
};
