import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Facebook, Twitter, Instagram, Linkedin, Github } from 'lucide-react'

export function Footer() {
  return (
    <footer className="bg-muted border-t">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">PrivacyNumber</h3>
            <p className="text-sm text-muted-foreground">
              The leading SMS verification service providing disposable phone numbers 
              for secure online verification.
            </p>
            <div className="flex space-x-4">
              <Link href="#" className="text-muted-foreground hover:text-primary">
                <Facebook className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary">
                <Twitter className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary">
                <Instagram className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary">
                <Linkedin className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary">
                <Github className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Services</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="text-muted-foreground hover:text-primary">
                  SMS Online
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-muted-foreground hover:text-primary">
                  Rent Numbers
                </Link>
              </li>
              <li>
                <Link href="/api" className="text-muted-foreground hover:text-primary">
                  API Connection
                </Link>
              </li>
              <li>
                <Link href="/proxy" className="text-muted-foreground hover:text-primary">
                  Proxy Services
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Support</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/help" className="text-muted-foreground hover:text-primary">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-muted-foreground hover:text-primary">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-muted-foreground hover:text-primary">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-muted-foreground hover:text-primary">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/privacy" className="text-muted-foreground hover:text-primary">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-muted-foreground hover:text-primary">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="text-muted-foreground hover:text-primary">
                  Cookie Policy
                </Link>
              </li>
              <li>
                <Link href="/refund" className="text-muted-foreground hover:text-primary">
                  Refund Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-muted-foreground">
              © 2024 PrivacyNumber. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link href="/sitemap" className="text-sm text-muted-foreground hover:text-primary">
                Sitemap
              </Link>
              <Link href="/status" className="text-sm text-muted-foreground hover:text-primary">
                Status
              </Link>
              <Link href="/security" className="text-sm text-muted-foreground hover:text-primary">
                Security
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
