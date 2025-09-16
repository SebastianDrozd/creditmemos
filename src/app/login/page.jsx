"use client";
import { useState } from "react";
import styles from "../../styles/Login.module.css";
import { IconMail, IconLock, IconEye, IconEyeOff, IconCircleCheck } from "@tabler/icons-react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email || !pw) {
      toast.error("Please enter your email and password");
      return;
    }
    try {
      setLoading(true);
      // Adjust to your backend login endpoint & payload
      await axios.post("http://bobakapps.bobak.local:7500/api/auth/login", {
        email,
        password: pw,
        remember,
      }, { withCredentials: true });

      toast.success("Welcome back!");
      router.push("/");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.blobs} aria-hidden />
      <div className={styles.card}>
        <div className={styles.brand}>
          <div className={styles.logo}>B</div>
          <div className={styles.brandText}>
            <h1>Bobak Credit Memos</h1>
            <p>Sign in to continue</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <label className={styles.label} htmlFor="email">Email</label>
          <div className={styles.inputWrap}>
            <IconMail size={18} className={styles.inputIcon} />
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@bobak.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={styles.input}
              required
            />
          </div>

          <div className={styles.rowBetween}>
            <label className={styles.label} htmlFor="password">Password</label>
            <a className={styles.link} href="/forgot">Forgot password?</a>
          </div>
          <div className={styles.inputWrap}>
            <IconLock size={18} className={styles.inputIcon} />
            <input
              id="password"
              type={showPw ? "text" : "password"}
              autoComplete="current-password"
              placeholder="••••••••"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              className={styles.input}
              required
            />
            <button
              type="button"
              aria-label={showPw ? "Hide password" : "Show password"}
              className={styles.eyeBtn}
              onClick={() => setShowPw((s) => !s)}
            >
              {showPw ? <IconEyeOff size={18} /> : <IconEye size={18} />}
            </button>
          </div>

          <label className={styles.remember}>
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
            />
            <span>Remember me</span>
          </label>

          <button className={styles.submitBtn} disabled={loading}>
            {loading ? (
              <>
                <span className={styles.spinner} />
                Signing in…
              </>
            ) : (
              <>
                <IconCircleCheck size={18} />
                Sign in
              </>
            )}
          </button>
        </form>

        <div className={styles.footerNote}>
          By continuing you agree to our <a href="/terms" className={styles.link}>Terms</a> and <a href="/privacy" className={styles.link}>Privacy</a>.
        </div>
      </div>
      <Toaster position="top-center" />
    </div>
  );
}
