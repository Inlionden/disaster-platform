import React, { useState, useRef } from "react"
import { API_URL, toB64Img, PageHeader, Card, SectionTitle, Stat, StatsGrid, UploadBox, Btn, ErrorMsg, TwoCol, ResultImage } from "../lib/ui"

export default function Density() {
  const [image, setImage] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]; if (!f) return
    setImage(f); setPreview(URL.createObjectURL(f)); setResult(null); setError(null)
  }

  async function run() {
    if (!image) return
    setLoading(true); setError(null)
    try {
      const form = new FormData()
      form.append("file", image)
      const res = await fetch(`${API_URL}/density`, { method: "POST", body: form })
      if (!res.ok) throw new Error(`Server error ${res.status}`)
      setResult(await res.json())
    } catch (e: any) { setError(e.message) }
    finally { setLoading(false) }
  }

  const matrix: number[][] = result?.density_matrix ?? []
  const maxD = result?.max_density ?? 1
  const n = result?.n_cells ?? 16

  return (
    <div>
      <PageHeader title="Population Density Map" desc="Computes building density per zone using KDE over detected building centroids. High density zones indicate dense urban areas." />

      <Card>
        <SectionTitle>Input Image</SectionTitle>
        <UploadBox preview={preview} onClick={() => fileRef.current?.click()} />
        <input ref={fileRef} type="file" accept=".png,.jpg,.jpeg,.tif,.tiff" style={{ display: "none" }} onChange={onFile} />
        <Btn onClick={run} loading={loading} disabled={!image}>Compute Density</Btn>
        {error && <ErrorMsg msg={error} />}
      </Card>

      {result && (
        <>
          <Card>
            <SectionTitle>Zone Statistics</SectionTitle>
            <StatsGrid>
              <Stat label="Buildings Detected" value={String(result.building_count)} />
              <Stat label="Max Density" value={(result.max_density * 100).toFixed(1) + "%"} accent="#f87171" />
              <Stat label="Mean Density" value={(result.mean_density * 100).toFixed(1) + "%"} accent="#fbbf24" />
              <Stat label="Grid Size" value={`${n}×${n}`} accent="#a78bfa" />
            </StatsGrid>
          </Card>

          <Card>
            <SectionTitle>Heatmap & Grid</SectionTitle>
            <TwoCol>
              <ResultImage src={toB64Img(result.kde_heatmap_base64)} label="KDE Density Heatmap" />
              <div>
                <div style={{ fontSize: 12, color: "#475569", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>Grid Density</div>
                <div style={{ display: "grid", gridTemplateColumns: `repeat(${n}, 1fr)`, gap: 1.5, borderRadius: 8, overflow: "hidden", border: "1px solid rgba(255,255,255,0.06)" }}>
                  {matrix.flat().map((v, i) => {
                    const t = maxD > 0 ? v / maxD : 0
                    const r = Math.round(t * 239)
                    const g = Math.round(68 + (1 - t) * 60)
                    const b = Math.round(68 - t * 40)
                    return (
                      <div key={i} title={`${(v * 100).toFixed(1)}%`} style={{ aspectRatio: "1", background: `rgb(${r},${g},${b})`, opacity: 0.15 + t * 0.85 }} />
                    )
                  })}
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
                  <span style={{ fontSize: 11, color: "#1e293b" }}>Low</span>
                  <div style={{ flex: 1, height: 4, margin: "6px 8px 0", borderRadius: 2, background: "linear-gradient(to right, #444,#ef4444)" }} />
                  <span style={{ fontSize: 11, color: "#f87171" }}>High</span>
                </div>
              </div>
            </TwoCol>
          </Card>
        </>
      )}
    </div>
  )
}
