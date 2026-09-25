import { useState, type ReactNode } from 'react'
import { AlertDialog, Button } from '@heroui/react'
import { Plus } from 'lucide-react'
import { useScheduleVisit, useUpdateVisit } from './api'
import type { Appointment } from '#/models/appointment'

function toDatetimeLocalValue(date: Date) {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

const defaultTrigger = (open: () => void) => (
  <Button variant="outline" size="sm" onPress={open}>
    <Plus className="size-4" aria-hidden />
    Tilføj besøg
  </Button>
)

export function VisitModal({
  citizenId,
  visit,
  trigger = defaultTrigger,
}: {
  citizenId: string
  visit?: Appointment
  trigger?: (open: () => void) => ReactNode
}) {
  const isEditing = !!visit
  const [isOpen, setIsOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [start, setStart] = useState('')
  const [end, setEnd] = useState('')
  const [note, setNote] = useState('')

  const scheduleMutation = useScheduleVisit(citizenId)
  const updateMutation = useUpdateVisit(citizenId)
  const mutation = isEditing ? updateMutation : scheduleMutation

  function open() {
    setTitle(visit?.title ?? '')
    setStart(visit ? toDatetimeLocalValue(visit.start) : '')
    setEnd(visit?.end ? toDatetimeLocalValue(visit.end) : '')
    setNote(visit?.description ?? '')
    setIsOpen(true)
  }

  const hasInvalidRange = !!start && !!end && new Date(end) < new Date(start)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (hasInvalidRange) return
    const input = {
      title: title || undefined,
      start: new Date(start).toISOString(),
      end: new Date(end).toISOString(),
      description: note || undefined,
    }
    if (isEditing) {
      await updateMutation.mutateAsync({ visitId: visit.id, ...input })
    } else {
      await scheduleMutation.mutateAsync(input)
    }
    setIsOpen(false)
  }

  return (
    <AlertDialog isOpen={isOpen} onOpenChange={setIsOpen}>
      {trigger(open)}

      <AlertDialog.Backdrop isDismissable isKeyboardDismissDisabled={false}>
        <AlertDialog.Container>
          <AlertDialog.Dialog className="gap-4">
            <AlertDialog.Header>
              <AlertDialog.Heading className="text-xl font-bold">
                {isEditing ? 'Rediger besøg' : 'Meld et besøg'}
              </AlertDialog.Heading>
            </AlertDialog.Header>

            <AlertDialog.Body>
              <form id="visit-form" onSubmit={submit} className="flex flex-col gap-3">
                <label className="flex flex-col gap-1">
                  <span className="text-xs font-medium text-muted">Titel (valgfri)</span>
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Besøg"
                    className="rounded-md border border-border bg-background px-3 py-2 text-sm"
                  />
                </label>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <label className="flex flex-col gap-1">
                    <span className="text-xs font-medium text-muted">Starttidspunkt</span>
                    <input
                      required
                      type="datetime-local"
                      value={start}
                      onChange={(e) => setStart(e.target.value)}
                      className="rounded-md border border-border bg-background px-3 py-2 text-sm"
                    />
                  </label>
                  <label className="flex flex-col gap-1">
                    <span className="text-xs font-medium text-muted">Sluttidspunkt</span>
                    <input
                      required
                      type="datetime-local"
                      value={end}
                      min={start || undefined}
                      onChange={(e) => setEnd(e.target.value)}
                      className="rounded-md border border-border bg-background px-3 py-2 text-sm"
                    />
                    {hasInvalidRange && (
                      <span className="text-xs text-danger">
                        Sluttidspunktet kan ikke være før starttidspunktet.
                      </span>
                    )}
                  </label>
                </div>

                <label className="flex flex-col gap-1">
                  <span className="text-xs font-medium text-muted">Note (valgfri)</span>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    rows={2}
                    className="rounded-md border border-border bg-background px-3 py-2 text-sm"
                  />
                </label>

                {mutation.error && <p className="text-sm text-danger">{mutation.error.message}</p>}
              </form>
            </AlertDialog.Body>

            <AlertDialog.Footer>
              <Button slot="close" variant="outline">
                Annuller
              </Button>
              <Button
                type="submit"
                form="visit-form"
                variant="primary"
                isDisabled={hasInvalidRange}
                isPending={mutation.isPending}
              >
                Gem
              </Button>
            </AlertDialog.Footer>
          </AlertDialog.Dialog>
        </AlertDialog.Container>
      </AlertDialog.Backdrop>
    </AlertDialog>
  )
}
