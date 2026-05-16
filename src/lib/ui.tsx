import React from "react"

export const API_URL = "https://inlionde4n-disaster-platform-api.hf.space"

export function toB64Img(b64: string) {
  return `data:image/png;base64,${b64}`
}

export function PageHeader({ title, desc }: { title: string; desc: string }) {
  return (
    <div style={{ marginBottom: 32 }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, color: "#f1f5f9", letterSpacing: "-0.5px", marginBottom: 8 }}>{title}</h1>
      <p style={{ color: "#475569", fontSize: 14, lineHeight: 1.6 }}>{desc}</p>
    </div>
  )
}

export function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ background: "#0d1117", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: 24, marginBottom: 20, ...style }}>
      {children}
    </div>
  )
}

export function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 style={{ fontSize: 13, fontWeight: 600, color: "#475569", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 16 }}>{children}</h2>
}

export function Stat({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div style={{ background: "#060910", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, padding: "14px 16px" }}>
      <div style={{ fontSize: 22, fontWeight: 700, color: accent ?? "#38bdf8", letterSpacing: "-0.5px" }}>{value}</div>
      <div style={{ fontSize: 11, color: "#475569", marginTop: 4, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</div>
    </div>
  )
}

export function UploadBox({ preview, onClick, label }: { preview: string | null; onClick: () => void; label?: string }) {
  return (
    <div onClick={onClick} style={{
      border: "1.5px dashed rgba(255,255,255,0.1)",
      borderRadius: 10,
      padding: preview ? 8 : 40,
      textAlign: "center",
      cursor: "pointer",
      marginBottom: 20,
      minHeight: preview ? "auto" : 130,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "rgba(255,255,255,0.02)",
      transition: "border-color 0.2s",
      overflow: "hidden",
    }}>
      {preview
        ? <img src={preview} alt="preview" style={{ maxHeight: 260, maxWidth: "100%", borderRadius: 7, display: "block" }} />
        : (
          <div>
            <div style={{ fontSize: 28, marginBottom: 8 }}>↑</div>
            <div style={{ color: "#475569", fontSize: 13 }}>{label ?? "Click to upload image"}</div>
            <div style={{ color: "#1e293b", fontSize: 11, marginTop: 4 }}>PNG, JPG, TIF supported</div>
          </div>
        )}
    </div>
  )
}

export function Btn({ onClick, loading, disabled, children, variant = "primary" }: {
  onClick: () => void; loading: boolean; disabled?: boolean; children: React.ReactNode; variant?: "primary" | "ghost"
}) {
  const base: React.CSSProperties = {
    border: "none", borderRadius: 9, padding: "11px 24px", fontSize: 14,
    fontWeight: 600, cursor: disabled || loading ? "not-allowed" : "pointer",
    width: "100%", transition: "all 0.15s", opacity: disabled || loading ? 0.45 : 1,
  }
  const styles = {
    primary: { ...base, background: "#38bdf8", color: "#060910" },
    ghost: { ...base, background: "rgba(255,255,255,0.05)", color: "#94a3b8", border: "1px solid rgba(255,255,255,0.08)" },
  }
  return (
    <button style={styles[variant]} onClick={onClick} disabled={disabled || loading}>
      {loading ? (
        <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          <span style={{ width: 14, height: 14, border: "2px solid rgba(6,9,16,0.3)", borderTopColor: "#060910", borderRadius: "50%", display: "inline-block", animation: "spin 0.7s linear infinite" }} />
          Processing...
        </span>
      ) : children}
    </button>
  )
}

export function SliderField({ label, value, set, min, max, step = 1 }: { label: string; value: number; set: (v: number) => void; min: number; max: number; step?: number }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        <label style={{ fontSize: 13, color: "#64748b" }}>{label}</label>
        <span style={{ fontSize: 13, color: "#38bdf8", fontWeight: 600 }}>{value}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value} onChange={e => set(+e.target.value)} />
    </div>
  )
}

export function CheckField({ label, value, set }: { label: string; value: boolean; set: (v: boolean) => void }) {
  return (
    <label style={{ display: "flex", alignItems: "center", gap: 8, color: "#64748b", fontSize: 13, cursor: "pointer", padding: "6px 0" }}>
      <input type="checkbox" checked={value} onChange={e => set(e.target.checked)} />
      {label}
    </label>
  )
}

export function ErrorMsg({ msg }: { msg: string }) {
  return (
    <div style={{ background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.2)", borderRadius: 8, padding: "10px 14px", marginTop: 12, color: "#f87171", fontSize: 13 }}>
      {msg}
    </div>
  )
}

export function StatsGrid({ children }: { children: React.ReactNode }) {
  return <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 24 }}>{children}</div>
}

export function TwoCol({ children }: { children: React.ReactNode }) {
  return <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>{children}</div>
}

export function ResultImage({ src, label }: { src: string; label?: string }) {
  return (
    <div>
      {label && <div style={{ fontSize: 12, color: "#475569", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</div>}
      <img src={src} alt={label} style={{ width: "100%", borderRadius: 10, border: "1px solid rgba(255,255,255,0.06)", display: "block" }} />
    </div>
  )
}
