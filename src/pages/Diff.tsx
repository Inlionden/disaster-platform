import React, { useState, useRef } from "react"
import { s, API_URL, toB64Img, UploadBox, Btn, Stat } from "../lib/ui"

export default function Diff() {
  const [before, setBefore] = useState<File | null>(null)
  const [after, setAfter] = useState<File | null>(null)
  const [previewB, setPreviewB] = useState<string | null>(null)
  const [previewA, setPreviewA] = useState<string | null>(null)
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const refB = useRef<HTMLInputElement>(null)
  const refA = useRef<HTMLInputElement>(null)

  function onBefore(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]; if (!f) return
    setBefore(f); setPreviewB(URL.createObjectURL(f)); setResult(null)
  }
  function onAfter(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]; if (!f) return
    setAfter(f); setPreviewA(URL.createObjectURL(f)); setResult(null)
  }

  async function run() {
    if (!before || !after) return
    setLoading(true); setError(null)
    try {
      const form = new FormData()
      form.append("before", before)
      form.append("after", after)
      const res = await fetch(`${API_URL}/diff`, { method: "POST", body: form })
      if (!res.ok) throw new Error(`Error ${res.status}`)
      setResult(await res.json())
    } catch (e: any) { setError(e.message) }
    finally { setLoading(false) }
  }

  const dmgColor = result ? (result.damage_score > 0.5 ? "#f87171" : result.damage_score > 0.2 ? "#fbbf24" : "#34d399") : "#38bdf8"

  return (
    <div>
      <h1 style={s.h1}>Before / After Analysis</h1>
      <p style={s.sub}>Upload two images of the same area to detect damage and structural changes.</p>

      <div style={s.card}>
        <div style={s.row2}>
          <div>
            <label style={s.label}>Before Image</label>
            <UploadBox preview={previewB} onClick={() => refB.current?.click()} label="Upload BEFORE image" />
            <input ref={refB} type="file" accept=".png,.jpg,.jpeg,.tif,.tiff" style={{ display: "none" }} onChange={onBefore} />
          </div>
          <div>
            <label style={s.label}>After Image</label>
            <UploadBox preview={previewA} onClick={() => refA.current?.click()} label="Upload AFTER image" />
            <input ref={refA} type="file" accept=".png,.jpg,.jpeg,.tif,.tiff" style={{ display: "none" }} onChange={onAfter} />
          </div>
        </div>
        <Btn onClick={run} loading={loading} disabled={!before || !after}>Analyse Damage</Btn>
        {error && <p style={s.error}>{error}</p>}
      </div>

      {result && (
        <div style={s.card}>
          <h2 style={s.h2}>Damage Report</h2>
          <div style={{ ...s.statCard, marginBottom: 20, border: `2px solid ${dmgColor}` }}>
            <div style={{ fontSize: 36, fontWeight: 800, color: dmgColor }}>{(result.damage_score * 100).toFixed(1)}%</div>
            <div style={{ color: "#94a3b8", fontSize: 13 }}>Overall Damage Score</div>
          </div>
          <div style={s.statsRow}>
            <Stat label="Destroyed Pixels" value={result.destroyed_pixels?.toLocaleString()} />
            <Stat label="New Pixels" value={result.new_pixels?.toLocaleString()} />
            <Stat label="Severity" value={result.damage_score > 0.5 ? "HIGH" : result.damage_score > 0.2 ? "MEDIUM" : "LOW"} />
            <Stat label="Status" value={result.damage_score > 0.5 ? "Critical" : result.damage_score > 0.2 ? "Moderate" : "Minimal"} />
          </div>
          <h3 style={s.h3}>Destroyed Buildings Mask</h3>
          <img src={toB64Img(result.destroyed_mask_base64)} alt="destroyed" style={s.resultImg} />
        </div>
      )}
    </div>
  )
}
