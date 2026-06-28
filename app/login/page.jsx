"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase, onAuthChange } from "../../lib/supabase";
import LoginForm from "../../components/LoginForm";

export default function LoginPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        router.replace("/admin");
      } else {
        setChecking(false);
      }
    });

    const { data: { subscription } } = onAuthChange((session) => {
      if (session) router.replace("/admin");
    });
    return () => subscription.unsubscribe();
  }, [router]);

  if (checking) {
    return (
      <div style={{
        minHeight: "100vh", background: "#0A0A0A",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <div style={{
          width: 32, height: 32, border: "3px solid #1E1E1E",
          borderTop: "3px solid #DC143C", borderRadius: "50%",
          animation: "spin 0.8s linear infinite",
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return <LoginForm />;
}
