import type { Appointment, AppointmentType } from "#/models/appointment"

export function nextAppointment(appointments: Appointment[], now = new Date()) {
  return appointments.find((appointment) => (appointment.end ?? appointment.start) >= now) ?? null
}

export const appointmentTypeLabel: Record<AppointmentType, string> = {
  screen_visit: 'Skærmbesøg',
  home_visit: 'Hjemme hos dig',
  activity: 'Tilmeldt',
}

export function nextAppointmentHeading(appointment: Appointment, dayText: string) {
  const name: Record<AppointmentType, string> = {
    screen_visit: 'Skærmbesøg',
    home_visit: 'Besøg',
    activity: appointment.title,
  }
  return `${name[appointment.type]} ${dayText}`
}
