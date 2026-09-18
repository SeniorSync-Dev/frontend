import { Button as HeroButton, type ButtonProps } from '@heroui/react'

// HeroUI's own sizes top out at "lg" (44px / text-base), too small for the oversized touch
// targets this citizen-facing UI needs for elderly users. These extend it rather than replace it.
export type CitizenButtonSize = 'lg' | 'xl'

const sizeClass: Record<CitizenButtonSize, string> = {
  lg: 'h-14 min-h-14 gap-3 rounded-xl px-6 text-xl font-bold',
  xl: 'h-16 min-h-16 gap-3 rounded-xl px-8 text-2xl font-bold',
}

export function citizenButtonClass(size: CitizenButtonSize) {
  return sizeClass[size]
}

export function Button({
  size,
  className = '',
  ...props
}: Omit<ButtonProps, 'size'> & { size?: CitizenButtonSize }) {
  return <HeroButton className={size ? `${sizeClass[size]} ${className}` : className} {...props} />
}
