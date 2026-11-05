function Header({ onLogout }) {
  return (
    <aside className="sidebar">
      <a href="#dashboard" className="sidebar-brand">
        <span className="sidebar-logo">SP</span>
        <span>
          <strong>SUPPLIER</strong>
          <small>INTELLIGENCE</small>
        </span>
      </a>

      <div className="sidebar-section-label">WORKSPACE</div>

      <nav className="sidebar-nav">
        <a href="#dashboard" className="nav-link active">
          <span className="nav-icon">▦</span>
          Overview
        </a>

        <a href="#suppliers" className="nav-link">
          <span className="nav-icon">♙</span>
          Suppliers
        </a>

        <a href="#performance" className="nav-link">
          <span className="nav-icon">↗</span>
          Performance
        </a>
      </nav>

      <div className="sidebar-bottom">
        <div className="sidebar-profile">
          <div className="profile-avatar">S</div>
          <div>
            <strong>Workspace</strong>
            <small>Administrator</small>
          </div>
        </div>

        <button className="sidebar-logout" onClick={onLogout}>
          <span>↪</span> Sign Out
        </button>
      </div>
    </aside>
  );
}

export default Header;