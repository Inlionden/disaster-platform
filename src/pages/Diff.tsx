import React, { useState, useRef } from "react"
import { API_URL, toB64Img, PageHeader, Card, SectionTitle, Stat, StatsGrid, UploadBox, Btn, ErrorMsg, TwoCol, ResultImage } from "../lib/ui"

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
      if (!res.ok) throw new Error(`Server error ${res.status}`)
      setResult(await res.json())
    } catch (e: any) { setError(e.message) }
    finally { setLoading(false) }
  }

  const dmg = result?.damage_score ?? 0
  const dmgColor = dmg > 0.5 ? "#f87171" : dmg > 0.2 ? "#fbbf24" : "#34d399"
  const severity = dmg > 0.5 ? "HIGH" : dmg > 0.2 ? "MEDIUM" : "LOW"

  return (
    <div>
      <PageHeader title="Before / After Analysis" desc="Upload two images of the same area to detect structural damage and changes over time." />

      <Card>
        <SectionTitle>Upload Images</SectionTitle>
        <TwoCol>
          <div>
            <div style={{ fontSize: 12, color: "#475569", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>Before</div>
            <UploadBox preview={previewB} onClick={() => refB.current?.click()} label="Upload BEFORE image" />
            <input ref={refB} type="file" accept=".png,.jpg,.jpeg,.tif,.tiff" style={{ display: "none" }} onChange={onBefore} />
          </div>
          <div>
            <div style={{ fontSize: 12, color: "#475569", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>After</div>
            <UploadBox preview={previewA} onClick={() => refA.current?.click()} label="Upload AFTER image" />
            <input ref={refA} type="file" accept=".png,.jpg,.jpeg,.tif,.tiff" style={{ display: "none" }} onChange={onAfter} />
          </div>
        </TwoCol>
        <Btn onClick={run} loading={loading} disabled={!before || !after}>Analyse Damage</Btn>
        {error && <ErrorMsg msg={error} />}
      </Card>

      {result && (
        <>
          <Card>
            <SectionTitle>Damage Report</SectionTitle>
            <div style={{ display: "flex", alignItems: "center", gap: 20, background: "#060910", borderRadius: 10, padding: 20, marginBottom: 20, border: `1px solid ${dmgColor}30` }}>
              <div style={{ textAlign: "center", minWidth: 100 }}>
                <div style={{ fontSize: 42, fontWeight: 800, color: dmgColor, letterSpacing: "-1px" }}>{(dmg * 100).toFixed(0)}%</div>
                <div style={{ fontSize: 11, color: "#475569", textTransform: "uppercase", letterSpacing: "0.1em" }}>Damage Score</div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ height: 8, background: "#1e293b", borderRadius: 4, overflow: "hidden", marginBottom: 8 }}>
                  <div style={{ height: "100%", width: `${dmg * 100}%`, background: dmgColor, borderRadius: 4, transition: "width 1s ease" }} />
                </div>
                <div style={{ fontSize: 13, color: dmgColor, fontWeight: 600 }}>Severity: {severity}</div>
              </div>
            </div>
            <StatsGrid>
              <Stat label="Destroyed Pixels" value={result.destroyed_pixels?.toLocaleString()} accent="#f87171" />
              <Stat label="New Pixels" value={result.new_pixels?.toLocaleString()} accent="#34d399" />
              <Stat label="Damage Score" value={(dmg * 100).toFixed(1) + "%"} accent={dmgColor} />
              <Stat label="Severity" value={severity} accent={dmgColor} />
            </StatsGrid>
          </Card>

          <Card>
            <SectionTitle>Change Detection</SectionTitle>
            <ResultImage src={toB64Img(result.destroyed_mask_base64)} label="Destroyed Buildings Mask (white = lost structures)" />
          </Card>
        </>
      )}
    </div>
  )
}
