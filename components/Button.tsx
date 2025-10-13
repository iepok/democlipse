import {ButtonHTMLAttributes} from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary'
}

export default function Button({variant = 'primary', className = '', ...props}: ButtonProps) {
    const baseStyles = 'px-6 py-2 rounded font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed'

    const variants = {
        primary: 'bg-black text-white hover:bg-gray-800',
        secondary: 'border border-black bg-white hover:bg-gray-100'
    }

    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${className}`}
            {...props}
        />
    )
}