import React from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Typography } from '@/components/ui/Typography'
import { LogoIcon } from '@/components/brand/Logo'
import { Twitter, Github, Linkedin } from 'lucide-react'

interface FooterLink {
  href: string
  label: string
  external?: boolean
}

interface FooterSection {
  title: string
  links: FooterLink[]
}

interface FooterProps {
  sections?: FooterSection[]
  showSocial?: boolean
  showNewsletter?: boolean
  className?: string
}

const defaultSections: FooterSection[] = [
  {
    title: 'Produkt',
    links: [
      { href: '/designsystem', label: 'Designsystem' },
      { href: '/komponenter', label: 'Komponenter' },
      { href: '/funktioner', label: 'Funktioner' },
    ],
  },
  {
    title: 'Support',
    links: [
      { href: '/hjalp', label: 'Hjälpcenter' },
      { href: '/kontakt', label: 'Kontakta oss' },
      { href: '/feedback', label: 'Feedback' },
    ],
  },
  {
    title: 'Juridiskt',
    links: [
      { href: '/integritet', label: 'Integritetspolicy' },
      { href: '/villkor', label: 'Användarvillkor' },
      { href: '/cookies', label: 'Cookie-policy' },
    ],
  },
]

const socialLinks = [
  {
    name: 'Twitter',
    href: '#',
    icon: <Twitter size={20} strokeWidth={2} aria-hidden="true" />,
  },
  {
    name: 'GitHub',
    href: '#',
    icon: <Github size={20} strokeWidth={2} aria-hidden="true" />,
  },
  {
    name: 'LinkedIn',
    href: '#',
    icon: <Linkedin size={20} strokeWidth={2} aria-hidden="true" />,
  },
]

export function Footer({ 
  sections = defaultSections, 
  showSocial = true, 
  showNewsletter = true, 
  className 
}: FooterProps) {
  const currentYear = new Date().getFullYear()

  return (
    <footer
      className={cn(
        'bg-neutral-50 border-t border-neutral-200',
        className
      )}
      role="contentinfo"
    >
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          {/* Brand section */}
          <div className="space-y-8 xl:col-span-1">
            <Link
              href="/"
              className="flex items-center space-x-2 text-primary-600 hover:text-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded-md"
              aria-label="Go to homepage"
            >
              <LogoIcon size="lg" priority className="text-primary-600" />
              <Typography variant="h6" className="font-bold text-primary-600">
                Skolapp
              </Typography>
            </Link>
            <Typography variant="body2" className="max-w-md">
              Modern applikation för skolhantering designad för tillgänglighet, 
              prestanda och användarupplevelse.
            </Typography>
            {showSocial && (
              <div className="flex space-x-6">
                {socialLinks.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    className="text-neutral-400 hover:text-neutral-500 transition-colors duration-200"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Follow us on ${item.name}`}
                  >
                    <span className="sr-only">{item.name}</span>
                    {item.icon}
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Links sections */}
          <div className="mt-12 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
            <div className="md:grid md:grid-cols-2 md:gap-8">
              {sections.slice(0, 2).map((section) => (
                <div key={section.title}>
                  <Typography variant="small" className="font-semibold text-neutral-900 tracking-wider uppercase">
                    {section.title}
                  </Typography>
                  <ul role="list" className="mt-4 space-y-4">
                    {section.links.map((link) => (
                      <li key={link.href}>
                        {link.external ? (
                          <a
                            href={link.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-base text-neutral-500 hover:text-neutral-900 transition-colors duration-200"
                          >
                            {link.label}
                          </a>
                        ) : (
                          <Link
                            href={link.href}
                            className="text-base text-neutral-500 hover:text-neutral-900 transition-colors duration-200"
                          >
                            {link.label}
                          </Link>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className="md:grid md:grid-cols-2 md:gap-8">
              {sections.slice(2).map((section) => (
                <div key={section.title}>
                  <Typography variant="small" className="font-semibold text-neutral-900 tracking-wider uppercase">
                    {section.title}
                  </Typography>
                  <ul role="list" className="mt-4 space-y-4">
                    {section.links.map((link) => (
                      <li key={link.href}>
                        {link.external ? (
                          <a
                            href={link.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-base text-neutral-500 hover:text-neutral-900 transition-colors duration-200"
                          >
                            {link.label}
                          </a>
                        ) : (
                          <Link
                            href={link.href}
                            className="text-base text-neutral-500 hover:text-neutral-900 transition-colors duration-200"
                          >
                            {link.label}
                          </Link>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              
              {/* Newsletter signup */}
              {showNewsletter && (
                <div className="mt-8 md:mt-0">
                  <Typography variant="small" className="font-semibold text-neutral-900 tracking-wider uppercase">
                    Prenumerera på vårt nyhetsbrev
                  </Typography>
                  <Typography variant="body2" className="mt-4">
                    Få de senaste uppdateringarna och nyheterna levererade till din inkorg.
                  </Typography>
                  <form className="mt-4 sm:flex sm:max-w-md">
                    <label htmlFor="email-address" className="sr-only">
                      E-postadress
                    </label>
                    <input
                      type="email"
                      name="email-address"
                      id="email-address"
                      autoComplete="email"
                      required
                      className="min-w-0 flex-auto rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm placeholder:text-neutral-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                      placeholder="Ange din e-postadress"
                    />
                    <div className="mt-4 sm:mt-0 sm:ml-4 sm:flex-shrink-0">
                      <button
                        type="submit"
                        className="flex w-full items-center justify-center rounded-md bg-primary-700 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-700 transition-colors duration-200"
                      >
                        Prenumerera
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom section */}
        <div className="mt-12 border-t border-neutral-200 pt-8">
          <div className="md:flex md:items-center md:justify-between">
            <Typography variant="body2">
              &copy; {currentYear} Skolapp. Alla rättigheter förbehållna.
            </Typography>
            <div className="mt-4 flex space-x-6 md:mt-0">
              <Link 
                href="/integritet" 
                className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors duration-200"
              >
                Integritet
              </Link>
              <Link 
                href="/villkor" 
                className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors duration-200"
              >
                Villkor
              </Link>
              <Link 
                href="/tillganglighet" 
                className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors duration-200"
              >
                Tillgänglighet
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}