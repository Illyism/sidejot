import { cn } from '@/lib/utils'
import { type VariantProps, cva } from 'class-variance-authority'
import * as React from 'react'

const cardVariants = cva(
  'rounded-2xl transition-all p-4', // Base styles including default padding
  {
    variants: {
      variant: {
        default: 'bg-card text-card-foreground shadow-sm border',
        primary: 'bg-primary text-primary-foreground shadow-md border-0',
        glass:
          'bg-background/50 backdrop-blur-sm border-0 shadow-sm hover:shadow-md',
        outline: 'border bg-transparent',
        ghost: 'border-0 bg-transparent',
        surface: 'bg-white dark:bg-gray-900 shadow-sm border-0', // Like in the design
      },
      size: {
        default: 'p-4',
        sm: 'p-3',
        lg: 'p-6',
        xl: 'p-8',
      },
      hover: {
        default: '',
        lift: 'hover:translate-y-[-2px] hover:shadow-md',
        glow: 'hover:shadow-lg hover:shadow-primary/25',
        none: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      hover: 'default',
    },
  },
)

export interface CardProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  asChild?: boolean
}

/**
 *
 * Example usage:
 * <Card variant="glass" hover="lift">Content</Card>
 * <Card variant="primary" size="lg">Content</Card>
 */
const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, size, hover, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(cardVariants({ variant, size, hover, className }))}
        {...props}
      />
    )
  },
)
Card.displayName = 'Card'

export { Card, cardVariants }
