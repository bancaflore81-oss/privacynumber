'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Menu, X, User, LogOut } from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'

export function Navbar() {
  const { user, logout, loading } = useAuth()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <header className="header">
      <nav className="nav">
        <Link href="/" className="logo">
          PrivacyNumber
        </Link>

        {/* Desktop Navigation */}
        <ul className="nav-menu">
          <li><Link href="/">SMS Online</Link></li>
          <li><Link href="/pricing">Rent</Link></li>
          <li><Link href="/api">API Connection</Link></li>
          <li><Link href="/proxy">Proxy</Link></li>
          <li><Link href="/blog">Blog</Link></li>
          <li><Link href="/help">Help</Link></li>
        </ul>

        <div className="nav-buttons">
          {user ? (
            <>
              <Link href="/dashboard" className="text-gray-700 hover:text-primary transition-colors">
                Dashboard
              </Link>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">
                  Balance: ${user.balance.toFixed(2)}
                </span>
                <div className="flex items-center space-x-2">
                  <User className="h-5 w-5 text-gray-500" />
                  <span className="text-sm text-gray-700">{user.name || user.email}</span>
                </div>
                <button onClick={logout} className="btn btn-outline">
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </button>
              </div>
            </>
          ) : (
            <>
              <Link href="/auth/login" className="btn btn-outline">
                Log In
              </Link>
              <Link href="/auth/register" className="btn btn-primary">
                Sign Up
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden flex items-center">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 text-gray-700 hover:text-primary"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden bg-white border-t">
          <div className="px-4 py-2 space-y-2">
            <Link href="/" className="block px-3 py-2 text-gray-700 hover:text-primary">
              SMS Online
            </Link>
            <Link href="/pricing" className="block px-3 py-2 text-gray-700 hover:text-primary">
              Rent
            </Link>
            <Link href="/api" className="block px-3 py-2 text-gray-700 hover:text-primary">
              API Connection
            </Link>
            <Link href="/proxy" className="block px-3 py-2 text-gray-700 hover:text-primary">
              Proxy
            </Link>
            <Link href="/blog" className="block px-3 py-2 text-gray-700 hover:text-primary">
              Blog
            </Link>
            <Link href="/help" className="block px-3 py-2 text-gray-700 hover:text-primary">
              Help
            </Link>
            {user ? (
              <>
                <Link href="/dashboard" className="block px-3 py-2 text-gray-700 hover:text-primary">
                  Dashboard
                </Link>
                <div className="px-3 py-2 text-sm text-gray-600">
                  Balance: ${user.balance.toFixed(2)}
                </div>
                <div className="px-3 py-2 text-sm text-gray-600">
                  {user.name || user.email}
                </div>
                <button onClick={logout} className="btn btn-outline w-full mt-2">
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </button>
              </>
            ) : (
              <div className="space-y-2">
                <Link href="/auth/login" className="block">
                  <button className="btn btn-outline w-full">Log In</button>
                </Link>
                <Link href="/auth/register" className="block">
                  <button className="btn btn-primary w-full">Sign Up</button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
