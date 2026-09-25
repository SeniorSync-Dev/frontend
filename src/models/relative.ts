export type RelativeLinkStatus = 'pending' | 'approved' | 'rejected'

export interface LinkedCitizen {
  citizenUserId: string
  name: string
  relationshipType: string
  status: RelativeLinkStatus
  age?: number
  facilityName?: string
  nextAppointmentTitle?: string
  nextAppointmentStart?: Date
}

export interface LinkedRelative {
  relativeUserId: string
  name: string
  relationshipType: string
  status: RelativeLinkStatus
}

export interface InviteCode {
  code: string
  expiresAt: Date
}

export interface InviteCodePreview {
  name?: string
  age?: number
  facilityName?: string
}
