"use client";
import { useState, useEffect } from "react";
import { supabase, onAuthChange } from "../../lib/supabase";
import LoginForm from "../../components/LoginForm";
import AdminDashboard from "../../components/AdminDashboard";

export default function AdminPage() {
  const [session, setSession] = useState(undefined); // undefined = loading

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
    });

    // Listen for auth changes
    const { data: { subscription } } = onAuthChange((s) => setSession(s));
    return () => subscription.unsubscribe();
  }, []);

  // Loading state
  if (session === undefined) {
    return (
      <div style={{
        minHeight: "100vh", background: "#0A0A0A",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <div style={{
          width: 36, height: 36, border: "3px solid #1E1E1E",
          borderTop: "3px solid #DC143C", borderRadius: "50%",
          animation: "spin 0.8s linear infinite",
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!session) {
  return <LoginForm onSuccess={() => {}} />;
}

const ADMIN_EMAIL = "yashyashwanth1507@gmail.com";

if (session.user.email !== ADMIN_EMAIL) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0A0A0A",
        color: "white",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <h1>Access Denied</h1>
      <p>You are not authorized to access this admin panel.</p>
    </div>
  );
}

return <AdminDashboard session={session} />;
}
