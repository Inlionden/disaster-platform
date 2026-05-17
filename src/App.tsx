import React from "react"
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from "react-router-dom"
import { StatusRail, Icon } from "./lib/ui"
import Landing from "./pages/Landing"
import Analyze from "./pages/Analyze"
import Simulate from "./pages/Simulate"
import Density from "./pages/Density"
import Diff from "./pages/Diff"
import Strike from "./pages/Strike"

const NAV_TABS = [
  { to: "/",          num: "00", label: "Overview" },
  { to: "/analyze",   num: "01", label: "Analyze" },
  { to: "/simulate",  num: "02", label: "Simulate" },
  { to: "/density",   num: "03", label: "Density" },
  { to: "/diff",      num: "04", label: "Before / After" },
  { to: "/optimizer", num: "05", label: "Strike Optimizer" },
]

function Navbar() {
  const nav = useNavigate()
  const loc = useLocation()
  const active = (path: string) => {
    if (path === "/") return loc.pathname === "/"
    return loc.pathname.startsWith(path)
  }
  return (
    <header className="nav">
      <div className="nav-brand" onClick={() => nav("/")}>
        <div className="nav-mark">
          <svg viewBox="0 0 24 24" fill="none" stroke="var(--sky)" strokeWidth="1.6">
            <path d="M12 2L3 7l9 5 9-5-9-5z" />
            <path d="M3 12l9 5 9-5" opacity="0.55" />
            <path d="M3 17l9 5 9-5" opacity="0.3" />
          </svg>
        </div>
        <div className="nav-brand-text">
          <span className="nav-brand-name">DISASTER<span style={{ color: "var(--sky)" }}>AI</span></span>
          <span className="nav-brand-sub">DABLCNet · Research</span>
        </div>
      </div>
      <nav className="nav-tabs">
        {NAV_TABS.map(t => (
          <div key={t.to} className={"nav-tab" + (active(t.to) ? " active" : "")} onClick={() => nav(t.to)}>
            <span className="nav-tab-num">[ {t.num} ]</span>
            <span className="nav-tab-label">{t.label}</span>
          </div>
        ))}
      </nav>
      <div className="nav-meta">
        <span><span className="v">SESSION</span> 4F2C</span>
        <span><span className="v">USER</span> RESEARCH</span>
      </div>
    </header>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <StatusRail />
        <Navbar />
        <main className="main">
          <Routes>
            <Route path="/"          element={<Landing />} />
            <Route path="/analyze"   element={<Analyze />} />
            <Route path="/simulate"  element={<Simulate />} />
            <Route path="/density"   element={<Density />} />
            <Route path="/diff"      element={<Diff />} />
            <Route path="/optimizer" element={<Strike />} />
          </Routes>
        </main>
        <footer className="footer">
          <span>DisasterAI · DABLCNet v2.4.1</span>
          <span className="sp" />
          <span>For research and simulation purposes only · IRB-2026-117</span>
        </footer>
      </div>
    </BrowserRouter>
  )
}
