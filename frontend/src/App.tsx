import { useState } from 'react'
import { Link, NavLink, Outlet, Route, Routes } from 'react-router-dom'
import './App.css'

const navItems = [
  { label: 'Overview', to: '/' },
  { label: 'Assessment', to: '/assessment' },
  { label: 'Career paths', to: '/careers' },
]

function Layout() {
  const [language, setLanguage] = useState<'EN' | 'हिंदी'>('EN')

  return (
    <div className="app-shell">
      <aside className="sidebar" aria-label="Primary navigation">
        <Link className="brand" to="/" aria-label="AI Navigator home">
          <span className="brand-mark">A</span>
          <span>AI Navigator</span>
        </Link>
        <div className="sidebar-label">Your journey</div>
        <nav className="nav-list">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              <span className="nav-dot" aria-hidden="true" />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="progress-mini"><span>Profile setup</span><strong>35%</strong></div>
          <div className="progress-track"><span style={{ width: '35%' }} /></div>
          <button className="quiet-button" type="button" onClick={() => setLanguage(language === 'EN' ? 'हिंदी' : 'EN')} aria-label="Change language">{language} <span>↔</span></button>
        </div>
      </aside>
      <main className="main-content">
        <header className="topbar">
          <div className="breadcrumb">AI Navigator <span>/</span> <strong>Student workspace</strong></div>
          <div className="profile-chip"><span className="avatar">AS</span><span className="profile-name">Aarav Sharma</span><span className="chevron">⌄</span></div>
        </header>
        <Outlet />
      </main>
    </div>
  )
}

function Overview() {
  return <section className="page page-overview">
    <div className="eyebrow">MONDAY, 24 OCTOBER 2026</div>
    <div className="hero-heading"><div><h1>Find work that feels like yours.</h1><p>Small steps today can make your next decision clearer.</p></div><div className="hero-orbit" aria-hidden="true"><span /><span /><span /></div></div>
    <div className="notice" role="status"><span className="notice-icon">i</span><span><strong>A better starting point</strong><br />Take the interest assessment to see which directions fit your strengths. It takes about 8 minutes.</span><Link to="/assessment" className="text-link">Start assessment <span>→</span></Link></div>
    <div className="section-heading"><div><h2>Your workspace</h2><p>Pick up where you left off.</p></div><span className="status-pill"><span /> Safe space</span></div>
    <div className="card-grid">
      <Link to="/assessment" className="feature-card assessment-card"><div className="card-top"><span className="card-icon">↗</span><span className="card-tag">NOT STARTED</span></div><h3>Interest assessment</h3><p>Understand the kind of work environments and activities that energise you.</p><div className="card-footer">30 questions <span>→</span></div></Link>
      <Link to="/careers" className="feature-card career-card"><div className="card-top"><span className="card-icon">✦</span><span className="card-tag">EXPLORE</span></div><h3>Career paths</h3><p>Browse possibilities with clear details on subjects, skills and next steps.</p><div className="card-footer">See all paths <span>→</span></div></Link>
    </div>
    <div className="lower-grid"><div className="quote-card"><span className="quote-mark">“</span><p>You don't have to have it all figured out. You only need a next step.</p><small>AI Navigator principle</small></div><div className="facts-card"><div><span className="fact-number">0</span><span>decisions rushed</span></div><div><span className="fact-number">100%</span><span>your pace</span></div><div><span className="fact-number">∞</span><span>directions to explore</span></div></div></div>
  </section>
}

function Assessment() { return <section className="page simple-page"><div className="eyebrow">ASSESSMENT</div><h1>A clearer picture starts here.</h1><p className="lead">Answer honestly. There are no right or wrong answers.</p><Link className="primary-button" to="/">Back to overview <span>→</span></Link></section> }
function Careers() { return <section className="page simple-page"><div className="eyebrow">CAREER PATHS</div><h1>Possibilities worth exploring.</h1><p className="lead">Your recommendations will appear after the interest assessment.</p><Link className="primary-button" to="/assessment">Take assessment <span>→</span></Link></section> }

export default function App() { return <Routes><Route element={<Layout />}><Route path="/" element={<Overview />} /><Route path="/assessment" element={<Assessment />} /><Route path="/careers" element={<Careers />} /></Route></Routes> }
