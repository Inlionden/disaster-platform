import React from "react"
import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom"
import Analyze from "./pages/Analyze"
import Simulate from "./pages/Simulate"
import Density from "./pages/Density"
import Diff from "./pages/Diff"
import Strike from "./pages/Strike"

const NAV = [
  { to: "/",         label: "Analyze",     icon: "⬡" },
  { to: "/simulate", label: "Simulate",    icon: "💥" },
  { to: "/density",  label: "Density",     icon: "🌡" },
  { to: "/diff",     label: "Before/After",icon: "⇄" },
  { to: "/strike",   label: "Strike",      icon: "◎" },
]

export default function App() {
  return (
    <BrowserRouter>
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>

        {/* Top navbar */}
        <header style={nav.header}>
          <div style={nav.inner}>
            <div style={nav.brand}>
              <span style={nav.dot} />
              <span style={nav.brandText}>DisasterAI</span>
              <span style={nav.brandTag}>Research Platform</span>
            </div>
            <nav style={nav.links}>
              {NAV.map(({ to, label, icon }) => (
                <NavLink key={to} to={to} end style={({ isActive }) => ({ ...nav.link, ...(isActive ? nav.active : {}) })}>
                  <span style={{ marginRight: 6, fontSize: 13 }}>{icon}</span>{label}
                </NavLink>
              ))}
            </nav>
          </div>
        </header>

        {/* Page content */}
        <main style={{ flex: 1, maxWidth: 1040, width: "100%", margin: "0 auto", padding: "40px 24px" }}>
          <Routes>
            <Route path="/"         element={<Analyze />} />
            <Route path="/simulate" element={<Simulate />} />
            <Route path="/density"  element={<Density />} />
            <Route path="/diff"     element={<Diff />} />
            <Route path="/strike"   element={<Strike />} />
          </Routes>
        </main>

        <footer style={nav.footer}>
          DisasterAI — For research and simulation purposes only
        </footer>
      </div>
    </BrowserRouter>
  )
}

const nav: Record<string, React.CSSProperties> = {
  header: { background: "rgba(6,9,16,0.85)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(255,255,255,0.06)", position: "sticky", top: 0, zIndex: 100 },
  inner: { maxWidth: 1040, margin: "0 auto", padding: "0 24px", height: 58, display: "flex", alignItems: "center", justifyContent: "space-between" },
  brand: { display: "flex", alignItems: "center", gap: 10 },
  dot: { width: 8, height: 8, borderRadius: "50%", background: "#38bdf8", boxShadow: "0 0 8px #38bdf8" },
  brandText: { fontWeight: 700, fontSize: 16, color: "#f1f5f9", letterSpacing: "-0.3px" },
  brandTag: { fontSize: 11, color: "#475569", background: "#0f172a", padding: "2px 8px", borderRadius: 4, border: "1px solid #1e293b" },
  links: { display: "flex", gap: 2 },
  link: { display: "flex", alignItems: "center", padding: "6px 13px", borderRadius: 7, color: "#64748b", fontSize: 13, fontWeight: 500, transition: "all 0.15s" },
  active: { background: "rgba(56,189,248,0.1)", color: "#38bdf8", border: "1px solid rgba(56,189,248,0.2)" },
  footer: { textAlign: "center", padding: "20px 24px", color: "#1e293b", fontSize: 12, borderTop: "1px solid rgba(255,255,255,0.04)" },
}
