import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faSquareParking, faBell, faUser, faRightFromBracket, faShieldHalved,
} from '@fortawesome/free-solid-svg-icons'
import { useAuth } from '../context/AuthContext.jsx'

const NAV = [
  { to: '/monitor', label: '실시간 관제' },
  { to: '/guide', label: '주차 유도' },
  { to: '/find-car', label: '내 차 찾기' },
  { to: '/report', label: '운영 리포트' },
]

const linkCls = ({ isActive }) =>
  `rounded-md px-3 py-2 text-sm font-medium transition ${
    isActive ? 'bg-brand-50 text-brand-600' : 'text-slate-600 hover:bg-slate-100'
  }`

export default function Header() {
  const { user, logout } = useAuth()
  const [open, setOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const navigate = useNavigate()

  const closeDrawer = () => setOpen(false)

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2" onClick={closeDrawer}>
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-white">
            <FontAwesomeIcon icon={faSquareParking} />
          </span>
          <span className="font-display text-xl font-bold tracking-tight text-brand-900">parkpick</span>
          {user?.role === 'test_admin' && (
            <span className="ml-2 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-700">
              TEST ADMIN · 읽기 전용
            </span>
          )}
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV.map((n) => (
            <NavLink key={n.to} to={n.to} className={linkCls}>
              {n.label}
            </NavLink>
          ))}
          {(user?.role === 'admin' || user?.role === 'test_admin') && (
            <NavLink to="/admin" className={linkCls}>
              <FontAwesomeIcon icon={faShieldHalved} className="mr-1" />
              관리자
            </NavLink>
          )}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {user ? (
            <>
              <button className="relative rounded-full p-2 text-slate-500 hover:bg-slate-100" title="이상 이벤트 알림">
                <FontAwesomeIcon icon={faBell} />
                <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-orange-500" />
              </button>
              <div className="relative">
                <button
                  onClick={() => setMenuOpen((v) => !v)}
                  className="flex items-center gap-2 rounded-full py-1 pl-1 pr-3 hover:bg-slate-100"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-brand-600">
                    <FontAwesomeIcon icon={faUser} />
                  </span>
                  <span className="text-sm font-medium">{user.name}</span>
                </button>
                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-44 rounded-xl border bg-white py-1 shadow-lg">
                    <Link to="/mypage" onClick={() => setMenuOpen(false)} className="block px-4 py-2 text-sm hover:bg-slate-50">
                      마이페이지
                    </Link>
                    <button
                      onClick={() => { logout(); setMenuOpen(false); navigate('/') }}
                      className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-red-500 hover:bg-red-50"
                    >
                      <FontAwesomeIcon icon={faRightFromBracket} /> 로그아웃
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <Link
              to="/login"
              className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
            >
              로그인
            </Link>
          )}
        </div>

        {/* 모바일 햄버거 ↔ X 전환 */}
        <button
          className="relative h-10 w-10 md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="메뉴"
        >
          <span
            className={`absolute left-2 top-3 block h-0.5 w-6 bg-slate-700 transition-all duration-300 ${
              open ? 'top-5 rotate-45' : ''
            }`}
          />
          <span
            className={`absolute left-2 top-5 block h-0.5 w-6 bg-slate-700 transition-all duration-300 ${
              open ? 'opacity-0' : ''
            }`}
          />
          <span
            className={`absolute left-2 top-7 block h-0.5 w-6 bg-slate-700 transition-all duration-300 ${
              open ? 'top-5 -rotate-45' : ''
            }`}
          />
        </button>
      </div>

      {/* 모바일 드로어 (우→좌 슬라이드) */}
      <div
        className={`fixed inset-0 z-40 bg-black/40 transition-opacity duration-300 md:hidden ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={closeDrawer}
      />
      <aside
        className={`fixed right-0 top-0 z-50 h-full w-72 bg-white shadow-2xl transition-transform duration-300 ease-out md:hidden ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b px-5">
          <span className="font-display text-lg font-bold text-brand-900">parkpick</span>
        </div>
        <nav className="flex flex-col gap-1 p-4">
          {NAV.map((n) => (
            <NavLink key={n.to} to={n.to} onClick={closeDrawer} className={linkCls}>
              {n.label}
            </NavLink>
          ))}
          {(user?.role === 'admin' || user?.role === 'test_admin') && (
            <NavLink to="/admin" onClick={closeDrawer} className={linkCls}>
              관리자
            </NavLink>
          )}
          <hr className="my-3" />
          {user ? (
            <>
              <NavLink to="/mypage" onClick={closeDrawer} className={linkCls}>
                마이페이지
              </NavLink>
              <button
                onClick={() => { logout(); closeDrawer(); navigate('/') }}
                className="rounded-md px-3 py-2 text-left text-sm font-medium text-red-500 hover:bg-red-50"
              >
                로그아웃
              </button>
            </>
          ) : (
            <NavLink to="/login" onClick={closeDrawer} className={linkCls}>
              로그인
            </NavLink>
          )}
        </nav>
      </aside>
    </header>
  )
}
