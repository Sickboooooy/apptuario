import { Button as ButtonPrimitive } from '@base-ui/react/button';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-xl border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 cursor-pointer",
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm',
        outline:
          'border-border/80 bg-white/60 text-foreground backdrop-blur-md hover:bg-white/90 hover:border-white hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:border-white/15 dark:bg-white/10 dark:hover:bg-white/20',
        secondary:
          'bg-secondary/80 text-secondary-foreground backdrop-blur-md hover:bg-secondary aria-expanded:bg-secondary aria-expanded:text-secondary-foreground',
        ghost:
          'hover:bg-black/5 hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:hover:bg-white/10',
        destructive:
          'bg-destructive/10 text-destructive hover:bg-destructive/20 focus-visible:border-destructive/40 focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:hover:bg-destructive/30 dark:focus-visible:ring-destructive/40',
        link: 'text-primary underline-offset-4 hover:underline',
        glass:
          'border-white/70 bg-white/70 text-foreground backdrop-blur-md hover:bg-white/90 hover:border-white hover:shadow-md shadow-xs dark:border-white/15 dark:bg-white/10 dark:text-white dark:hover:bg-white/20',
        'glass-primary':
          'border-white/25 bg-primary/92 text-primary-foreground backdrop-blur-md hover:bg-primary shadow-[0_8px_20px_rgba(30,58,138,0.25)] hover:shadow-[0_12px_24px_rgba(30,58,138,0.35)]',
        'glass-accent':
          'border-white/25 bg-accent-foreground/92 text-white backdrop-blur-md hover:bg-accent-foreground shadow-[0_8px_20px_rgba(180,83,9,0.25)] hover:shadow-[0_12px_24px_rgba(180,83,9,0.35)]',
      },
      size: {
        default:
          'h-9 gap-1.5 px-3 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2',
        xs: "h-6 gap-1 rounded-lg px-2 text-xs in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 gap-1.5 rounded-lg px-2.5 text-[0.82rem] in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3.5",
        lg: 'h-11 gap-2 px-4 text-sm font-semibold rounded-xl has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3',
        icon: 'size-9 rounded-xl',
        'icon-xs':
          "size-6 rounded-lg in-data-[slot=button-group]:rounded-lg [&_svg:not([class*='size-'])]:size-3",
        'icon-sm':
          'size-8 rounded-lg in-data-[slot=button-group]:rounded-lg',
        'icon-lg': 'size-10 rounded-full',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

function Button({
  className,
  variant = 'default',
  size = 'default',
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
