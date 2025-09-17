import React from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Typography } from '@/components/ui/Typography'

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
    title: 'Product',
    links: [
      { href: '/plan', label: 'Plan' },
      { href: '/tasks', label: 'Tasks' },
      { href: '/features', label: 'Features' },
    ],
  },
  {
    title: 'Support',
    links: [
      { href: '/help', label: 'Help Center' },
      { href: '/contact', label: 'Contact Us' },
      { href: '/feedback', label: 'Feedback' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { href: '/privacy', label: 'Privacy Policy' },
      { href: '/terms', label: 'Terms of Service' },
      { href: '/cookies', label: 'Cookie Policy' },
    ],
  },
]

const socialLinks = [
  {
    name: 'Twitter',
    href: '#',
    icon: (
      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
      </svg>
    ),
  },
  {
    name: 'GitHub',
    href: '#',
    icon: (
      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path
          fillRule="evenodd"
          d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
          clipRule="evenodd"
        />
      </svg>
    ),
  },
  {
    name: 'LinkedIn',
    href: '#',
    icon: (
      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path
          fillRule="evenodd"
          d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"
          clipRule="evenodd"
        />
      </svg>
    ),
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
              <svg
                className="h-8 w-8"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M12 2L2 7v10c0 5.55 3.84 9.74 9 11 5.16-1.26 9-5.45 9-11V7l-10-5z" />
              </svg>
              <Typography variant="h6" className="font-bold">
                Skolapp
              </Typography>
            </Link>
            <Typography variant="body2" className="max-w-md">
              Modern school management application designed for accessibility, 
              performance, and user experience.
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
                    Subscribe to our newsletter
                  </Typography>
                  <Typography variant="body2" className="mt-4">
                    Get the latest updates and news delivered to your inbox.
                  </Typography>
                  <form className="mt-4 sm:flex sm:max-w-md">
                    <label htmlFor="email-address" className="sr-only">
                      Email address
                    </label>
                    <input
                      type="email"
                      name="email-address"
                      id="email-address"
                      autoComplete="email"
                      required
                      className="min-w-0 flex-auto rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm placeholder:text-neutral-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                      placeholder="Enter your email"
                    />
                    <div className="mt-4 sm:mt-0 sm:ml-4 sm:flex-shrink-0">
                      <button
                        type="submit"
                        className="flex w-full items-center justify-center rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 transition-colors duration-200"
                      >
                        Subscribe
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
              &copy; {currentYear} Skolapp. All rights reserved.
            </Typography>
            <div className="mt-4 flex space-x-6 md:mt-0">
              <Link 
                href="/privacy" 
                className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors duration-200"
              >
                Privacy
              </Link>
              <Link 
                href="/terms" 
                className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors duration-200"
              >
                Terms
              </Link>
              <Link 
                href="/accessibility" 
                className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors duration-200"
              >
                Accessibility
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}