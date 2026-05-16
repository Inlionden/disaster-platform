import React, { useEffect, useState, useRef } from "react"

const API_URL = "https://inlionde4n-disaster-platform-api.hf.space"

interface AnalyzeResult {
  building_pixels: number
  total_pixels: number
  coverage_pct: number
  edl_uncertainty_mean: number
  claam_agreement_mean: number
  mask_png_base64: string
  original_size: [number, number]
}

export default function App() {
  const [apiStatus, setApiStatus] = useState<string>("checking...")
  const [image, setImage] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [result, setResult] = useState<AnalyzeResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetch(`${API_URL}/health`)
      .then((r) => r.json())
      .then((d) => setApiStatus(d.status))
      .catch(() => setApiStatus("offline"))
  }, [])

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setImage(file)
    setPreview(URL.createObjectURL(file))
    setResult(null)
    setError(null)
  }

  async function onAnalyze() {
    if (!image) return
    setLoading(true)
    setError(null)
    try {
      const form = new FormData()
      form.append("file", image)
      const res = await fetch(`${API_URL}/analyze`, { method: "POST", body: form })
      if (!res.ok) throw new Error(`Server error: ${res.status}`)
      const data: AnalyzeResult = await res.json()
      setResult(data)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>Disaster Platform</h1>
        <span style={{ ...styles.badge, background: apiStatus === "healthy" ? "#16a34a" : "#dc2626" }}>
          API {apiStatus}
        </span>
      </div>

      {/* Upload */}
      <div style={styles.card}>
        <h2 style={styles.sectionTitle}>Upload Aerial Image</h2>
        <div style={styles.uploadBox} onClick={() => fileRef.current?.click()}>
          {preview
            ? <img src={preview} alt="preview" style={styles.previewImg} />
            : <p style={{ color: "#6b7280" }}>Click to upload PNG / JPG / TIF</p>}
        </div>
        <input ref={fileRef} type="file" accept=".png,.jpg,.jpeg,.tif,.tiff" style={{ display: "none" }} onChange={onFileChange} />
        <button style={{ ...styles.btn, opacity: image && !loading ? 1 : 0.5 }} disabled={!image || loading} onClick={onAnalyze}>
          {loading ? "Analyzing..." : "Run Segmentation"}
        </button>
        {error && <p style={{ color: "#dc2626", marginTop: 8 }}>{error}</p>}
      </div>

      {/* Results */}
      {result && (
        <div style={styles.card}>
          <h2 style={styles.sectionTitle}>Results</h2>

          {/* Stats */}
          <div style={styles.statsRow}>
            <Stat label="Buildings" value={result.building_pixels.toLocaleString()} unit="px" />
            <Stat label="Coverage" value={result.coverage_pct.toFixed(1)} unit="%" />
            <Stat label="EDL Uncertainty" value={result.edl_uncertainty_mean.toFixed(4)} />
            <Stat label="CLAAM Agreement" value={result.claam_agreement_mean.toFixed(4)} />
          </div>

          {/* Mask */}
          <h3 style={{ marginTop: 24, marginBottom: 8, color: "#374151" }}>Segmentation Mask</h3>
          <img
            src={`data:image/png;base64,${result.mask_png_base64}`}
            alt="mask"
            style={{ width: "100%", borderRadius: 8, border: "1px solid #e5e7eb" }}
          />
        </div>
      )}
    </div>
  )
}

function Stat({ label, value, unit }: { label: string; value: string; unit?: string }) {
  return (
    <div style={styles.statCard}>
      <div style={styles.statValue}>{value}<span style={styles.statUnit}>{unit}</span></div>
      <div style={styles.statLabel}>{label}</div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  page: { maxWidth: 900, margin: "0 auto", padding: "2rem 1rem", fontFamily: "sans-serif", background: "#f9fafb", minHeight: "100vh" },
  header: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 },
  title: { margin: 0, fontSize: 28, fontWeight: 700, color: "#111827" },
  badge: { padding: "4px 12px", borderRadius: 999, color: "#fff", fontSize: 13, fontWeight: 600 },
  card: { background: "#fff", borderRadius: 12, padding: 24, marginBottom: 24, boxShadow: "0 1px 4px rgba(0,0,0,0.08)" },
  sectionTitle: { margin: "0 0 16px", fontSize: 18, fontWeight: 600, color: "#111827" },
  uploadBox: { border: "2px dashed #d1d5db", borderRadius: 8, padding: 32, textAlign: "center", cursor: "pointer", marginBottom: 16, minHeight: 120, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" },
  previewImg: { maxHeight: 300, maxWidth: "100%", borderRadius: 6 },
  btn: { background: "#2563eb", color: "#fff", border: "none", borderRadius: 8, padding: "10px 24px", fontSize: 15, fontWeight: 600, cursor: "pointer", width: "100%" },
  statsRow: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 },
  statCard: { background: "#f3f4f6", borderRadius: 8, padding: 16, textAlign: "center" },
  statValue: { fontSize: 22, fontWeight: 700, color: "#1d4ed8" },
  statUnit: { fontSize: 13, fontWeight: 400, marginLeft: 2, color: "#6b7280" },
  statLabel: { fontSize: 12, color: "#6b7280", marginTop: 4 },
}
