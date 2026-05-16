import React, { useState, useRef } from "react"
import { s, API_URL, toB64Img, UploadBox, Btn } from "../lib/ui"

export default function Simulate() {
  const [image, setImage] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [result, setResult] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const [cx, setCx] = useState(256)
  const [cy, setCy] = useState(256)
  const [radius, setRadius] = useState(80)
  const [crater, setCrater] = useState(true)
  const [burn, setBurn] = useState(true)
  const [debris, setDebris] = useState(true)
  const [smoke, setSmoke] = useState(true)
  const [lens, setLens] = useState(true)

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]; if (!f) return
    setImage(f); setPreview(URL.createObjectURL(f)); setResult(null); setError(null)
  }

  async function run() {
    if (!image) return
    setLoading(true); setError(null)
    try {
      const params = { center_x: cx, center_y: cy, radius, crater_effect: crater, burn_effect: burn, debris_effect: debris, smoke_effect: smoke, lens_distortion: lens }
      const form = new FormData()
      form.append("file", image)
      form.append("params", JSON.stringify(params))
      const res = await fetch(`${API_URL}/simulate`, { method: "POST", body: form })
      if (!res.ok) throw new Error(`Error ${res.status}`)
      const data = await res.json()
      setResult(data.result_png_base64)
    } catch (e: any) { setError(e.message) }
    finally { setLoading(false) }
  }

  const chk = (label: string, val: boolean, set: (v: boolean) => void) => (
    <label style={{ display: "flex", alignItems: "center", gap: 8, color: "#94a3b8", fontSize: 14, marginBottom: 8, cursor: "pointer" }}>
      <input type="checkbox" checked={val} onChange={e => set(e.target.checked)} />
      {label}
    </label>
  )

  const sl = (label: string, val: number, set: (v: number) => void, min: number, max: number) => (
    <div style={{ marginBottom: 12 }}>
      <label style={s.label}>{label}: {val}</label>
      <input type="range" min={min} max={max} value={val} onChange={e => set(+e.target.value)} style={{ width: "100%" }} />
    </div>
  )

  return (
    <div>
      <h1 style={s.h1}>Damage Simulator</h1>
      <p style={s.sub}>Simulate drone strike / disaster impact effects on an aerial image.</p>

      <div style={s.card}>
        <UploadBox preview={preview} onClick={() => fileRef.current?.click()} />
        <input ref={fileRef} type="file" accept=".png,.jpg,.jpeg" style={{ display: "none" }} onChange={onFile} />
        {sl("Impact X", cx, setCx, 0, 512)}
        {sl("Impact Y", cy, setCy, 0, 512)}
        {sl("Radius", radius, setRadius, 20, 250)}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4, marginBottom: 12 }}>
          {chk("Crater", crater, setCrater)}
          {chk("Burn", burn, setBurn)}
          {chk("Debris", debris, setDebris)}
          {chk("Smoke", smoke, setSmoke)}
          {chk("Lens Distortion", lens, setLens)}
        </div>
        <Btn onClick={run} loading={loading} disabled={!image}>Simulate Impact</Btn>
        {error && <p style={s.error}>{error}</p>}
      </div>

      {result && (
        <div style={s.card}>
          <h2 style={s.h2}>Simulation Result</h2>
          <div style={s.row2}>
            <div><h3 style={s.h3}>Original</h3><img src={preview!} alt="original" style={s.resultImg} /></div>
            <div><h3 style={s.h3}>After Impact</h3><img src={toB64Img(result)} alt="result" style={s.resultImg} /></div>
          </div>
          <a href={toB64Img(result)} download="simulation.png" style={{ ...s.btn, display: "block", textAlign: "center", marginTop: 16, textDecoration: "none" }}>
            Download Result
          </a>
        </div>
      )}
    </div>
  )
}
