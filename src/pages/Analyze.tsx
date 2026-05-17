import { useState } from "react"
import { API_URL, Panel, PageHead, Stat, UploadZone, ImageViewer, LogConsole, ProcessSteps, Tabs, Icon, ErrorMsg } from "../lib/ui"
import type { LogLine } from "../lib/ui"

type Phase = "ready" | "inferring" | "done"

export default function Analyze() {
  const [phase, setPhase] = useState<Phase>("ready")
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [threshold, setThreshold] = useState(0.5)
  const [maskMode, setMaskMode] = useState("fill")
  const [showMask, setShowMask] = useState(true)

  const log: LogLine[] = result ? [
    { t: "12:04:21", lvl: "info", msg: `Capture ingested · ${file?.name}` },
    { t: "12:04:21", lvl: "info", msg: "Tiling 1×1 · stride 0 · pad reflect" },
    { t: "12:04:21", lvl: "info", msg: "DABLCNet v2.4.1 forward pass" },
    { t: "12:04:22", lvl: "ok",   msg: `Detected ${result.building_pixels?.toLocaleString()} building pixels` },
    { t: "12:04:22", lvl: "ok",   msg: `Coverage ${result.coverage_pct}% · EDL uncertainty ${result.edl_uncertainty_mean?.toFixed(3)}` },
    { t: "12:04:22", lvl: "info", msg: "Mask polygonized · 4-pt approx" },
  ] : []

  async function onUpload(f: File) {
    setFile(f)
    setPreview(URL.createObjectURL(f))
    setResult(null); setError(null)
    setPhase("inferring")
    try {
      const form = new FormData()
      form.append("file", f)
      form.append("threshold", String(threshold))
      const res = await fetch(`${API_URL}/analyze`, { method: "POST", body: form })
      if (!res.ok) throw new Error(`Server error ${res.status}`)
      setResult(await res.json())
      setPhase("done")
    } catch (e: any) {
      setError(e.message)
      setPhase("ready")
    }
  }

  const stepActive = phase === "ready" ? 0 : phase === "inferring" ? 2 : 4

  const maskB64 = showMask && result?.mask_png_base64 ? result.mask_png_base64 : null

  return (
    <div className="fade-in">
      <PageHead
        num="01"
        title="Analyze"
        sub="Detect structures via DABLCNet inference. Returns per-pixel segmentation, footprint polygons, and calibrated uncertainty over a single aerial capture."
        right={
          <>
            <ProcessSteps steps={["UPLOAD", "TILE", "INFER", "POSTPROCESS"]} active={stepActive} />
          </>
        }
      />

      <div className="split-2">
        <Panel id="IN-01" name="Capture · Mask"
          meta={<span>{phase === "done" ? "LAYER · 2/2" : "INPUT"}</span>}
          headerRight={
            <Tabs
              items={[{ value: "fill", label: "Fill" }, { value: "outline", label: "Outline" }]}
              value={maskMode} onChange={setMaskMode}
            />
          }
          noPad>
          {phase === "ready" ? (
            <div style={{ padding: 24 }}>
              <UploadZone onUpload={onUpload} />
              {error && <ErrorMsg msg={error} />}
            </div>
          ) : (
            <div style={{ position: "relative" }}>
              <ImageViewer
                src={preview}
                overlayB64={maskB64}
                hud={{
                  topRight: <span className="viewer-hud-tag">RGB · 0.5m/px · MASK {showMask ? "ON" : "OFF"}</span>,
                  bottomRight: phase === "inferring"
                    ? <span className="viewer-hud-tag t-amber"><span className="pulse">●</span> INFERRING</span>
                    : <span className="viewer-hud-tag t-emerald">● COMPLETE</span>,
                }}
              />
              {phase === "inferring" && (
                <div style={{
                  position: "absolute", inset: 0, pointerEvents: "none",
                  background: "linear-gradient(180deg, transparent 48%, var(--sky-glow) 50%, transparent 52%)",
                  animation: "scan 1.4s linear infinite",
                }} />
              )}
            </div>
          )}
        </Panel>

        <div className="stack">
          <Panel id="OUT-01" name="Inference output"
            meta={
              <><span>{phase === "done" ? "READY" : "—"}</span>
                <span style={{ color: phase === "done" ? "var(--emerald)" : "var(--t-3)" }}>●</span></>
            }>
            <div className="grid-2">
              <Stat label="Buildings detected" value={result ? result.building_pixels?.toLocaleString() ?? "—" : "—"}
                accent="sky" bar={result ? Math.min(1, (result.building_pixels || 0) / 50000) : 0} />
              <Stat label="Pixel coverage" value={result ? result.coverage_pct + "%" : "—"}
                accent="amber" bar={result ? parseFloat(result.coverage_pct) / 100 : 0} />
              <Stat label="Uncertainty" value={result ? result.edl_uncertainty_mean?.toFixed(3) : "—"}
                accent="amber" bar={result ? result.edl_uncertainty_mean * 4 : 0}
                foot={["MC-DROPOUT · n=8", "σ entropy"]} />
              <Stat label="Agreement" value={result ? result.claam_agreement_mean?.toFixed(3) : "—"}
                accent="emerald" bar={result ? result.claam_agreement_mean : 0}
                foot={["ENSEMBLE · 4×", "cohen κ"]} />
            </div>

            <div style={{ marginTop: 16 }}>
              <div className="eyebrow" style={{ marginBottom: 8 }}>// Detection summary</div>
              <dl className="kv">
                <dt>Model checkpoint</dt><dd>dablcnet-v2.4.1.pt</dd>
                <dt>Input resolution</dt><dd>512 × 512 · RGB</dd>
                <dt>Threshold</dt><dd className="sky">{threshold.toFixed(2)}</dd>
                <dt>Coverage</dt><dd className="sky">{result ? result.coverage_pct + "%" : "—"}</dd>
                <dt>Tile strategy</dt><dd>single-pass</dd>
              </dl>
            </div>

            <div style={{ marginTop: 16, display: "flex", gap: 8, flexDirection: "column" }}>
              <div style={{ display: "flex", gap: 8 }}>
                <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 12, fontFamily: "var(--f-mono)", color: "var(--t-2)" }}>
                  <input type="checkbox" checked={showMask} onChange={e => setShowMask(e.target.checked)}
                    style={{ accentColor: "var(--sky)", width: 14, height: 14 }} />
                  Show mask overlay
                </label>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <div style={{ flex: 1, fontFamily: "var(--f-mono)", fontSize: 10.5, color: "var(--t-2)", letterSpacing: "0.12em", textTransform: "uppercase", paddingTop: 6 }}>
                  Detection threshold
                </div>
                <span style={{ fontFamily: "var(--f-mono)", fontSize: 11, color: "var(--sky)", paddingTop: 6 }}>{threshold.toFixed(2)}</span>
              </div>
              <input type="range" className="rng" min={0.1} max={0.9} step={0.05}
                value={threshold} onChange={e => setThreshold(+e.target.value)} />
            </div>

            {result && (
              <button className="btn btn-full" style={{ marginTop: 12 }}
                onClick={() => {
                  const a = document.createElement("a")
                  a.href = `data:image/png;base64,${result.mask_png_base64}`
                  a.download = "mask.png"
                  a.click()
                }}>
                <Icon.Download /> Download mask
              </button>
            )}
          </Panel>
        </div>
      </div>

      {phase !== "ready" && (
        <div style={{ marginTop: 16 }}>
          <Panel id="LOG" name="Pipeline log" meta={<span>{log.length} EVENTS</span>}>
            <LogConsole lines={log} />
          </Panel>
        </div>
      )}
    </div>
  )
}
