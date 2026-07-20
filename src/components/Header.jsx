function Header() {
  const dateStr = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month:   'short',
    day:     'numeric',
    year:    'numeric',
  }).format(new Date())

  return (
    <header className="header">
      <div className="header-inner">

        {/* Logo */}
        <a className="logo" href="#">
          <span className="logo-icon">🏈</span>
          <span className="logo-text">
            GRIDIRON<span className="logo-accent"> PUZZLE</span>
          </span>
        </a>

        {/* Nav */}
        <nav className="nav">
          <a href="#" className="nav-link active">Daily</a>
          <a href="#" className="nav-link">Archive</a>
          <a href="#" className="nav-link">Leaderboard</a>
          <a href="#" className="nav-link">How to Play</a>
        </nav>

        {/* Right side */}
        <div className="header-right">
          <span className="header-date">{dateStr}</span>
          <button className="header-icon-btn" title="Settings" aria-label="Settings">⚙</button>
        </div>

      </div>
    </header>
  )
}

export default Header
