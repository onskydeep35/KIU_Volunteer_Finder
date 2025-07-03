import { useState } from 'react'
import { Link } from 'react-router-dom'

import AuthModal from '@/components/common/AuthModal'
import { useAuth } from '@/lib/useAuth'
import DropdownMenu from './DropdownMenu'

const NavBar = () => {
  const [open, setOpen] = useState(false)
  const [authOpen, setAuthOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { user, logout } = useAuth()

  return (
    <nav
      className="flex items-center justify-between h-18 px-8 border-b border-gray-100 shadow-sm bg-neutralLight"
      role="navigation"
      aria-label="main navigation"
    >
      <Link to="/" aria-label="Home" className="flex items-center">
      <img
        src="/kaiKaci_full.svg"
        alt="Home"
        className="w-66 h-18 object-contain rounded"
      />
      </Link>
      <button
        className="sm:hidden p-2"
        aria-label="Open menu"
        onClick={() => setMobileOpen(true)}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          className="w-6 h-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1116.65 7.65a7.5 7.5 0 010 10.6z"
          />
        </svg>
      </button>
      <div className="ml-auto hidden sm:block">
        
        {user && (user.name || user.email) ? (
          <DropdownMenu
            open={open}
            onClose={() => setOpen(false)}
            trigger={
              <button
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-neutralLight"
                onClick={(e) => {
                  e.stopPropagation();
                  setOpen(!open);
                }}
              >
                <div className="w-8 h-8 rounded-full bg-primary text-neutralLight flex items-center justify-center text-sm font-medium">
                  {user.email}
                </div>
                <span className="hidden sm:block text-neutralDark font-medium">
                  {user.email}
                </span>
              </button>
            }
          >
            <button
              className="block w-full text-left px-4 py-2 hover:bg-gray-100"
              onClick={() => window.location.href = '/myevents'}
            >
              My Events
            </button>
            <button
              className="block w-full text-left px-4 py-2 hover:bg-gray-100"
              onClick={() => window.location.href = '/mysubmissions'}
            >
              My Submissions
            </button>
            <button
              className="block w-full text-left px-4 py-2 hover:bg-gray-100"
              onClick={() => logout()}
            >
              Logout
            </button>
          </DropdownMenu>
        ) : (
          <button
            className="border border-primary text-primary hover:bg-primary hover:text-white rounded-lg py-2 px-5 text-sm font-semibold"
            onClick={() => setAuthOpen(true)}
            aria-label="Login / Register"
          >
            Login / Register
          </button>
        )}
      </div>
      {mobileOpen && (
        <div className="fixed inset-0 bg-neutralLight p-4 flex flex-col gap-4 z-20">
          <button
            aria-label="Close menu"
            className="self-end text-2xl"
            onClick={() => setMobileOpen(false)}
          >
            ×
          </button>
          {user ? (
            <button
              onClick={() => {
                logout()
                setMobileOpen(false)
              }}
              className="btn-primary"
            >
              Logout
            </button>
          ) : (
            <button
              onClick={() => {
                setAuthOpen(true)
                setMobileOpen(false)
              }}
              className="btn-primary"
            >
              Login / Register
            </button>
          )}
        </div>
      )}
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </nav>
  )
}

export default NavBar
