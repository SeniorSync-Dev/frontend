import { apiRequest } from '../api'
import type { Activity, Appointment } from './types'

type Wire<T> = {
  [K in keyof T]: T[K] extends Date ? string : T[K] extends Date | undefined ? string | undefined : T[K]
}

function parseAppointment(dto: Wire<Appointment>): Appointment {
  return { ...dto, start: new Date(dto.start), end: dto.end ? new Date(dto.end) : undefined }
}

function parseActivity(dto: Wire<Activity>): Activity {
  return { ...dto, start: new Date(dto.start), end: dto.end ? new Date(dto.end) : undefined }
}

export async function fetchAppointments(): Promise<Appointment[]> {
  const dtos = await apiRequest<Wire<Appointment>[]>('/api/citizen/appointments')
  return dtos.map(parseAppointment)
}

export async function fetchActivities(): Promise<Activity[]> {
  const dtos = await apiRequest<Wire<Activity>[]>('/api/citizen/activities')
  return dtos.map(parseActivity)
}

export async function signUpForActivity(activityId: string): Promise<Activity> {
  return parseActivity(
    await apiRequest<Wire<Activity>>(`/api/citizen/activities/${activityId}/signup`, { method: 'POST' }),
  )
}

export async function cancelActivitySignup(activityId: string): Promise<Activity> {
  return parseActivity(
    await apiRequest<Wire<Activity>>(`/api/citizen/activities/${activityId}/signup`, { method: 'DELETE' }),
  )
}
