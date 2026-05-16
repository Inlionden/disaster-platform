import React, { useState, useRef } from "react"
import { API_URL, toB64Img, PageHeader, Card, SectionTitle, Stat, StatsGrid, UploadBox, Btn, SliderField, ErrorMsg, ResultImage } from "../lib/ui"

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
      if (!res.ok) throw new Error(`Server error ${res.status}`)
      setResult(await res.json())
    } catch (e: any) { setError(e.message) }
    finally { setLoading(false) }
  }

  return (
    <div>
      <PageHeader title="Building Segmentation" desc="Upload an aerial image to detect and segment buildings using DABLCNet — ViT@512 with edge-guided decoder." />

      <Card>
        <SectionTitle>Input Image</SectionTitle>
        <UploadBox preview={preview} onClick={() => fileRef.current?.click()} />
        <input ref={fileRef} type="file" accept=".png,.jpg,.jpeg,.tif,.tiff" style={{ display: "none" }} onChange={onFile} />
        <SliderField label="Detection Threshold" value={threshold} set={setThreshold} min={0.1} max={0.9} step={0.05} />
        <Btn onClick={run} loading={loading} disabled={!image}>Run Segmentation</Btn>
        {error && <ErrorMsg msg={error} />}
      </Card>

      {result && (
        <>
          <Card>
            <SectionTitle>Detection Stats</SectionTitle>
            <StatsGrid>
              <Stat label="Building Pixels" value={result.building_pixels?.toLocaleString()} />
              <Stat label="Coverage" value={`${result.coverage_pct}%`} />
              <Stat label="EDL Uncertainty" value={result.edl_uncertainty_mean?.toFixed(4)} accent="#fb923c" />
              <Stat label="CLAAM Agreement" value={result.claam_agreement_mean?.toFixed(4)} accent="#34d399" />
            </StatsGrid>
          </Card>
          <Card>
            <SectionTitle>Segmentation Output</SectionTitle>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <ResultImage src={preview!} label="Original" />
              <ResultImage src={toB64Img(result.mask_png_base64)} label="Building Mask" />
            </div>
          </Card>
        </>
      )}
    </div>
  )
}
