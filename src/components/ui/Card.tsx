import React, { forwardRef } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { Slot } from '@radix-ui/react-slot'

const cardVariants = cva(
  'rounded-lg border bg-white text-neutral-900 shadow-sm transition-all duration-300 dark:bg-neutral-900 dark:text-neutral-100',
  {
    variants: {
      variant: {
        default: 'border-neutral-200 dark:border-neutral-800',
        outlined: 'border-neutral-300 shadow-none dark:border-neutral-700',
        elevated: 'border-neutral-200 shadow-md dark:border-neutral-800',
        interactive: 'border-neutral-200 hover:border-neutral-300 hover:shadow-md cursor-pointer dark:border-neutral-800 dark:hover:border-neutral-700',
      },
      padding: {
        none: 'p-0',
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
      },
    },
    defaultVariants: {
      variant: 'default',
      padding: 'md',
    },
  }
)

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  asChild?: boolean
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, padding, asChild, children, ...props }, ref) => {
    const Comp: any = asChild ? Slot : 'div'
    const content = children ?? null
    if (process.env.NODE_ENV !== 'production' && asChild) {
      if (!React.isValidElement(content)) {
        // eslint-disable-next-line no-console
        console.warn('Card(asChild): children must be a single React element. Received:', children)
      } else if (React.Children.count(content) !== 1) {
        // eslint-disable-next-line no-console
        console.warn('Card(asChild): expected exactly 1 child element, but received multiple.')
      }
    }
    return (
      <Comp
        ref={ref}
        className={cn(cardVariants({ variant, padding, className }))}
        {...props}
      >
        {asChild ? (content as React.ReactElement) : content}
      </Comp>
    )
  }
)

Card.displayName = 'Card'

const CardHeader = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col space-y-1.5 pb-4', className)}
    {...props}
  />
))

CardHeader.displayName = 'CardHeader'

const CardTitle = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn('text-lg font-semibold leading-none tracking-tight text-neutral-900 dark:text-neutral-50', className)}
    {...props}
  >
    {children}
  </h3>
))

CardTitle.displayName = 'CardTitle'

const CardDescription = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <p ref={ref} className={cn('text-sm text-neutral-600 dark:text-neutral-300', className)} {...props} />
))

CardDescription.displayName = 'CardDescription'

const CardContent = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('text-neutral-700 dark:text-neutral-200', className)} {...props} />
))

CardContent.displayName = 'CardContent'

const CardFooter = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center pt-4', className)}
    {...props}
  />
))

CardFooter.displayName = 'CardFooter'

export { 
  Card, 
  CardHeader, 
  CardFooter, 
  CardTitle, 
  CardDescription, 
  CardContent,
  cardVariants
}