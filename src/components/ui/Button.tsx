import React, { forwardRef } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'
import { Slot } from '@radix-ui/react-slot'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-x-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-50 dark:focus-visible:ring-offset-neutral-900 disabled:pointer-events-none disabled:opacity-50 active:scale-95',
  {
    variants: {
      variant: {
  primary: 'bg-primary-500 text-white hover:bg-primary-600 shadow-sm dark:bg-primary-600 dark:hover:bg-primary-500',
        secondary: 'bg-neutral-100 text-neutral-900 hover:bg-neutral-200 border border-neutral-300 dark:bg-neutral-800 dark:text-neutral-100 dark:hover:bg-neutral-700 dark:border-neutral-700',
        ghost: 'text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800 dark:hover:text-neutral-50',
        outline: 'border border-primary-300 text-primary-700 hover:bg-primary-50 hover:border-primary-400 dark:border-primary-700 dark:text-primary-300 dark:hover:bg-neutral-800',
        destructive: 'bg-error-600 text-white hover:bg-error-700 shadow-sm dark:bg-error-500 dark:hover:bg-error-400',
        link: 'text-primary-600 underline-offset-4 hover:underline hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300',
      },
      size: {
        sm: 'h-11 px-3 text-xs rounded-md',
        md: 'h-12 px-4 py-2',
        lg: 'h-14 px-6 text-base',
        xl: 'h-16 px-8 text-lg',
        icon: 'h-12 w-12',
      },
      fullWidth: {
        true: 'w-full',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant, 
    size, 
    fullWidth, 
    loading = false, 
    leftIcon, 
    rightIcon, 
    children, 
    disabled,
    asChild,
    ...props 
  }, ref) => {
    const isDisabled = disabled || loading
    const Comp: any = asChild ? Slot : 'button'

    const handleClick: React.MouseEventHandler<HTMLElement> = (e) => {
      if (isDisabled) {
        e.preventDefault()
        e.stopPropagation()
        return
      }
      props.onClick?.(e as any)
    }

    if (process.env.NODE_ENV !== 'production' && asChild) {
      if (!React.isValidElement(children)) {
        // eslint-disable-next-line no-console
        console.warn('Button(asChild): children must be a single React element. Received:', children)
      } else if (React.Children.count(children) !== 1) {
        // eslint-disable-next-line no-console
        console.warn('Button(asChild): expected exactly 1 child element, but received multiple.')
      }
    }

    if (asChild) {
      // Radix Slot requires exactly one React element child
      return (
        <Comp
          className={cn(buttonVariants({ variant, size, fullWidth, className }))}
          ref={ref}
          aria-disabled={isDisabled}
          aria-busy={loading}
          data-loading={loading ? '' : undefined}
          onClick={handleClick}
          tabIndex={isDisabled ? -1 : props.tabIndex}
          {...props}
        >
          {children as React.ReactElement}
        </Comp>
      )
    }

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, fullWidth, className }))}
        ref={ref}
        disabled={isDisabled}
        aria-disabled={isDisabled}
        aria-busy={loading}
        data-loading={loading ? '' : undefined}
        onClick={handleClick as any}
        {...props}
      >
        <span className="relative inline-flex items-center gap-x-2">
          {loading && (
            <Loader2
              size={16}
              strokeWidth={2}
              className="absolute left-1/2 -translate-x-1/2 animate-spin"
              aria-hidden="true"
            />
          )}
          {leftIcon && (
            <span className={cn('flex-shrink-0', loading && 'opacity-0')} aria-hidden="true">
              {leftIcon}
            </span>
          )}
          <span className={cn('truncate', loading && 'opacity-0')}>{children}</span>
          {rightIcon && (
            <span className={cn('flex-shrink-0', loading && 'opacity-0')} aria-hidden="true">
              {rightIcon}
            </span>
          )}
        </span>
      </Comp>
    )
  }
)

Button.displayName = 'Button'

export { Button, buttonVariants }