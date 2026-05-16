import React, { useState, useRef } from "react"
import { API_URL, PageHeader, Card, SectionTitle, Stat, StatsGrid, UploadBox, Btn, ErrorMsg } from "../lib/ui"

const RANK_COLORS = ["#f87171", "#fb923c", "#fbbf24", "#a3e635", "#34d399"]

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
      if (!res.ok) throw new Error(`Server error ${res.status}`)
      setResult(await res.json())
    } catch (e: any) { setError(e.message) }
    finally { setLoading(false) }
  }

  const matrix: number[][] = result?.density_matrix ?? []
  const n = result?.n_cells ?? 16
  const maxD = result?.targets?.[0]?.density_score ?? 1

  return (
    <div>
      <PageHeader
        title="Strike Optimizer"
        desc="Identifies highest building density zones. Ranked by concentration score. For simulation and research purposes only."
      />

      <Card>
        <SectionTitle>Input Image</SectionTitle>
        <UploadBox preview={preview} onClick={() => fileRef.current?.click()} />
        <input ref={fileRef} type="file" accept=".png,.jpg,.jpeg,.tif,.tiff" style={{ display: "none" }} onChange={onFile} />
        <Btn onClick={run} loading={loading} disabled={!image}>Analyse Targets</Btn>
        {error && <ErrorMsg msg={error} />}
      </Card>

      {result?.best_target && (
        <>
          <Card style={{ border: "1px solid rgba(248,113,113,0.25)", background: "rgba(248,113,113,0.04)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#f87171", boxShadow: "0 0 8px #f87171" }} />
              <SectionTitle>Optimal Target</SectionTitle>
            </div>
            <StatsGrid>
              <Stat label="Position X" value={String(result.best_target.center_x_orig)} accent="#f87171" />
              <Stat label="Position Y" value={String(result.best_target.center_y_orig)} accent="#f87171" />
              <Stat label="Density Score" value={(result.best_target.density_score * 100).toFixed(1) + "%"} accent="#f87171" />
              <Stat label="Blast Radius" value={result.best_target.estimated_blast_radius + "px"} accent="#f87171" />
            </StatsGrid>
          </Card>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <Card>
              <SectionTitle>Top 5 Target Zones</SectionTitle>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {result.targets.map((t: any) => (
                  <div key={t.rank} style={{ display: "flex", alignItems: "center", gap: 12, background: "#060910", borderRadius: 8, padding: "10px 14px", border: `1px solid ${RANK_COLORS[t.rank-1]}20` }}>
                    <span style={{ color: RANK_COLORS[t.rank-1], fontWeight: 800, fontSize: 16, width: 22, textAlign: "center" }}>{t.rank}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ height: 4, background: "#1e293b", borderRadius: 2, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${(t.density_score / maxD) * 100}%`, background: RANK_COLORS[t.rank-1], borderRadius: 2 }} />
                      </div>
                    </div>
                    <span style={{ fontSize: 12, color: RANK_COLORS[t.rank-1], fontWeight: 600, width: 44, textAlign: "right" }}>{(t.density_score * 100).toFixed(0)}%</span>
                    <span style={{ fontSize: 11, color: "#334155", width: 90, textAlign: "right" }}>({t.center_x_orig}, {t.center_y_orig})</span>
                  </div>
                ))}
              </div>
            </Card>

            <Card>
              <SectionTitle>Density Grid</SectionTitle>
              <div style={{ display: "grid", gridTemplateColumns: `repeat(${n}, 1fr)`, gap: 1.5, borderRadius: 8, overflow: "hidden", border: "1px solid rgba(255,255,255,0.05)" }}>
                {matrix.flat().map((v, i) => {
                  const row = Math.floor(i / n)
                  const col = i % n
                  const topTarget = result.targets.find((t: any) => t.cell_row === row && t.cell_col === col)
                  const intensity = maxD > 0 ? v / maxD : 0
                  return (
                    <div key={i} title={`${(v*100).toFixed(1)}%`} style={{
                      aspectRatio: "1",
                      background: topTarget ? RANK_COLORS[topTarget.rank-1] : `rgba(239,68,68,${0.05 + intensity * 0.6})`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 7, fontWeight: 800, color: topTarget ? "#060910" : "transparent",
                    }}>
                      {topTarget ? topTarget.rank : ""}
                    </div>
                  )
                })}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10, alignItems: "center" }}>
                <span style={{ fontSize: 11, color: "#1e293b" }}>Low density</span>
                <div style={{ flex: 1, height: 3, margin: "0 10px", borderRadius: 2, background: "linear-gradient(to right, #1e293b, #ef4444)" }} />
                <span style={{ fontSize: 11, color: "#f87171" }}>High density</span>
              </div>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}
