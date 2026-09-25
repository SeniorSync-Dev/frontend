import { useQuery } from '@tanstack/react-query'
import { apiRequest } from '../api'

export type ScreenVisitRole = 'citizen' | 'employee' | 'relative'

type JoinResponse = {
  token: string
  role: ScreenVisitRole
}

export function useJoinScreenVisit(appointmentId: string) {
  return useQuery({
    queryKey: ['screen-visit', appointmentId],
    queryFn: () =>
      apiRequest<JoinResponse>(`/screen-visits/${appointmentId}/join`, { method: 'POST' }),
    retry: false,
    refetchOnWindowFocus: false,
  })
}
