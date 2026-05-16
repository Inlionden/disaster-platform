import React from "react"

export const API_URL = "https://inlionde4n-disaster-platform-api.hf.space"

export function toB64Img(b64: string) {
  return `data:image/png;base64,${b64}`
}

export function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div style={s.statCard}>
      <div style={s.statValue}>{value}</div>
      <div style={s.statLabel}>{label}</div>
    </div>
  )
}

export function UploadBox({ preview, onClick, label }: { preview: string | null; onClick: () => void; label?: string }) {
  return (
    <div style={s.uploadBox} onClick={onClick}>
      {preview
        ? <img src={preview} alt="preview" style={s.previewImg} />
        : <p style={{ color: "#64748b", margin: 0 }}>{label ?? "Click to upload image"}</p>}
    </div>
  )
}

export function Btn({ onClick, loading, disabled, children }: { onClick: () => void; loading: boolean; disabled?: boolean; children: React.ReactNode }) {
  return (
    <button style={{ ...s.btn, opacity: disabled || loading ? 0.5 : 1 }} onClick={onClick} disabled={disabled || loading}>
      {loading ? "Processing..." : children}
    </button>
  )
}

export const s: Record<string, React.CSSProperties> = {
  h1: { fontSize: 26, fontWeight: 700, color: "#f1f5f9", margin: "0 0 6px" },
  h2: { fontSize: 18, fontWeight: 600, color: "#f1f5f9", margin: "0 0 16px" },
  h3: { fontSize: 15, fontWeight: 600, color: "#cbd5e1", margin: "20px 0 8px" },
  sub: { color: "#64748b", margin: "0 0 24px", fontSize: 14 },
  card: { background: "#1e293b", borderRadius: 12, padding: 24, marginBottom: 24, border: "1px solid #334155" },
  uploadBox: { border: "2px dashed #334155", borderRadius: 8, padding: 32, textAlign: "center", cursor: "pointer", marginBottom: 16, minHeight: 120, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", background: "#0f172a" },
  previewImg: { maxHeight: 280, maxWidth: "100%", borderRadius: 6 },
  btn: { background: "#38bdf8", color: "#0f172a", border: "none", borderRadius: 8, padding: "10px 24px", fontSize: 15, fontWeight: 700, cursor: "pointer", width: "100%", marginTop: 8 },
  error: { color: "#f87171", marginTop: 8, fontSize: 14 },
  statsRow: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 },
  statCard: { background: "#0f172a", borderRadius: 8, padding: 14, textAlign: "center", border: "1px solid #334155" },
  statValue: { fontSize: 20, fontWeight: 700, color: "#38bdf8" },
  statLabel: { fontSize: 11, color: "#64748b", marginTop: 4 },
  resultImg: { width: "100%", borderRadius: 8, border: "1px solid #334155" },
  label: { display: "block", fontSize: 13, color: "#94a3b8", marginBottom: 6 },
  row2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 },
}
