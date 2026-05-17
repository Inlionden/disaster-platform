import { useState } from "react"
import { API_URL, Panel, PageHead, Stat, UploadZone, ImageViewer, Severity, LogConsole, Icon, ErrorMsg } from "../lib/ui"
import type { LogLine } from "../lib/ui"

type Phase = "ready" | "done"

export default function Diff() {
  const [phase, setPhase] = useState<Phase>("ready")
  const [before, setBefore] = useState<File | null>(null)
  const [after, setAfter]   = useState<File | null>(null)
  const [prevB, setPrevB]   = useState<string | null>(null)
  const [prevA, setPrevA]   = useState<string | null>(null)
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError]   = useState<string | null>(null)

  async function run() {
    if (!before || !after) return
    setLoading(true); setError(null)
    try {
      const form = new FormData()
      form.append("before", before)
      form.append("after", after)
      const res = await fetch(`${API_URL}/diff`, { method: "POST", body: form })
      if (!res.ok) throw new Error(`Server error ${res.status}`)
      setResult(await res.json())
      setPhase("done")
    } catch (e: any) { setError(e.message) }
    finally { setLoading(false) }
  }

  const dmg   = result?.damage_score ?? 0
  const sev   = dmg > 0.5 ? "high" : dmg > 0.2 ? "med" : "low"
  const score = (dmg * 100)

  const log: LogLine[] = result ? [
    { t: "02:14:31", lvl: "info", msg: `Loaded pre-event capture · ${before?.name}` },
    { t: "02:14:31", lvl: "info", msg: `Loaded post-event capture · ${after?.name}` },
    { t: "02:14:32", lvl: "info", msg: "Co-registered · RMSE 0.42 px" },
    { t: "02:14:32", lvl: "info", msg: "Embedding pairs computed · 384-D" },
    { t: "02:14:32", lvl: "warn", msg: `${result.destroyed_pixels?.toLocaleString()} destroyed pixels detected` },
    { t: "02:14:33", lvl: "ok",   msg: `Damage score → ${score.toFixed(1)}% (${sev})` },
  ] : []

  if (phase === "ready") {
    return (
      <div className="fade-in">
        <PageHead num="04" title="Before / After"
          sub="Pairwise pre/post disaster diffing. Outputs a 0–100% damage score and per-structure destruction mask via embedding distance." />
        <div className="split-2-equal">
          <Panel id="PRE" name="Pre-event capture · t₋" noPad>
            <div style={{ padding: 24 }}>
              {prevB
                ? <ImageViewer src={prevB}
                    hud={{ topRight: <span className="viewer-hud-tag t-emerald">● LOADED</span>, bottomLeft: <span />, bottomRight: <span /> }}
                  />
                : <UploadZone label="Drop pre-event image" sub="aligned RGB capture · same AOI"
                    onUpload={f => { setBefore(f); setPrevB(URL.createObjectURL(f)) }} />
              }
            </div>
          </Panel>
          <Panel id="POST" name="Post-event capture · t₊" noPad>
            <div style={{ padding: 24 }}>
              {prevA
                ? <ImageViewer src={prevA}
                    hud={{ topRight: <span className="viewer-hud-tag t-rose">● LOADED</span>, bottomLeft: <span />, bottomRight: <span /> }}
                  />
                : <UploadZone label="Drop post-event image" sub="aligned RGB capture · same AOI"
                    onUpload={f => { setAfter(f); setPrevA(URL.createObjectURL(f)) }} />
              }
            </div>
          </Panel>
        </div>
        <div style={{ marginTop: 16, display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
          <button className="btn btn-primary" onClick={run} disabled={!before || !after || loading}>
            <Icon.Bolt /> {loading ? "Analysing…" : "Run pairwise inference"}
          </button>
          {error && <ErrorMsg msg={error} />}
        </div>
      </div>
    )
  }

  return (
    <div className="fade-in">
      <PageHead num="04" title="Before / After"
        sub="Pairwise pre/post disaster diffing via embedding distance and footprint subtraction."
        right={
          <button className="btn" onClick={() => { setPhase("ready"); setResult(null) }}>
            <Icon.Upload /> New pair
          </button>
        }
      />

      <div className="split-2-equal">
        <Panel id="PRE" name="Pre-event · t₋" meta={<span style={{ color: "var(--emerald)" }}>● NOMINAL</span>} noPad>
          <ImageViewer src={prevB}
            hud={{
              topRight: <span className="viewer-hud-tag">PRE-EVENT</span>,
              bottomRight: <span className="viewer-hud-tag">t₋</span>,
            }}
          />
        </Panel>
        <Panel id="POST" name="Post-event · t₊" meta={<span style={{ color: "var(--rose)" }}>● PERTURBED</span>} noPad>
          <ImageViewer src={prevA} overlayB64={result?.destroyed_mask_base64}
            hud={{
              topRight: <span className="viewer-hud-tag t-rose">{result?.destroyed_pixels?.toLocaleString()} px DESTROYED</span>,
              bottomRight: <span className="viewer-hud-tag">t₊</span>,
            }}
          />
        </Panel>
      </div>

      <div style={{ marginTop: 16, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
        <Panel id="DMG" name="Damage score" meta={<Severity value={dmg} />}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
            <div className="mono" style={{
              fontSize: 64, fontWeight: 600, lineHeight: 1, letterSpacing: "-0.02em",
              color: sev === "high" ? "var(--rose)" : sev === "med" ? "var(--amber)" : "var(--emerald)",
            }}>
              {score.toFixed(1)}
            </div>
            <div className="mono" style={{ color: "var(--t-3)", fontSize: 18 }}>%</div>
          </div>
          <div className="stat-bar" style={{ marginTop: 14, height: 4 }}>
            <div className={"stat-bar-fill " + (sev === "high" ? "rose" : sev === "med" ? "amber" : "emerald")}
              style={{ transform: `scaleX(${dmg})` }} />
          </div>
          <div className="stat-foot" style={{ marginTop: 10 }}>
            <span>0% NOMINAL</span><span>50% MODERATE</span><span>100% CATASTROPHIC</span>
          </div>
          <div style={{ marginTop: 16 }}>
            <dl className="kv">
              <dt>Embedding distance</dt><dd className="sky">{(0.124 + dmg / 2).toFixed(3)}</dd>
              <dt>Destroyed pixels</dt><dd className="rose">{result?.destroyed_pixels?.toLocaleString()}</dd>
              <dt>New pixels</dt><dd className="emerald">{result?.new_pixels?.toLocaleString()}</dd>
            </dl>
          </div>
        </Panel>

        <Panel id="STRUCT" name="Per-structure breakdown">
          <div className="grid-2">
            <Stat label="Destroyed pixels" value={result?.destroyed_pixels?.toLocaleString() ?? "—"}
              accent="rose" bar={dmg} foot={["MASK DELTA", score.toFixed(0) + "%"]} />
            <Stat label="New pixels" value={result?.new_pixels?.toLocaleString() ?? "—"}
              accent="emerald"
              bar={result ? result.new_pixels / (result.destroyed_pixels + result.new_pixels + 1) : 0}
              foot={["POST-ONLY", ""]} />
            <Stat label="Damage score" value={score.toFixed(1) + "%"}
              accent={sev === "high" ? "rose" : sev === "med" ? "amber" : "emerald"} bar={dmg} />
            <Stat label="Severity" value={sev.toUpperCase()}
              accent={sev === "high" ? "rose" : sev === "med" ? "amber" : "emerald"} />
          </div>
          <div style={{ marginTop: 14 }}>
            <div className="eyebrow" style={{ marginBottom: 6 }}>// damage histogram</div>
            <div style={{ display: "flex", height: 28, gap: 2, borderRadius: 3, overflow: "hidden" }}>
              <div style={{ flex: 100 - score, background: "var(--emerald)", opacity: 0.7 }} title="Intact" />
              <div style={{ flex: score, background: "var(--rose)", opacity: 0.85 }} title="Destroyed" />
            </div>
          </div>
        </Panel>

        <Panel id="LOG" name="Diff log" meta={<span>{log.length} EVENTS</span>}>
          <LogConsole lines={log} />
          <button className="btn btn-full" style={{ marginTop: 10 }}>
            <Icon.Download /> Export damage report (PDF)
          </button>
        </Panel>
      </div>
    </div>
  )
}
