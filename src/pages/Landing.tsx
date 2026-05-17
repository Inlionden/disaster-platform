import React from "react"
import { useNavigate } from "react-router-dom"
import { Panel, Stat, Icon, Chip } from "../lib/ui"

const MODULES = [
  { to: "/analyze",   num: "01", title: "Analyze",          icon: <Icon.Layers />,   meta: "DABLCNet · seg",  desc: "Detect and segment building footprints from a single aerial capture. Returns pixel-level masks with calibrated uncertainty." },
  { to: "/simulate",  num: "02", title: "Simulate",         icon: <Icon.Sparkles />, meta: "fwd-model",       desc: "Apply parametric blast, fire, and atmospheric perturbations to a scene for synthetic ground-truth generation." },
  { to: "/density",   num: "03", title: "Density",          icon: <Icon.Grid />,     meta: "kde · grid",      desc: "Kernel density estimation over detected structures, projected onto an N × N spatial grid for population proxy." },
  { to: "/diff",      num: "04", title: "Before / After",   icon: <Icon.Diff />,     meta: "Δ pairwise",      desc: "Pairwise pre/post disaster diffing. Outputs a damage score and per-structure destruction mask." },
  { to: "/optimizer", num: "05", title: "Strike Optimizer", icon: <Icon.Target />,   meta: "top-k · sim",     desc: "Identify top-k high-density target zones under a configurable blast radius. Simulation only." },
]

export default function Landing() {
  const nav = useNavigate()
  return (
    <div className="fade-in">
      {/* HERO */}
      <div className="hero">
        <div style={{
          position: "absolute", inset: 0, opacity: 0.35, pointerEvents: "none",
          background: "linear-gradient(180deg, transparent 0%, var(--bg-1) 100%), radial-gradient(circle at 85% 25%, rgba(56,189,248,0.18), transparent 40%)",
        }} />
        <div style={{ position: "relative", display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 48, alignItems: "center" }}>
          <div>
            <div className="eyebrow" style={{ marginBottom: 18, color: "var(--sky)" }}>
              DABLCNet · v2.4.1 · Research preview
            </div>
            <h1>
              Aerial disaster<br />
              analysis at <em>building</em> resolution.
            </h1>
            <p className="hero-sub">
              An open research platform applying deep attention-based localization (DABLCNet) to satellite
              and drone imagery. Detect structures, estimate population density, quantify damage between
              pre- and post-event captures, and run forward simulations.
            </p>
            <div className="hero-cta">
              <button className="btn btn-primary" onClick={() => nav("/analyze")}>
                <Icon.Bolt /> Initiate analysis
              </button>
              <button className="btn" onClick={() => nav("/simulate")}>
                <Icon.Sparkles /> View simulation
              </button>
            </div>
            <div className="hero-readout">
              <Stat label="Mean IoU" value="0.847" accent="sky" bar={0.847} foot={["VAL · xBD", "+0.012"]} />
              <Stat label="Inference" value="48" unit="ms" accent="sky" bar={0.62} foot={["1024×1024", "CPU"]} />
              <Stat label="Captures" value="12,401" accent="emerald" foot={["since launch", "↗ 18.2%"]} />
              <Stat label="Coverage" value="34" unit=" cities" accent="amber" foot={["global", "5 active"]} />
            </div>
          </div>
          <div>
            <div className="viewer" style={{ aspectRatio: "1/1", background: "var(--bg-2)" }}>
              <div className="viewer-c" />
              <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center" }}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ width: 64, height: 64, border: "1px solid var(--line-3)", borderRadius: "50%", display: "grid", placeItems: "center", margin: "0 auto 16px", color: "var(--sky)" }}>
                    <Icon.Layers style={{ width: 28, height: 28 }} />
                  </div>
                  <div className="eyebrow" style={{ color: "var(--sky)" }}>Upload an image</div>
                  <div className="label-tiny" style={{ marginTop: 6 }}>to begin inference</div>
                </div>
              </div>
              <div className="viewer-hud">
                <div className="viewer-hud-row">
                  <span className="viewer-hud-tag"><Icon.Crosshair style={{ width: 11, height: 11 }} />LIVE INFERENCE</span>
                  <span className="viewer-hud-tag">SEED · 0042</span>
                </div>
                <div className="viewer-hud-row">
                  <span className="viewer-hud-tag" style={{ color: "var(--t-2)" }}>AWAITING CAPTURE · 0.842 CONF.</span>
                  <span className="viewer-hud-tag">RGB · 0.5m/px</span>
                </div>
              </div>
              <div className="viewer-scale"><span>0</span><span className="bar" /><span>50 m</span></div>
            </div>
            <div style={{ marginTop: 10, display: "flex", gap: 8, justifyContent: "center" }}>
              <Chip variant="sky">SEGMENTATION OVERLAY</Chip>
              <Chip>DEMO · LA · 34.05N 118.24W</Chip>
            </div>
          </div>
        </div>
      </div>

      {/* MODULE GRID */}
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 14 }}>
        <div>
          <div className="eyebrow">// 01 · Pipeline modules</div>
          <h2 style={{ margin: "6px 0 0", fontSize: 22, fontWeight: 500, color: "var(--t-1)" }}>
            Five inference endpoints, one model.
          </h2>
        </div>
        <span className="label-tiny">5 ACTIVE · 0 DEPRECATED</span>
      </div>

      <div className="modules">
        {MODULES.map(m => (
          <div key={m.to} className="module-card" onClick={() => nav(m.to)}>
            <div className="corners"><i /></div>
            <div className="module-card-num">[ {m.num} ]</div>
            <div className="icon-frame">{m.icon}</div>
            <h3>{m.title}</h3>
            <p>{m.desc}</p>
            <div className="module-card-foot">
              <span>{m.meta}</span>
              <span className="arrow">OPEN <Icon.Arrow style={{ width: 11, height: 11, verticalAlign: -2 }} /></span>
            </div>
          </div>
        ))}
        <div className="module-card" style={{ background: "var(--bg-0)", borderStyle: "dashed", cursor: "default" }}>
          <div className="corners"><i /></div>
          <div className="module-card-num" style={{ color: "var(--t-3)" }}>[ ref ]</div>
          <div className="icon-frame"><Icon.Info /></div>
          <h3 style={{ color: "var(--t-2)" }}>Citation</h3>
          <p style={{ fontSize: 11.5, lineHeight: 1.55 }}>
            Building detection trained on xBD, SpaceNet 2-7, and OpenBuildings. KDE bandwidth fitted by
            Silverman's rule. Damage scoring via post-pre embedding distance.
          </p>
          <div className="module-card-foot">
            <span>arXiv · in prep</span>
            <span style={{ color: "var(--t-3)" }}>2026</span>
          </div>
        </div>
      </div>

      {/* SYSTEM PANEL */}
      <div style={{ marginTop: 24 }}>
        <Panel id="SYS" name="System status" meta={<span>UPDATED 12s ago</span>}>
          <div className="grid-4">
            <Stat label="API endpoint" value=".hf.space" accent="emerald"
              foot={["200 OK", "p99 · 312ms"]} />
            <Stat label="Web client" value="Vercel" accent="sky"
              foot={["edge · iad1", "cache 96%"]} />
            <Stat label="Model checkpoint" value="2.4.1" unit=".pt" accent="sky"
              foot={["387 MB · float32", "sha 8a7e"]} />
            <Stat label="Queue depth" value="0" accent="emerald" bar={0.04}
              foot={["idle", "concurrency 4"]} />
          </div>
        </Panel>
      </div>
    </div>
  )
}
