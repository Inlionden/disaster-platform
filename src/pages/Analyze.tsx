import React, { useState, useRef } from "react"
import { s, API_URL, toB64Img, Stat, UploadBox, Btn } from "../lib/ui"

export default function Analyze() {
  const [image, setImage] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [threshold, setThreshold] = useState(0.5)
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
      form.append("threshold", String(threshold))
      const res = await fetch(`${API_URL}/analyze`, { method: "POST", body: form })
      if (!res.ok) throw new Error(`Error ${res.status}`)
      setResult(await res.json())
    } catch (e: any) { setError(e.message) }
    finally { setLoading(false) }
  }

  return (
    <div>
      <h1 style={s.h1}>Building Segmentation</h1>
      <p style={s.sub}>Upload an aerial image to detect and segment buildings.</p>

      <div style={s.card}>
        <UploadBox preview={preview} onClick={() => fileRef.current?.click()} />
        <input ref={fileRef} type="file" accept=".png,.jpg,.jpeg,.tif,.tiff" style={{ display: "none" }} onChange={onFile} />
        <label style={s.label}>Threshold: {threshold}</label>
        <input type="range" min={0.1} max={0.9} step={0.05} value={threshold} onChange={e => setThreshold(+e.target.value)} style={{ width: "100%", marginBottom: 12 }} />
        <Btn onClick={run} loading={loading} disabled={!image}>Run Segmentation</Btn>
        {error && <p style={s.error}>{error}</p>}
      </div>

      {result && (
        <div style={s.card}>
          <h2 style={s.h2}>Results</h2>
          <div style={s.statsRow}>
            <Stat label="Building Pixels" value={result.building_pixels?.toLocaleString()} />
            <Stat label="Coverage" value={`${result.coverage_pct}%`} />
            <Stat label="EDL Uncertainty" value={result.edl_uncertainty_mean?.toFixed(4)} />
            <Stat label="CLAAM Agreement" value={result.claam_agreement_mean?.toFixed(4)} />
          </div>
          <h3 style={s.h3}>Segmentation Mask</h3>
          <img src={toB64Img(result.mask_png_base64)} alt="mask" style={s.resultImg} />
        </div>
      )}
    </div>
  )
}
