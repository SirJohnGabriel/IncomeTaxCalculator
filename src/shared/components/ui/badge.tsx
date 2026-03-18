import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/shared/lib/utils';

const badgeVariants = cva(
    'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors',
    {
        variants: {
            variant: {
                default: 'border-transparent bg-dash-green text-card',
                secondary: 'border-transparent bg-white/10 text-white/70',
                outline: 'border-white/20 text-white/70',
                muted: 'border-transparent bg-white/8 text-white/50',
            },
        },
        defaultVariants: {
            variant: 'default',
        },
    }
);

type BadgeProps = React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof badgeVariants>;

function Badge({ className, variant, ...props }: BadgeProps) {
    return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge };
