import React, { forwardRef } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const typographyVariants = cva('', {
  variants: {
    variant: {
      h1: 'text-4xl font-bold tracking-tight text-neutral-900 sm:text-5xl',
      h2: 'text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl',
      h3: 'text-2xl font-semibold tracking-tight text-neutral-900 sm:text-3xl',
      h4: 'text-xl font-semibold tracking-tight text-neutral-900 sm:text-2xl',
      h5: 'text-lg font-semibold tracking-tight text-neutral-900 sm:text-xl',
      h6: 'text-base font-semibold tracking-tight text-neutral-900 sm:text-lg',
      body1: 'text-base text-neutral-700 leading-relaxed',
      body2: 'text-sm text-neutral-600 leading-relaxed',
      caption: 'text-xs text-neutral-500 leading-normal',
      overline: 'text-xs text-neutral-500 uppercase tracking-wider font-medium',
      subtitle1: 'text-lg text-neutral-600 leading-relaxed',
      subtitle2: 'text-base text-neutral-600 leading-relaxed',
      button: 'text-sm font-medium leading-none',
      code: 'font-mono text-sm bg-neutral-100 px-1.5 py-0.5 rounded border',
      kbd: 'font-mono text-xs bg-neutral-100 border border-neutral-300 px-1.5 py-0.5 rounded shadow-sm',
      link: 'text-primary-600 hover:text-primary-700 underline-offset-4 hover:underline transition-colors',
      muted: 'text-neutral-500',
      small: 'text-sm font-medium leading-none',
      large: 'text-lg font-semibold',
    },
    align: {
      left: 'text-left',
      center: 'text-center',
      right: 'text-right',
      justify: 'text-justify',
    },
    color: {
      default: '',
      primary: 'text-primary-600',
      secondary: 'text-neutral-600',
      success: 'text-success-600',
      warning: 'text-warning-600',
      error: 'text-error-600',
      muted: 'text-neutral-500',
    },
    truncate: {
      true: 'truncate',
      false: '',
    },
    gradient: {
      true: 'bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent',
      false: '',
    },
  },
  defaultVariants: {
    variant: 'body1',
    align: 'left',
    color: 'default',
    truncate: false,
    gradient: false,
  },
})

type TypographyElement = 
  | 'h1' 
  | 'h2' 
  | 'h3' 
  | 'h4' 
  | 'h5' 
  | 'h6' 
  | 'p' 
  | 'span' 
  | 'div' 
  | 'code' 
  | 'kbd' 
  | 'a'

const elementMap: Record<string, TypographyElement> = {
  h1: 'h1',
  h2: 'h2',
  h3: 'h3',
  h4: 'h4',
  h5: 'h5',
  h6: 'h6',
  body1: 'p',
  body2: 'p',
  subtitle1: 'p',
  subtitle2: 'p',
  caption: 'span',
  overline: 'span',
  button: 'span',
  code: 'code',
  kbd: 'kbd',
  link: 'a',
  muted: 'span',
  small: 'span',
  large: 'span',
}

export interface TypographyProps
  extends Omit<React.HTMLAttributes<HTMLElement>, 'color'>,
    VariantProps<typeof typographyVariants> {
  as?: TypographyElement
  href?: string
  target?: string
  rel?: string
}

const Typography = forwardRef<HTMLElement, TypographyProps>(
  ({ 
    className, 
    variant = 'body1', 
    align, 
    color, 
    truncate, 
    gradient,
    as, 
    children,
    href,
    target,
    rel,
    ...props 
  }, ref) => {
    // Determine the element to render
    const Element = as || (variant ? elementMap[variant] : undefined) || 'p'
    
    // Add appropriate props for links
    const linkProps = Element === 'a' ? { href, target, rel } : {}
    
    // Handle external links security
    const secureProps = target === '_blank' ? { rel: 'noopener noreferrer' } : {}

    return React.createElement(
      Element,
      {
        className: cn(typographyVariants({ variant, align, color, truncate, gradient, className })),
        ref,
        ...linkProps,
        ...secureProps,
        ...props,
      },
      children
    )
  }
)

Typography.displayName = 'Typography'

// Convenience components for common use cases
const Heading = forwardRef<HTMLHeadingElement, Omit<TypographyProps, 'variant'> & { level: 1 | 2 | 3 | 4 | 5 | 6 }>(
  ({ level, ...props }, ref) => (
    <Typography 
      ref={ref} 
      variant={`h${level}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'} 
      {...props} 
    />
  )
)

Heading.displayName = 'Heading'

const Text = forwardRef<HTMLParagraphElement, Omit<TypographyProps, 'variant'> & { size?: 'sm' | 'base' | 'lg' }>(
  ({ size = 'base', ...props }, ref) => {
    const variant = size === 'sm' ? 'body2' : size === 'lg' ? 'subtitle1' : 'body1'
    return (
      <Typography 
        ref={ref} 
        variant={variant} 
        {...props} 
      />
    )
  }
)

Text.displayName = 'Text'

const Code = forwardRef<HTMLElement, Omit<TypographyProps, 'variant'>>(
  (props, ref) => (
    <Typography 
      ref={ref} 
      variant="code" 
      {...props} 
    />
  )
)

Code.displayName = 'Code'

const Kbd = forwardRef<HTMLElement, Omit<TypographyProps, 'variant'>>(
  (props, ref) => (
    <Typography 
      ref={ref} 
      variant="kbd" 
      {...props} 
    />
  )
)

Kbd.displayName = 'Kbd'

const Link = forwardRef<HTMLAnchorElement, Omit<TypographyProps, 'variant' | 'as'>>(
  (props, ref) => (
    <Typography 
      ref={ref} 
      variant="link" 
      as="a"
      {...props} 
    />
  )
)

Link.displayName = 'Link'

export { 
  Typography, 
  Heading, 
  Text, 
  Code, 
  Kbd, 
  Link,
  typographyVariants 
}