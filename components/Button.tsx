import { ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'danger'
}

export default function Button({
   variant = 'primary',
   className = '',
   ...props
}: ButtonProps) {
    const baseStyles =
        'relative inline-flex items-center justify-center px-6 py-2.5 rounded-md font-semibold text-sm transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]'

    const variants = {
        primary:
            'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-sm hover:from-indigo-700 hover:to-purple-700 focus-visible:ring-indigo-500',
        secondary:
            'bg-gray-100 text-gray-900 hover:bg-gray-200 shadow-inner focus-visible:ring-gray-400',
        outline:
            'border border-gray-300 text-gray-800 hover:bg-gray-50 focus-visible:ring-gray-300',
        danger:
            'bg-gradient-to-r from-rose-600 to-red-600 text-white hover:from-rose-700 hover:to-red-700 focus-visible:ring-rose-500',
    }

    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${className}`}
            {...props}
        />
    )
}
