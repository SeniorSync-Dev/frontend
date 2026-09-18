import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiRequest, POLL_INTERVAL_MS } from '../api'
import type { Appointment } from '#/models/appointment'
import type { Activity } from '#/models/activity'

// The backend sends dates as ISO strings (JSON has no Date type) so these Model types are raw strings before we parse start/end into Dates
type AppointmentViewModel = Omit<Appointment, 'start' | 'end'> & { start: string; end?: string }
type ActivityViewModel = Omit<Activity, 'start' | 'end'> & { start: string; end?: string }

function parseAppointment(dto: AppointmentViewModel): Appointment {
  return { ...dto, start: new Date(dto.start), end: dto.end ? new Date(dto.end) : undefined }
}

function parseActivity(dto: ActivityViewModel): Activity {
  return { ...dto, start: new Date(dto.start), end: dto.end ? new Date(dto.end) : undefined }
}

async function fetchAppointments(): Promise<Appointment[]> {
  const dtos = await apiRequest<AppointmentViewModel[]>('/citizen/appointments')
  return dtos.map(parseAppointment)
}

async function fetchActivities(): Promise<Activity[]> {
  const dtos = await apiRequest<ActivityViewModel[]>('/citizen/activities')
  return dtos.map(parseActivity)
}

export function useAppointments() {
  return useQuery({
    queryKey: ['citizen', 'appointments'],
    queryFn: fetchAppointments,
    refetchInterval: POLL_INTERVAL_MS,
  })
}

export function useActivities() {
  return useQuery({
    queryKey: ['citizen', 'activities'],
    queryFn: fetchActivities,
    refetchInterval: POLL_INTERVAL_MS,
  })
}

export function useSignUpForActivity() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (activityId: string) =>
      apiRequest<ActivityViewModel>(`/citizen/activities/${activityId}/signup`, { method: 'POST' }).then(parseActivity),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['citizen', 'activities'] })
      queryClient.invalidateQueries({ queryKey: ['citizen', 'appointments'] })
    },
  })
}

export function useCancelActivitySignup() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (activityId: string) =>
      apiRequest<ActivityViewModel>(`/citizen/activities/${activityId}/signup`, { method: 'DELETE' }).then(parseActivity),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['citizen', 'activities'] })
      queryClient.invalidateQueries({ queryKey: ['citizen', 'appointments'] })
    },
  })
}
