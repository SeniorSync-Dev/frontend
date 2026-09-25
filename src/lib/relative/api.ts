import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiRequest, POLL_INTERVAL_MS } from '../api'
import type { Appointment } from '#/models/appointment'
import type { Activity } from '#/models/activity'
import type { InviteCodePreview, LinkedCitizen } from '#/models/relative'

// The backend sends dates as ISO strings (JSON has no Date type) so these Dto types are raw strings before we parse dates
type LinkedCitizenDto = Omit<LinkedCitizen, 'nextAppointmentStart'> & { nextAppointmentStart?: string }
type AppointmentDto = Omit<Appointment, 'start' | 'end'> & { start: string; end?: string }
type ActivityDto = Omit<Activity, 'start' | 'end'> & { start: string; end?: string }

function parseLinkedCitizen(dto: LinkedCitizenDto): LinkedCitizen {
  return { ...dto, nextAppointmentStart: dto.nextAppointmentStart ? new Date(dto.nextAppointmentStart) : undefined }
}

function parseAppointment(dto: AppointmentDto): Appointment {
  return { ...dto, start: new Date(dto.start), end: dto.end ? new Date(dto.end) : undefined }
}

function parseActivity(dto: ActivityDto): Activity {
  return { ...dto, start: new Date(dto.start), end: dto.end ? new Date(dto.end) : undefined }
}

export function useLinkedCitizens() {
  return useQuery({
    queryKey: ['relative', 'citizens'],
    queryFn: async () => {
      const dtos = await apiRequest<LinkedCitizenDto[]>('/relative/citizens')
      return dtos.map(parseLinkedCitizen)
    },
    refetchInterval: POLL_INTERVAL_MS,
  })
}

export function useRemoveCitizenLink(citizenId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => apiRequest(`/relative/citizens/${citizenId}`, { method: 'DELETE' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['relative', 'citizens'] }),
  })
}

export function useCitizenAppointments(citizenId: string) {
  return useQuery({
    queryKey: ['relative', 'citizens', citizenId, 'appointments'],
    queryFn: async () => {
      const dtos = await apiRequest<AppointmentDto[]>(`/relative/citizens/${citizenId}/appointments`)
      return dtos.map(parseAppointment)
    },
    refetchInterval: POLL_INTERVAL_MS,
  })
}

export function useCitizenActivities(citizenId: string) {
  return useQuery({
    queryKey: ['relative', 'citizens', citizenId, 'activities'],
    queryFn: async () => {
      const dtos = await apiRequest<ActivityDto[]>(`/relative/citizens/${citizenId}/activities`)
      return dtos.map(parseActivity)
    },
    refetchInterval: POLL_INTERVAL_MS,
  })
}

export function useSignUpCitizenForActivity(citizenId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (activityId: string) =>
      apiRequest<ActivityDto>(`/relative/citizens/${citizenId}/activities/${activityId}/signup`, {
        method: 'POST',
      }).then(parseActivity),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['relative', 'citizens', citizenId, 'activities'] })
      queryClient.invalidateQueries({ queryKey: ['relative', 'citizens', citizenId, 'appointments'] })
    },
  })
}

export function useCancelCitizenActivitySignup(citizenId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (activityId: string) =>
      apiRequest<ActivityDto>(`/relative/citizens/${citizenId}/activities/${activityId}/signup`, {
        method: 'DELETE',
      }).then(parseActivity),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['relative', 'citizens', citizenId, 'activities'] })
      queryClient.invalidateQueries({ queryKey: ['relative', 'citizens', citizenId, 'appointments'] })
    },
  })
}

export function useScheduleVisit(citizenId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: { title?: string; start: string; end: string; description?: string }) =>
      apiRequest<AppointmentDto[]>(`/relative/citizens/${citizenId}/visits`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      }).then((dtos) => dtos.map(parseAppointment)),
    onSuccess: (appointments) => {
      queryClient.setQueryData(['relative', 'citizens', citizenId, 'appointments'], appointments)
    },
  })
}

export function useUpdateVisit(citizenId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      visitId,
      ...input
    }: {
      visitId: string
      title?: string
      start: string
      end: string
      description?: string
    }) =>
      apiRequest<AppointmentDto[]>(`/relative/citizens/${citizenId}/visits/${visitId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      }).then((dtos) => dtos.map(parseAppointment)),
    onSuccess: (appointments) => {
      queryClient.setQueryData(['relative', 'citizens', citizenId, 'appointments'], appointments)
    },
  })
}

export function useDeleteVisit(citizenId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (visitId: string) =>
      apiRequest<AppointmentDto[]>(`/relative/citizens/${citizenId}/visits/${visitId}`, {
        method: 'DELETE',
      }).then((dtos) => dtos.map(parseAppointment)),
    onSuccess: (appointments) => {
      queryClient.setQueryData(['relative', 'citizens', citizenId, 'appointments'], appointments)
    },
  })
}

export function useInviteCodePreview(code: string) {
  return useQuery({
    queryKey: ['relative', 'invitations', code],
    queryFn: () => apiRequest<InviteCodePreview>(`/relative/invitations/${code}`),
    enabled: code.length > 0,
    retry: false,
  })
}

export function useRedeemInviteCode() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: { code: string; relationshipType: string }) =>
      apiRequest('/relative/invitations/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['relative', 'citizens'] }),
  })
}
