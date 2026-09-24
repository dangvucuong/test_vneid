import { NavLink, Outlet } from 'react-router-dom'

const links = [
  { to: '/', label: 'Kết nối', end: true },
  { to: '/providers', label: 'Nhà cung cấp', end: false },
  { to: '/register', label: 'Đăng ký CCTS', end: false },
  { to: '/certificates', label: 'Danh sách CCTS', end: false },
  { to: '/sign', label: 'Ký hash', end: false },
  { to: '/events', label: 'Nhật ký webhook', end: false },
]

export function AppLayout() {
  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">
          <p className="brand-kicker">VNeID</p>
          <h1>Sign Console</h1>
        </div>
        <nav>
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.end} className="nav-link">
              {link.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <main className="content">
        <Outlet />
      </main>
    </div>
  )
}
