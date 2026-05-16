import React, { useState, useRef } from "react"
import { s, API_URL, UploadBox, Btn, Stat } from "../lib/ui"

export default function Strike() {
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
      const res = await fetch(`${API_URL}/strike`, { method: "POST", body: form })
      if (!res.ok) throw new Error(`Error ${res.status}`)
      setResult(await res.json())
    } catch (e: any) { setError(e.message) }
    finally { setLoading(false) }
  }

  const rankColors = ["#f87171", "#fb923c", "#fbbf24", "#a3e635", "#34d399"]
  const matrix: number[][] = result?.density_matrix ?? []
  const maxD = result?.targets?.[0]?.density_score ?? 1

  return (
    <div>
      <h1 style={s.h1}>Strike Optimizer</h1>
      <p style={s.sub}>Identifies highest density zones based on building concentration. For simulation and research purposes only.</p>

      <div style={s.card}>
        <UploadBox preview={preview} onClick={() => fileRef.current?.click()} />
        <input ref={fileRef} type="file" accept=".png,.jpg,.jpeg,.tif,.tiff" style={{ display: "none" }} onChange={onFile} />
        <Btn onClick={run} loading={loading} disabled={!image}>Analyse Targets</Btn>
        {error && <p style={s.error}>{error}</p>}
      </div>

      {result && (
        <div style={s.card}>
          <h2 style={s.h2}>Target Analysis</h2>

          {result.best_target && (
            <div style={{ background: "#0f172a", borderRadius: 10, padding: 16, marginBottom: 20, border: "2px solid #f87171" }}>
              <div style={{ color: "#f87171", fontWeight: 700, fontSize: 13, marginBottom: 8 }}>OPTIMAL TARGET</div>
              <div style={s.statsRow}>
                <Stat label="Position X" value={String(result.best_target.center_x_orig)} />
                <Stat label="Position Y" value={String(result.best_target.center_y_orig)} />
                <Stat label="Density Score" value={(result.best_target.density_score * 100).toFixed(1) + "%"} />
                <Stat label="Blast Radius" value={result.best_target.estimated_blast_radius + "px"} />
              </div>
            </div>
          )}

          <h3 style={s.h3}>Top 5 Target Zones</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
            {result.targets.map((t: any) => (
              <div key={t.rank} style={{ display: "flex", alignItems: "center", gap: 12, background: "#0f172a", borderRadius: 8, padding: "10px 16px", border: `1px solid ${rankColors[t.rank - 1]}` }}>
                <span style={{ color: rankColors[t.rank - 1], fontWeight: 700, fontSize: 18, width: 24 }}>#{t.rank}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ height: 6, background: "#1e293b", borderRadius: 3, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${(t.density_score / maxD) * 100}%`, background: rankColors[t.rank - 1], borderRadius: 3 }} />
                  </div>
                </div>
                <span style={{ color: "#94a3b8", fontSize: 13, width: 80, textAlign: "right" }}>{(t.density_score * 100).toFixed(1)}% density</span>
                <span style={{ color: "#64748b", fontSize: 12, width: 100, textAlign: "right" }}>({t.center_x_orig}, {t.center_y_orig})</span>
              </div>
            ))}
          </div>

          <h3 style={s.h3}>Density Grid</h3>
          <div style={{ display: "grid", gridTemplateColumns: `repeat(${result.n_cells}, 1fr)`, gap: 1, background: "#0f172a", borderRadius: 6, overflow: "hidden" }}>
            {matrix.flat().map((v, i) => {
              const intensity = maxD > 0 ? v / maxD : 0
              const isTop = result.targets.some((t: any) => {
                const row = Math.floor(i / result.n_cells)
                const col = i % result.n_cells
                return t.cell_row === row && t.cell_col === col
              })
              const topRank = result.targets.find((t: any) => t.cell_row === Math.floor(i / result.n_cells) && t.cell_col === i % result.n_cells)
              return (
                <div key={i} style={{
                  aspectRatio: "1",
                  background: isTop ? rankColors[topRank.rank - 1] : `rgba(220,${Math.round((1-intensity)*100)},30,${0.3 + intensity * 0.7})`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 8, color: "#fff", fontWeight: 700
                }}>
                  {isTop ? `#${topRank.rank}` : ""}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
