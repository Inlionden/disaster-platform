import React, { useState, useRef } from "react"
import { s, API_URL, toB64Img, UploadBox, Btn, Stat } from "../lib/ui"

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
      if (!res.ok) throw new Error(`Error ${res.status}`)
      setResult(await res.json())
    } catch (e: any) { setError(e.message) }
    finally { setLoading(false) }
  }

  const matrix: number[][] = result?.density_matrix ?? []
  const maxD = result?.max_density ?? 1

  return (
    <div>
      <h1 style={s.h1}>Population Density Map</h1>
      <p style={s.sub}>Analyse building density across zones using KDE over detected building centroids.</p>

      <div style={s.card}>
        <UploadBox preview={preview} onClick={() => fileRef.current?.click()} />
        <input ref={fileRef} type="file" accept=".png,.jpg,.jpeg,.tif,.tiff" style={{ display: "none" }} onChange={onFile} />
        <Btn onClick={run} loading={loading} disabled={!image}>Compute Density</Btn>
        {error && <p style={s.error}>{error}</p>}
      </div>

      {result && (
        <div style={s.card}>
          <h2 style={s.h2}>Results</h2>
          <div style={s.statsRow}>
            <Stat label="Buildings Detected" value={String(result.building_count)} />
            <Stat label="Max Density" value={(result.max_density * 100).toFixed(1) + "%"} />
            <Stat label="Mean Density" value={(result.mean_density * 100).toFixed(1) + "%"} />
            <Stat label="Grid Size" value={`${result.n_cells}×${result.n_cells}`} />
          </div>

          <div style={s.row2}>
            <div>
              <h3 style={s.h3}>KDE Heatmap</h3>
              <img src={toB64Img(result.kde_heatmap_base64)} alt="kde" style={s.resultImg} />
            </div>
            <div>
              <h3 style={s.h3}>Grid Density</h3>
              <div style={{ display: "grid", gridTemplateColumns: `repeat(${result.n_cells}, 1fr)`, gap: 1, background: "#0f172a", borderRadius: 6, overflow: "hidden" }}>
                {matrix.flat().map((v, i) => {
                  const intensity = maxD > 0 ? v / maxD : 0
                  const r = Math.round(intensity * 220)
                  const g = Math.round((1 - intensity) * 100)
                  return <div key={i} style={{ aspectRatio: "1", background: `rgb(${r},${g},30)`, opacity: 0.85 }} title={`${(v * 100).toFixed(1)}%`} />
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
