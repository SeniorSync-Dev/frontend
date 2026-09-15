import type { Activity, Appointment, AppointmentType } from './types'

export function upcomingAppointments(appointments: Appointment[], now = new Date()) {
  return appointments
    .filter((appointment) => (appointment.end ?? appointment.start).getTime() >= now.getTime())
    .sort((a, b) => a.start.getTime() - b.start.getTime())
}

export function nextAppointment(appointments: Appointment[], now = new Date()) {
  return upcomingAppointments(appointments, now)[0] ?? null
}

export function upcomingActivities(activities: Activity[], now = new Date()) {
  return activities
    .filter((activity) => (activity.end ?? activity.start).getTime() >= now.getTime())
    .sort((a, b) => a.start.getTime() - b.start.getTime())
}

export const appointmentTypeLabel: Record<AppointmentType, string> = {
  screen_visit: 'Skærmbesøg',
  home_visit: 'Hjemme hos dig',
  activity: 'Tilmeldt',
}

export function nextAppointmentHeading(appointment: Appointment, dayText: string, timeText: string) {
  const name: Record<AppointmentType, string> = {
    screen_visit: 'Skærmbesøg',
    home_visit: 'Besøg',
    activity: appointment.title,
  }
  return `${name[appointment.type]} ${dayText} kl. ${timeText}`
}
