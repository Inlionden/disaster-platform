import { useState, useCallback } from "react"
import { API_URL, Panel, PageHead, Stat, UploadZone, ImageViewer, RangeRow, Icon, ErrorMsg } from "../lib/ui"

const RANK_PALETTE = ["#f43f5e", "#fb923c", "#f59e0b", "#84cc16", "#34d399"]

type Phase = "ready" | "done"

export default function Strike() {
  const [phase, setPhase] = useState<Phase>("ready")
  const [preview, setPreview] = useState<string | null>(null)
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selected, setSelected] = useState(0)
  const [radius, setRadius] = useState(80)
  const [imgSize, setImgSize] = useState({ w: 512, h: 512 })

  async function onUpload(f: File) {
    setPreview(URL.createObjectURL(f))
    setResult(null); setError(null); setSelected(0)
    // Read image dimensions for canvas normalization
    const img = new Image()
    img.src = URL.createObjectURL(f)
    img.onload = () => setImgSize({ w: img.naturalWidth, h: img.naturalHeight })
    setLoading(true)
    try {
      const form = new FormData()
      form.append("file", f)
      const res = await fetch(`${API_URL}/strike`, { method: "POST", body: form })
      if (!res.ok) throw new Error(`Server error ${res.status}`)
      setResult(await res.json())
      setPhase("done")
    } catch (e: any) { setError(e.message) }
    finally { setLoading(false) }
  }

  const targets: any[] = result?.targets ?? []
  const best = result?.best_target
  const maxD = targets[0]?.density_score ?? 1

  // canvas overlay: dim image + rings + rank badges
  const rankOverlay = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number) => {
    ctx.clearRect(0, 0, w, h)
    if (!targets.length) return
    const scaleX = w / imgSize.w
    const scaleY = h / imgSize.h
    const r = radius * Math.min(scaleX, scaleY)

    // Dim background
    ctx.fillStyle = "rgba(0,0,0,0.35)"
    ctx.fillRect(0, 0, w, h)

    // Cut holes
    ctx.globalCompositeOperation = "destination-out"
    for (const t of targets) {
      const cx = t.center_x_orig * scaleX
      const cy = t.center_y_orig * scaleY
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r * 1.3)
      grad.addColorStop(0, "rgba(0,0,0,1)")
      grad.addColorStop(0.7, "rgba(0,0,0,0.5)")
      grad.addColorStop(1, "rgba(0,0,0,0)")
      ctx.fillStyle = grad
      ctx.beginPath(); ctx.arc(cx, cy, r * 1.3, 0, Math.PI * 2); ctx.fill()
    }
    ctx.globalCompositeOperation = "source-over"

    // Draw rings + labels
    for (const t of targets) {
      const cx = t.center_x_orig * scaleX
      const cy = t.center_y_orig * scaleY
      const col = RANK_PALETTE[Math.min(RANK_PALETTE.length - 1, t.rank - 1)]
      const isSel = selected === t.rank - 1

      ctx.strokeStyle = col
      ctx.lineWidth = isSel ? 2.5 : 1.5
      ctx.setLineDash(isSel ? [] : [4, 3])
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke()
      ctx.setLineDash([])

      // Crosshair ticks
      ctx.beginPath()
      ctx.moveTo(cx - r - 8, cy); ctx.lineTo(cx - r + 4, cy)
      ctx.moveTo(cx + r - 4, cy); ctx.lineTo(cx + r + 8, cy)
      ctx.moveTo(cx, cy - r - 8); ctx.lineTo(cx, cy - r + 4)
      ctx.moveTo(cx, cy + r - 4); ctx.lineTo(cx, cy + r + 8)
      ctx.stroke()

      // Center dot
      ctx.fillStyle = col
      ctx.beginPath(); ctx.arc(cx, cy, 3, 0, Math.PI * 2); ctx.fill()

      // Rank badge
      ctx.fillStyle = col
      ctx.fillRect(cx + r + 6, cy - 10, 22, 20)
      ctx.fillStyle = "#03101a"
      ctx.font = 'bold 13px "JetBrains Mono", monospace'
      ctx.textBaseline = "middle"; ctx.textAlign = "center"
      ctx.fillText("#" + t.rank, cx + r + 17, cy)
    }
  }, [targets, selected, radius, imgSize])

  if (phase === "ready") {
    return (
      <div className="fade-in">
        <PageHead num="05" title="Strike Optimizer"
          sub="Identify top-k high-density target zones under a configurable blast radius. Simulation only." />
        <div style={{
          padding: 12, marginBottom: 16, border: "1px solid var(--amber-dim)",
          background: "rgba(245,158,11,0.05)", borderRadius: "var(--r-1)",
          display: "flex", gap: 12, alignItems: "center",
          fontFamily: "var(--f-mono)", fontSize: 11, letterSpacing: "0.12em", color: "var(--amber)",
        }}>
          <Icon.Info style={{ width: 14, height: 14, flexShrink: 0 }} />
          SIMULATION ONLY · NO OPERATIONAL USE · RESEARCH OUTPUT BOUND TO IRB-2026-117
        </div>
        <Panel id="IN-05" name="Source capture" noPad>
          <div style={{ padding: 24 }}>
            <UploadZone onUpload={onUpload} />
            {loading && <div className="label-tiny" style={{ marginTop: 12, textAlign: "center" }}>COMPUTING DENSITY…</div>}
            {error && <ErrorMsg msg={error} />}
          </div>
        </Panel>
      </div>
    )
  }

  const selTarget = targets[selected]

  return (
    <div className="fade-in">
      <PageHead num="05" title="Strike Optimizer" sub="Top-k density-ranked zones. Simulation only."
        right={
          <button className="btn" onClick={() => { setPhase("ready"); setResult(null) }}>
            <Icon.Upload /> New capture
          </button>
        }
      />

      <div style={{
        padding: "8px 12px", marginBottom: 16,
        border: "1px solid var(--amber-dim)", background: "rgba(245,158,11,0.04)",
        borderRadius: "var(--r-1)", display: "flex", gap: 14, alignItems: "center",
        fontFamily: "var(--f-mono)", fontSize: 10.5, letterSpacing: "0.14em",
        color: "var(--amber)", textTransform: "uppercase",
      }}>
        <Icon.Info style={{ width: 14, height: 14, flexShrink: 0 }} />
        ADVISORY · SIMULATION OUTPUT BOUND TO IRB-2026-117 · RESEARCH USE ONLY
        <span style={{ flex: 1 }} />
        <span style={{ color: "var(--t-3)" }}>FRAME 00432 · 02:14:18 UTC</span>
      </div>

      <div className="split-2">
        <Panel id="MAP" name="Target overlay" meta={<span>TOP-{targets.length} · r={radius}px</span>} noPad>
          <ImageViewer src={preview} canvasRender={rankOverlay}
            hud={{
              topRight: <span className="viewer-hud-tag">{targets.length} TARGETS</span>,
              bottomRight: <span className="viewer-hud-tag t-rose">SELECTED · #{selTarget?.rank ?? "—"}</span>,
            }}
          />
        </Panel>

        <div className="stack">
          <Panel id="TGT" name={`Ranked candidates · k=${targets.length}`}>
            {targets.map((t: any, i: number) => {
              const col = RANK_PALETTE[Math.min(RANK_PALETTE.length - 1, t.rank - 1)]
              return (
                <div key={t.rank} className={"rank-row" + (selected === i ? " active" : "")}
                  onClick={() => setSelected(i)}>
                  <div className="rank-badge" style={{ background: col }}>#{t.rank}</div>
                  <div className="rank-info">
                    <div className="pos">({t.center_x_orig}, {t.center_y_orig}) px</div>
                    <div className="sub">RANK {t.rank} · BW {t.estimated_blast_radius ?? radius}px</div>
                  </div>
                  <div className="rank-val" style={{ color: col }}>
                    {(t.density_score * 100).toFixed(0)}%
                  </div>
                </div>
              )
            })}
          </Panel>

          {selTarget && (
            <Panel id="DET" name={`Detail · #${selTarget.rank}`}
              meta={<span style={{ color: RANK_PALETTE[Math.min(4, selTarget.rank - 1)] }}>● PRIMARY</span>}>
              <div className="grid-2">
                <Stat label="Position · X" value={selTarget.center_x_orig} unit=" px" accent="sky" />
                <Stat label="Position · Y" value={selTarget.center_y_orig} unit=" px" accent="sky" />
                <Stat label="Density score" value={(selTarget.density_score * 100).toFixed(0)} unit="%"
                  accent="rose" bar={selTarget.density_score / maxD} />
                <Stat label="Blast radius" value={selTarget.estimated_blast_radius ?? radius} unit=" px"
                  accent="amber" bar={(selTarget.estimated_blast_radius ?? radius) / 200} />
              </div>
              <div style={{ marginTop: 12 }}>
                <dl className="kv">
                  <dt>Density score</dt><dd className="rose">{(selTarget.density_score * 100).toFixed(2)}%</dd>
                  <dt>Surrogate yield</dt>
                  <dd className="amber">{(((selTarget.estimated_blast_radius ?? radius) / 60) ** 3 * 0.35).toFixed(2)} kt</dd>
                </dl>
              </div>
            </Panel>
          )}

          <Panel id="CTL" name="Parameters">
            <RangeRow name="Blast radius" value={radius} min={40} max={200} step={5}
              onChange={setRadius} unit=" px" />
          </Panel>
        </div>
      </div>

      {best && (
        <div style={{ marginTop: 16 }}>
          <Panel id="OPT" name="Optimal target · #1">
            <div className="grid-4">
              <Stat label="Position X" value={best.center_x_orig} unit=" px" accent="rose" />
              <Stat label="Position Y" value={best.center_y_orig} unit=" px" accent="rose" />
              <Stat label="Density score" value={(best.density_score * 100).toFixed(1)} unit="%"
                accent="rose" bar={best.density_score} />
              <Stat label="Blast radius" value={best.estimated_blast_radius} unit=" px"
                accent="amber" bar={best.estimated_blast_radius / 200} />
            </div>
          </Panel>
        </div>
      )}
    </div>
  )
}
