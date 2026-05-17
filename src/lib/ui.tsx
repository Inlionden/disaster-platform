import React, { useState, useEffect, useRef, useCallback } from "react"

export const API_URL = "https://inlionde4n-disaster-platform-api.hf.space"

export function toB64Img(b64: string) {
  return `data:image/png;base64,${b64}`
}

// ─── Icons ────────────────────────────────────────────────────
type SVGProps = React.SVGProps<SVGSVGElement>
export const Icon = {
  Crosshair: (p: SVGProps) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...p}>
      <circle cx="12" cy="12" r="8" /><path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" />
    </svg>
  ),
  Upload: (p: SVGProps) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...p}>
      <path d="M12 16V4m0 0l-5 5m5-5l5 5" /><path d="M4 20h16" />
    </svg>
  ),
  Layers: (p: SVGProps) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...p}>
      <path d="M12 3l9 4.5-9 4.5L3 7.5 12 3z" />
      <path d="M3 12l9 4.5 9-4.5M3 16.5L12 21l9-4.5" />
    </svg>
  ),
  Sparkles: (p: SVGProps) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...p}>
      <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z" />
      <path d="M19 14l.7 2.1L22 17l-2.3.9L19 20l-.7-2.1L16 17l2.3-.9L19 14z" />
    </svg>
  ),
  Grid: (p: SVGProps) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...p}>
      <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
    </svg>
  ),
  Diff: (p: SVGProps) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...p}>
      <path d="M9 3v18M15 3v18" /><path d="M3 9h6M15 9h6M3 15h6M15 15h6" />
    </svg>
  ),
  Target: (p: SVGProps) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...p}>
      <circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" />
    </svg>
  ),
  Info: (p: SVGProps) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...p}>
      <circle cx="12" cy="12" r="9" /><path d="M12 8v.01M11 12h1v5h1" />
    </svg>
  ),
  Download: (p: SVGProps) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...p}>
      <path d="M12 4v12m0 0l-4-4m4 4l4-4" /><path d="M4 20h16" />
    </svg>
  ),
  Refresh: (p: SVGProps) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...p}>
      <path d="M3 12a9 9 0 0115.5-6.5L21 8M21 3v5h-5" />
      <path d="M21 12a9 9 0 01-15.5 6.5L3 16M3 21v-5h5" />
    </svg>
  ),
  Arrow: (p: SVGProps) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...p}>
      <path d="M5 12h14m0 0l-6-6m6 6l-6 6" />
    </svg>
  ),
  Bolt: (p: SVGProps) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" {...p}>
      <path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z" />
    </svg>
  ),
}

// ─── Status Rail ─────────────────────────────────────────────
export function StatusRail() {
  const [time, setTime] = useState(new Date())
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(id)
  }, [])
  const utc = time.toISOString().replace("T", " ").slice(0, 19) + " UTC"
  return (
    <div className="rail">
      <span><span className="dot" /> API · Online</span>
      <span className="sep">/</span>
      <span>Model · DABLCNet <span style={{ color: "var(--t-2)" }}>v2.4.1</span></span>
      <span className="sep">/</span>
      <span>Build · 26.05.12</span>
      <span className="spacer" />
      <span>CPU · HF Spaces</span>
      <span className="sep">/</span>
      <span>{utc}</span>
      <span className="sep">/</span>
      <span><span className="pulse" style={{ color: "var(--sky)" }}>● </span>TELEMETRY</span>
    </div>
  )
}

// ─── Panel ───────────────────────────────────────────────────
export function Panel({ id, name, meta, headerRight, noPad, style, className = "", children }: {
  id?: string; name: string; meta?: React.ReactNode; headerRight?: React.ReactNode
  noPad?: boolean; style?: React.CSSProperties; className?: string; children?: React.ReactNode
}) {
  return (
    <div className={"panel " + className} style={style}>
      <div className="corners"><i /></div>
      <div className="panel-head">
        <div className="panel-head-title">
          {id && <span className="panel-head-id">// {id}</span>}
          <span className="panel-head-name">{name}</span>
        </div>
        {(meta || headerRight) && (
          <div className="panel-head-meta">{meta}{headerRight}</div>
        )}
      </div>
      <div className="panel-body" style={noPad ? { padding: 0 } : undefined}>{children}</div>
    </div>
  )
}

// ─── Page Head ───────────────────────────────────────────────
export function PageHead({ num, title, sub, right }: {
  num?: string; title: string; sub?: string; right?: React.ReactNode
}) {
  return (
    <div className="page-head">
      <div className="page-head-left">
        <h1>{num && <span className="num">{num} //</span>}{title}</h1>
        {sub && <p>{sub}</p>}
      </div>
      {right && <div className="right">{right}</div>}
    </div>
  )
}

// ─── Stat ────────────────────────────────────────────────────
export function Stat({ label, value, unit, accent = "sky", bar, foot }: {
  label: string; value: string | number; unit?: string
  accent?: "sky" | "amber" | "emerald" | "rose"
  bar?: number; foot?: [React.ReactNode, React.ReactNode]
}) {
  return (
    <div className="stat">
      <div className="stat-label">{label}</div>
      <div className={"stat-val " + accent}>
        {value}
        {unit && <span className="stat-unit">{unit}</span>}
      </div>
      {typeof bar === "number" && (
        <div className="stat-bar">
          <div className={"stat-bar-fill " + accent}
            style={{ transform: `scaleX(${Math.max(0, Math.min(1, bar))})` }} />
        </div>
      )}
      {foot && <div className="stat-foot"><span>{foot[0]}</span><span>{foot[1]}</span></div>}
    </div>
  )
}

// ─── Upload Zone ─────────────────────────────────────────────
export function UploadZone({ onUpload, label, sub, formats = ["PNG", "JPG", "TIF"] }: {
  onUpload: (f: File) => void; label?: string; sub?: string; formats?: string[]
}) {
  const ref = useRef<HTMLInputElement>(null)
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const f = e.dataTransfer.files[0]; if (f) onUpload(f)
  }
  return (
    <div className="upload" onClick={() => ref.current?.click()}
      onDrop={onDrop} onDragOver={e => e.preventDefault()}>
      <div className="upload-icon"><Icon.Upload style={{ width: 24, height: 24 }} /></div>
      <div className="upload-title">{label ?? "Drop aerial image"}</div>
      <div className="upload-sub">{sub ?? "or click to load · max 1 GB"}</div>
      <div className="upload-formats">
        {formats.map(f => <span key={f} className="chip">{f}</span>)}
      </div>
      <input ref={ref} type="file" accept=".png,.jpg,.jpeg,.tif,.tiff" style={{ display: "none" }}
        onChange={e => { const f = e.target.files?.[0]; if (f) onUpload(f) }} />
    </div>
  )
}

// ─── Toggle Row ──────────────────────────────────────────────
export function ToggleRow({ name, value, onChange, hint }: {
  name: string; value: boolean; onChange: (v: boolean) => void; hint?: string
}) {
  return (
    <div className={"toggle-row" + (value ? " on" : "")} onClick={() => onChange(!value)}>
      <div>
        <div className="name">{name}</div>
        {hint && <div className="label-tiny" style={{ marginTop: 4 }}>{hint}</div>}
      </div>
      <div className="toggle-sw" />
    </div>
  )
}

// ─── Range Row ───────────────────────────────────────────────
export function RangeRow({ name, value, min, max, step, onChange, unit }: {
  name: string; value: number; min: number; max: number
  step?: number; onChange: (v: number) => void; unit?: string
}) {
  return (
    <div className="range-row">
      <div className="range-row-head">
        <span className="n">{name}</span>
        <span className="v">{value}{unit}</span>
      </div>
      <input type="range" className="rng" min={min} max={max} step={step ?? 1}
        value={value} onChange={e => onChange(Number(e.target.value))} />
    </div>
  )
}

// ─── Log Console ─────────────────────────────────────────────
export type LogLine = { t: string; lvl: "ok" | "info" | "warn"; msg: string }

export function LogConsole({ lines }: { lines: LogLine[] }) {
  return (
    <div className="log">
      {lines.map((l, i) => (
        <div key={i} className="log-row">
          <span className="t">{l.t}</span>
          <span className={"lvl " + l.lvl}>{l.lvl.toUpperCase()}</span>
          <span className="msg">{l.msg}</span>
        </div>
      ))}
    </div>
  )
}

// ─── Severity ────────────────────────────────────────────────
export function Severity({ value }: { value: number }) {
  const cls = value < 0.33 ? "sev-low" : value < 0.66 ? "sev-med" : "sev-high"
  const lbl = value < 0.33 ? "Low" : value < 0.66 ? "Moderate" : "Severe"
  return <span className={"sev " + cls}><span className="ledge" />{lbl}</span>
}

// ─── Process Steps ───────────────────────────────────────────
export function ProcessSteps({ steps, active }: { steps: string[]; active: number }) {
  return (
    <div className="steps">
      {steps.map((s, i) => (
        <React.Fragment key={s}>
          <span className={"step " + (i < active ? "done" : i === active ? "active" : "")}>
            <span className="d" />{s}
          </span>
          {i < steps.length - 1 && <span className="line" />}
        </React.Fragment>
      ))}
    </div>
  )
}

// ─── Tabs ────────────────────────────────────────────────────
export function Tabs({ items, value, onChange }: {
  items: { value: string; label: string }[]; value: string; onChange: (v: string) => void
}) {
  return (
    <div className="tabs">
      {items.map(it => (
        <div key={it.value} className={"tab" + (value === it.value ? " active" : "")}
          onClick={() => onChange(it.value)}>{it.label}</div>
      ))}
    </div>
  )
}

// ─── Chip ────────────────────────────────────────────────────
export function Chip({ children, variant }: {
  children: React.ReactNode; variant?: "sky" | "amber" | "emerald" | "rose"
}) {
  return <span className={"chip" + (variant ? " " + variant : "")}>{children}</span>
}

// ─── Error Message ───────────────────────────────────────────
export function ErrorMsg({ msg }: { msg: string }) {
  return (
    <div style={{
      background: "rgba(244,63,94,0.08)", border: "1px solid var(--rose-dim)",
      borderRadius: "var(--r-1)", padding: "10px 14px", marginTop: 12,
      color: "var(--rose)", fontSize: 13, fontFamily: "var(--f-mono)"
    }}>
      {msg}
    </div>
  )
}

// ─── Image Viewer ────────────────────────────────────────────
type HudTags = {
  topLeft?: React.ReactNode; topRight?: React.ReactNode
  bottomLeft?: React.ReactNode; bottomRight?: React.ReactNode
}

export function ImageViewer({ src, overlayB64, canvasRender, hud, onClick, children }: {
  src: string | null
  overlayB64?: string | null
  canvasRender?: (ctx: CanvasRenderingContext2D, w: number, h: number) => void
  hud?: HudTags
  onClick?: (coords: { px: number; py: number; x: number; y: number }) => void
  children?: React.ReactNode
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current || !canvasRender) return
    const c = canvasRef.current
    const ctx = c.getContext("2d")!
    ctx.clearRect(0, 0, c.width, c.height)
    canvasRender(ctx, c.width, c.height)
  }, [canvasRender])

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!onClick) return
    const r = e.currentTarget.getBoundingClientRect()
    const px = (e.clientX - r.left) / r.width
    const py = (e.clientY - r.top) / r.height
    onClick({ px, py, x: px * 800, y: py * 800 })
  }

  return (
    <div className="viewer" onClick={handleClick} style={{ cursor: onClick ? "crosshair" : "default" }}>
      {src && <img src={src} alt="capture" />}
      {overlayB64 && <img src={toB64Img(overlayB64)} alt="overlay" style={{ opacity: 0.85 }} />}
      {canvasRender && <canvas ref={canvasRef} width={800} height={800} />}
      <div className="viewer-c" />
      <div className="viewer-hud">
        <div className="viewer-hud-row">
          {hud?.topLeft ?? (
            <span className="viewer-hud-tag">
              <Icon.Crosshair style={{ width: 11, height: 11 }} />
              LAT 34.0535°N · LON -118.2453°W
            </span>
          )}
          {hud?.topRight ?? <span className="viewer-hud-tag">RGB · 0.5m/px</span>}
        </div>
        <div className="viewer-hud-row">
          {hud?.bottomLeft ?? <span className="viewer-hud-tag" style={{ color: "var(--t-2)" }}>FRAME #00432</span>}
          {hud?.bottomRight}
        </div>
      </div>
      {children}
      <div className="viewer-scale"><span>0</span><span className="bar" /><span>50 m</span></div>
    </div>
  )
}
