interface DateBoxProps {
  label: string
  value: string
  color?: 'accent' | 'success'
}

export function DateBox({ label, value, color = 'accent' }: DateBoxProps) {
  const colors = color === 'success' ? 'bg-success-soft text-success' : 'bg-accent-soft text-accent'

  return (
    <div className={`flex size-21 flex-none flex-col items-center justify-center rounded-xl ${colors}`}>
      <span className="text-base font-bold uppercase">{label}</span>
      <span className="text-2xl font-extrabold text-foreground">{value}</span>
    </div>
  )
}
