import * as React from 'react';
import { cn } from '@/shared/lib/utils';

type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, type, ...props }, ref) => {
        return (
            <input
                type={type}
                ref={ref}
                className={cn(
                    'flex h-10 w-full rounded-xl border bg-white/5 border-white/8 px-3 py-2 text-sm text-white',
                    'placeholder:text-white/20 outline-none',
                    'focus-visible:border-dash-green/50 focus-visible:ring-1 focus-visible:ring-dash-green/30',
                    'disabled:cursor-not-allowed disabled:opacity-50',
                    'transition-all',
                    className
                )}
                {...props}
            />
        );
    }
);
Input.displayName = 'Input';

export { Input };
