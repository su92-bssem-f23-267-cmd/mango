'use client'

import Link from 'next/link'
import { Mail, Phone, MapPin } from 'lucide-react'
import { usePathname } from 'next/navigation'

export function Footer() {
  const pathname = usePathname()
  if (pathname?.startsWith('/admin')) {
    return null
  }

  return (
    <footer className="w-full bg-gradient-to-b from-secondary/30 to-secondary/60 border-t border-border/40 mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand and Description */}
          <div className="space-y-4">
            <span className="text-xl font-black tracking-tight text-primary">
              Fruit<span className="text-accent font-black">Gala</span>
            </span>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Sourcing the finest, hand-picked premium fresh fruits and artisanal delicacies from globally certified orchards directly to your doorstep.
            </p>
            <div className="flex space-x-4">
              <Link href="#" aria-label="Facebook" className="text-muted-foreground hover:text-accent transition">
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                  <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1V12h3v3h-3v6.8c4.56-.93 8-4.96 8-9.8z"/>
                </svg>
              </Link>
              <Link href="#" aria-label="Twitter" className="text-muted-foreground hover:text-accent transition">
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </Link>
              <Link href="#" aria-label="Instagram" className="text-muted-foreground hover:text-accent transition">
                <svg className="h-4 w-4 fill-none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                </svg>
              </Link>
            </div>
          </div>

          {/* Delivery Areas */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">Our Branches at</h4>
            <ul className="space-y-1.5 text-xs text-muted-foreground font-semibold">
              <li>Islamabad</li>
              <li>Rawalpindi</li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">Contact Us</h4>
            <ul className="space-y-2.5 text-xs text-muted-foreground">
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary shrink-0" />
                <span>Islamabad, Pakistan</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary shrink-0" />
                <a href="tel:+923056662974" className="hover:text-accent transition">+92 305 6662974</a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary shrink-0" />
                <span>support@fruitgala.com</span>
              </li>
            </ul>
          </div>

          {/* Newsletter Signup */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">Join the Club</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Subscribe to get exclusive access to seasonal variety drops, orchard stories, and discount promotions.
            </p>
            <form onSubmit={(e) => e.preventDefault()} className="flex gap-2">
              <input
                type="email"
                placeholder="Your email address"
                required
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm transition-colors file:border-0 file:bg-transparent file:text-xs file:font-semibold placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              />
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-md text-xs font-semibold h-9 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/95 transition cursor-pointer"
              >
                Join
              </button>
            </form>
          </div>
        </div>

        {/* Lower footer copyright */}
        <div className="border-t border-border/60 mt-10 pt-6 flex flex-col md:flex-row items-center justify-between text-xs text-muted-foreground gap-4">
          <p>&copy; {new Date().getFullYear()} Fruit Gala LLC. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="#" className="hover:text-accent transition">Privacy Policy</Link>
            <Link href="#" className="hover:text-accent transition">Terms of Service</Link>
            <Link href="#" className="hover:text-accent transition">Orchard Trade</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
export default Footer
