export type AppointmentType = 'screen_visit' | 'home_visit' | 'activity'

export interface Appointment {
  id: string
  type: AppointmentType
  title: string
  description?: string
  start: Date
  end?: Date
  location?: string
  staffName?: string
}

export interface Activity {
  id: string
  title: string
  start: Date
  end?: Date
  location?: string
  meetingPoint?: string
  availableSpots?: number
  isSignedUp: boolean
}

export type SenderType = 'care_home' | 'relative'

export interface Message {
  id: string
  senderName: string
  senderType: SenderType
  senderRelation?: string
  sentAt: Date
  text: string
  isRead: boolean
}

export interface CareHome {
  id: string
  name: string
}
