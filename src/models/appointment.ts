type AppointmentType = 'screen_visit' | 'home_visit' | 'activity'

interface Appointment {
  id: string
  type: AppointmentType
  title: string
  description?: string
  start: Date
  end?: Date
  location?: string
  staffName?: string
}

export type { AppointmentType, Appointment };