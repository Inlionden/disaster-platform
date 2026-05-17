import { useState } from "react"
import { API_URL, Panel, PageHead, Stat, UploadZone, ImageViewer, ToggleRow, Icon, ErrorMsg } from "../lib/ui"

type Phase = "ready" | "done"

export default function Density() {
  const [phase, setPhase] = useState<Phase>("ready")
  const [preview, setPreview] = useState<string | null>(null)
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [gridN] = useState(16)
  const [showHeatmap, setShowHeatmap] = useState(true)
  const [hover, setHover] = useState<{ x: number; y: number; v: number } | null>(null)

  async function onUpload(f: File) {
    setPreview(URL.createObjectURL(f)); setResult(null); setError(null)
    setLoading(true)
    try {
      const form = new FormData()
      form.append("file", f)
      const res = await fetch(`${API_URL}/density`, { method: "POST", body: form })
      if (!res.ok) throw new Error(`Server error ${res.status}`)
      setResult(await res.json())
      setPhase("done")
    } catch (e: any) { setError(e.message) }
    finally { setLoading(false) }
  }

  const matrix: number[][] = result?.density_matrix ?? []
  const maxD: number = result?.max_density ?? 1
  const n: number = result?.n_cells ?? gridN

  const cellColor = (v: number) => {
    const t = maxD > 0 ? v / maxD : 0
    if (t === 0) return "rgba(255,255,255,0.02)"
    let r, g, b
    if (t < 0.33) { const k = t / 0.33; r = 11 + (37 - 11) * k; g = 21 + (99 - 21) * k; b = 48 + (235 - 48) * k }
    else if (t < 0.66) { const k = (t - 0.33) / 0.33; r = 37 + (245 - 37) * k; g = 99 + (158 - 99) * k; b = 235 + (11 - 235) * k }
    else { const k = (t - 0.66) / 0.34; r = 245 + (239 - 245) * k; g = 158 + (68 - 158) * k; b = 11 + (68 - 11) * k }
    return `rgba(${r | 0}, ${g | 0}, ${b | 0}, ${Math.max(0.18, t)})`
  }

  if (phase === "ready") {
    return (
      <div className="fade-in">
        <PageHead num="03" title="Density"
          sub="Kernel density estimation over detected structures. Projects KDE onto an N × N spatial grid for population-proxy mapping." />
        <Panel id="IN-03" name="Source capture" noPad>
          <div style={{ padding: 24 }}>
            <UploadZone onUpload={onUpload} />
            {loading && <div className="label-tiny" style={{ marginTop: 12, textAlign: "center" }}>COMPUTING…</div>}
            {error && <ErrorMsg msg={error} />}
          </div>
        </Panel>
      </div>
    )
  }

  const nonZero = matrix.flat().filter(v => v > 0).length

  return (
    <div className="fade-in">
      <PageHead num="03" title="Density"
        sub="Kernel density estimation over detected structures, projected onto an N × N grid."
        right={
          <button className="btn" onClick={() => { setPhase("ready"); setResult(null) }}>
            <Icon.Upload /> New capture
          </button>
        }
      />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 280px", gap: 16, alignItems: "stretch" }}>
        <Panel id="KDE" name="KDE overlay" meta={<span>BW · Silverman</span>} noPad>
          <ImageViewer
            src={preview}
            overlayB64={showHeatmap && result?.kde_heatmap_base64 ? result.kde_heatmap_base64 : null}
            hud={{
              topRight: <span className="viewer-hud-tag">KDE · GAUSSIAN</span>,
              bottomRight: <span className="viewer-hud-tag">{result?.building_count ?? "—"} POINTS</span>,
            }}
          />
        </Panel>

        <Panel id="GRID" name={`Density grid · ${n}×${n}`} meta={<span>{n * n} CELLS</span>}>
          <div className="density-grid" style={{ gridTemplateColumns: `repeat(${n}, 1fr)`, gridTemplateRows: `repeat(${n}, 1fr)` }}>
            {matrix.map((row, y) =>
              row.map((v, x) => (
                <div key={`${x}-${y}`} className="cell" style={{ background: cellColor(v) }}
                  onMouseEnter={() => setHover({ x, y, v })}
                  onMouseLeave={() => setHover(null)}
                  title={`(${x}, ${y}) · ${(v * 100).toFixed(1)}%`}>
                  {v > 0 && n <= 16 ? (v * 100).toFixed(0) : ""}
                </div>
              ))
            )}
          </div>
          <div style={{ marginTop: 12, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div className="legend">
              <span>LOW</span><span className="legend-bar" /><span>HIGH</span>
            </div>
            {hover ? (
              <div className="mono" style={{ fontSize: 11, color: "var(--t-2)" }}>
                CELL ({hover.x},{hover.y}) · <span style={{ color: "var(--sky)" }}>{(hover.v * 100).toFixed(1)}%</span>
              </div>
            ) : (
              <div className="mono" style={{ fontSize: 11, color: "var(--t-3)" }}>hover · inspect cell</div>
            )}
          </div>
        </Panel>

        <div className="stack">
          <Panel id="STAT" name="Density statistics">
            <div className="grid-2">
              <Stat label="Buildings" value={result?.building_count ?? "—"} accent="sky" foot={["DETECTED", ""]} />
              <Stat label="Max density" value={result ? (result.max_density * 100).toFixed(1) + "%" : "—"} accent="rose"
                bar={result?.max_density ?? 0} />
              <Stat label="Mean density" value={result ? (result.mean_density * 100).toFixed(1) + "%" : "—"} accent="amber"
                bar={result ? result.mean_density / (result.max_density || 1) : 0} />
              <Stat label="Coverage" value={nonZero + "/" + (n * n)} accent="emerald"
                bar={nonZero / (n * n)} />
            </div>
            <div style={{ marginTop: 12 }}>
              <dl className="kv">
                <dt>Kernel</dt><dd>Gaussian</dd>
                <dt>Grid resolution</dt><dd>{n} × {n}</dd>
                <dt>Method</dt><dd>Silverman</dd>
              </dl>
            </div>
          </Panel>

          <Panel id="CTL" name="Parameters">
            <ToggleRow name="Show heatmap" value={showHeatmap} onChange={setShowHeatmap} />
          </Panel>
        </div>
      </div>
    </div>
  )
}
