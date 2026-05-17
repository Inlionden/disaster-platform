import { useState, useCallback } from "react"
import { API_URL, Panel, PageHead, Stat, UploadZone, ImageViewer, ToggleRow, RangeRow, Icon, ErrorMsg } from "../lib/ui"

type Phase = "ready" | "done"

export default function Simulate() {
  const [phase, setPhase] = useState<Phase>("ready")
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [result, setResult] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [cx, setCx] = useState(256)
  const [cy, setCy] = useState(256)
  const [radius, setRadius] = useState(80)
  const [crater, setCrater] = useState(true)
  const [burn, setBurn] = useState(true)
  const [debris, setDebris] = useState(true)
  const [smoke, setSmoke] = useState(true)
  const [lens, setLens] = useState(false)

  const activeEffects = [crater, burn, debris, smoke, lens].filter(Boolean).length
  const yieldKt = ((radius / 60) ** 3 * 0.35).toFixed(2)

  async function run() {
    if (!file) return
    setLoading(true); setError(null)
    try {
      const params = { center_x: cx, center_y: cy, radius, crater_effect: crater, burn_effect: burn, debris_effect: debris, smoke_effect: smoke, lens_distortion: lens }
      const form = new FormData()
      form.append("file", file)
      form.append("params", JSON.stringify(params))
      const res = await fetch(`${API_URL}/simulate`, { method: "POST", body: form })
      if (!res.ok) throw new Error(`Server error ${res.status}`)
      setResult((await res.json()).result_png_base64)
      setPhase("done")
    } catch (e: any) { setError(e.message) }
    finally { setLoading(false) }
  }

  function onUpload(f: File) {
    setFile(f); setPreview(URL.createObjectURL(f)); setResult(null); setError(null)
  }

  const crosshairRender = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number) => {
    ctx.clearRect(0, 0, w, h)
    const sx = (cx / 512) * w
    const sy = (cy / 512) * h
    const sr = (radius / 512) * w
    ctx.strokeStyle = "#f43f5e"
    ctx.shadowBlur = 8; ctx.shadowColor = "#f43f5e"; ctx.lineWidth = 1
    ctx.beginPath(); ctx.moveTo(sx - 40, sy); ctx.lineTo(sx + 40, sy); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(sx, sy - 40); ctx.lineTo(sx, sy + 40); ctx.stroke()
    ctx.shadowBlur = 0
    ctx.setLineDash([4, 3])
    ctx.beginPath(); ctx.arc(sx, sy, sr, 0, Math.PI * 2); ctx.stroke()
    ctx.setLineDash([])
    ctx.fillStyle = "#f43f5e"
    ctx.beginPath(); ctx.arc(sx, sy, 3, 0, Math.PI * 2); ctx.fill()
  }, [cx, cy, radius])

  if (phase === "ready") {
    return (
      <div className="fade-in">
        <PageHead num="02" title="Simulate"
          sub="Forward-model parametric blast, fire, and atmospheric perturbations. Upload a capture to begin." />
        <div className="split-2">
          <Panel id="IN-02" name="Source capture" meta="INPUT" noPad>
            <div style={{ padding: 24 }}>
              <UploadZone onUpload={onUpload} label="Drop source capture" sub="single RGB · 512 px recommended" />
              {file && (
                <button className="btn btn-primary btn-full" style={{ marginTop: 12 }}
                  onClick={run} disabled={loading}>
                  <Icon.Bolt /> {loading ? "Simulating…" : "Generate Impact"}
                </button>
              )}
              {error && <ErrorMsg msg={error} />}
            </div>
          </Panel>
          <Panel id="PRESET" name="Preset scenarios">
            <div className="stack" style={{ gap: 10 }}>
              {[
                { name: "Kinetic strike · 250kt yield", desc: "Crater + ejecta · clear sky",    act: () => { setCrater(true); setBurn(true); setDebris(true); setSmoke(false); setLens(false); setRadius(140) } },
                { name: "Urban firestorm",               desc: "Wide burn radius · smoke plume", act: () => { setCrater(false); setBurn(true); setDebris(false); setSmoke(true); setLens(false); setRadius(180) } },
                { name: "Sensor distortion",             desc: "Lens vignette · no damage",      act: () => { setCrater(false); setBurn(false); setDebris(false); setSmoke(false); setLens(true) } },
                { name: "Industrial accident",           desc: "Smoke only · 80m AOE",           act: () => { setCrater(false); setBurn(true); setDebris(true); setSmoke(true); setLens(false); setRadius(80) } },
              ].map(p => (
                <div key={p.name} className="rank-row" onClick={() => { p.act() }}>
                  <div className="rank-badge" style={{ background: "var(--bg-3)", color: "var(--sky)" }}>›</div>
                  <div className="rank-info">
                    <div className="pos">{p.name}</div>
                    <div className="sub">{p.desc}</div>
                  </div>
                  <span className="label-tiny" style={{ color: "var(--sky)" }}>SET</span>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </div>
    )
  }

  return (
    <div className="fade-in">
      <PageHead num="02" title="Simulate"
        sub="Click within the source viewer to relocate the impact point, then re-run."
        right={
          <button className="btn" onClick={() => { setPhase("ready"); setResult(null) }}>
            <Icon.Upload /> New capture
          </button>
        }
      />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 320px", gap: 16, alignItems: "stretch" }}>
        <Panel id="T-0" name="Source · t₀" meta={<span style={{ color: "var(--emerald)" }}>● NOMINAL</span>} noPad>
          <ImageViewer src={preview} canvasRender={crosshairRender}
            onClick={({ x, y }) => { setCx(Math.round(x * 512 / 800)); setCy(Math.round(y * 512 / 800)) }}
            hud={{
              topRight: <span className="viewer-hud-tag">SET IMPACT</span>,
              bottomRight: <span className="viewer-hud-tag">({cx}, {cy}) px</span>,
            }}
          />
        </Panel>

        <Panel id="T-1" name="Simulated · t₁" meta={<span style={{ color: "var(--rose)" }}>● PERTURBED</span>} noPad>
          {result ? (
            <ImageViewer src={`data:image/png;base64,${result}`}
              hud={{
                topRight: <span className="viewer-hud-tag t-rose">Δt = 0s</span>,
                bottomRight: <span className="viewer-hud-tag t-rose">{activeEffects} EFFECTS APPLIED</span>,
              }}
            />
          ) : (
            <div style={{ aspectRatio: "1/1", display: "grid", placeItems: "center", background: "var(--bg-0)" }}>
              <span className="label-tiny">{loading ? "SIMULATING…" : "AWAITING RUN"}</span>
            </div>
          )}
        </Panel>

        <div className="stack">
          <Panel id="IMP" name="Impact parameters">
            <div className="grid-2" style={{ marginBottom: 10 }}>
              <Stat label="X · px" value={cx} accent="sky" />
              <Stat label="Y · px" value={cy} accent="sky" />
            </div>
            <RangeRow name="Radius" value={radius} min={20} max={250} onChange={setRadius} unit=" px" />
            <div className="kv" style={{ marginTop: 12 }}>
              <dt>Equiv. yield</dt><dd className="amber">{yieldKt} kt TNT</dd>
              <dt>AOE</dt><dd>{(Math.PI * radius * radius / 1e3).toFixed(1)} k px²</dd>
              <dt>Blast (est.)</dt><dd>{(radius * 0.5).toFixed(0)} m</dd>
            </div>
          </Panel>

          <Panel id="FX" name="Effect layers">
            <ToggleRow name="Crater geometry" value={crater} onChange={setCrater} hint="DEM perturbation" />
            <ToggleRow name="Thermal burn"    value={burn}   onChange={setBurn}   hint="albedo darkening" />
            <ToggleRow name="Ejecta debris"   value={debris} onChange={setDebris} hint="discrete particles" />
            <ToggleRow name="Smoke plume"     value={smoke}  onChange={setSmoke}  hint="atmospheric opacity" />
            <ToggleRow name="Lens distortion" value={lens}   onChange={setLens}   hint="sensor vignette" />
            <button className="btn btn-primary btn-full" style={{ marginTop: 12 }}
              onClick={run} disabled={loading}>
              <Icon.Bolt /> {loading ? "Simulating…" : "Re-run Simulation"}
            </button>
            {error && <ErrorMsg msg={error} />}
          </Panel>
        </div>
      </div>

      <div style={{ marginTop: 16 }}>
        <Panel id="SUM" name="Perturbation summary">
          <div className="grid-4">
            <Stat label="Blast radius" value={radius} unit=" px" accent="amber" bar={radius / 250}
              foot={["0.5m/px →", (radius * 0.5).toFixed(0) + " m"]} />
            <Stat label="Estimated yield" value={yieldKt} unit=" kt" accent="amber"
              bar={Math.min(1, parseFloat(yieldKt) / 500)} />
            <Stat label="Active effects" value={activeEffects} unit="/5" accent="sky" bar={activeEffects / 5} />
            <Stat label="Impact point" value={`${cx}, ${cy}`} accent="rose" />
          </div>
        </Panel>
      </div>

      {result && (
        <div style={{ marginTop: 16 }}>
          <Panel id="DL" name="Export">
            <a href={`data:image/png;base64,${result}`} download="simulation.png">
              <button className="btn btn-full"><Icon.Download /> Download simulated image</button>
            </a>
          </Panel>
        </div>
      )}
    </div>
  )
}
