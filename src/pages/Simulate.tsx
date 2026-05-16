import React, { useState, useRef } from "react"
import { API_URL, toB64Img, PageHeader, Card, SectionTitle, UploadBox, Btn, SliderField, CheckField, ErrorMsg, TwoCol, ResultImage } from "../lib/ui"

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
  const [lens, setLens] = useState(false)

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
      if (!res.ok) throw new Error(`Server error ${res.status}`)
      setResult((await res.json()).result_png_base64)
    } catch (e: any) { setError(e.message) }
    finally { setLoading(false) }
  }

  return (
    <div>
      <PageHeader title="Damage Simulator" desc="Simulate the visual effects of a strike or disaster impact on an aerial image. For research purposes only." />

      <div style={{ display: "grid", gridTemplateColumns: "340px 1fr", gap: 20, alignItems: "start" }}>
        <div>
          <Card>
            <SectionTitle>Image</SectionTitle>
            <UploadBox preview={preview} onClick={() => fileRef.current?.click()} />
            <input ref={fileRef} type="file" accept=".png,.jpg,.jpeg" style={{ display: "none" }} onChange={onFile} />
          </Card>
          <Card>
            <SectionTitle>Impact Parameters</SectionTitle>
            <SliderField label="Center X" value={cx} set={setCx} min={0} max={512} />
            <SliderField label="Center Y" value={cy} set={setCy} min={0} max={512} />
            <SliderField label="Radius" value={radius} set={setRadius} min={20} max={250} />
          </Card>
          <Card>
            <SectionTitle>Effects</SectionTitle>
            <CheckField label="Crater deformation" value={crater} set={setCrater} />
            <CheckField label="Burn / charring" value={burn} set={setBurn} />
            <CheckField label="Debris scatter" value={debris} set={setDebris} />
            <CheckField label="Smoke overlay" value={smoke} set={setSmoke} />
            <CheckField label="Lens distortion (shockwave)" value={lens} set={setLens} />
            <div style={{ marginTop: 16 }}>
              <Btn onClick={run} loading={loading} disabled={!image}>Generate Impact</Btn>
            </div>
            {error && <ErrorMsg msg={error} />}
          </Card>
        </div>

        <div>
          {result ? (
            <Card>
              <SectionTitle>Result</SectionTitle>
              <TwoCol>
                <ResultImage src={preview!} label="Original" />
                <ResultImage src={toB64Img(result)} label="After Impact" />
              </TwoCol>
              <div style={{ marginTop: 16 }}>
                <a href={toB64Img(result)} download="simulation.png" style={{ display: "block", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 9, padding: "11px 24px", textAlign: "center", fontSize: 14, fontWeight: 600, color: "#94a3b8" }}>
                  Download Result
                </a>
              </div>
            </Card>
          ) : (
            <Card style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 320, border: "1.5px dashed rgba(255,255,255,0.06)" }}>
              <p style={{ color: "#1e293b", fontSize: 14 }}>Result will appear here</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
