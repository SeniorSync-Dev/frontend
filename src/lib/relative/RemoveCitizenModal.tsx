import { useState, type ReactNode } from 'react'
import { AlertDialog, Button } from '@heroui/react'
import { useNavigate } from '@tanstack/react-router'
import { UserMinus } from 'lucide-react'
import { useRemoveCitizenLink } from './api'

const defaultTrigger = (open: () => void) => (
  <Button variant="ghost" size="sm" className="self-start text-danger" onPress={open}>
    <UserMinus className="size-4" aria-hidden />
    Fjern min adgang
  </Button>
)

export function RemoveCitizenModal({
  citizenId,
  citizenName,
  trigger = defaultTrigger,
}: {
  citizenId: string
  citizenName: string
  trigger?: (open: () => void) => ReactNode
}) {
  const [isOpen, setIsOpen] = useState(false)
  const navigate = useNavigate()
  const mutation = useRemoveCitizenLink(citizenId)

  async function remove() {
    await mutation.mutateAsync()
    setIsOpen(false)
    navigate({ to: '/relative' })
  }

  return (
    <AlertDialog isOpen={isOpen} onOpenChange={setIsOpen}>
      {trigger(() => setIsOpen(true))}

      <AlertDialog.Backdrop isDismissable isKeyboardDismissDisabled={false}>
        <AlertDialog.Container>
          <AlertDialog.Dialog className="gap-4">
            <AlertDialog.Header>
              <AlertDialog.Heading className="text-xl font-bold">
                Fjern din adgang til {citizenName}?
              </AlertDialog.Heading>
            </AlertDialog.Header>

            <AlertDialog.Body>
              <p className="text-sm text-muted">
                Du kan derefter ikke se {citizenName}s kalender eller tilmelde til aktiviteter. De
                besøg du har oprettet bliver stående. Vil du have adgang igen, skal du bruge en ny
                invitationskode.
              </p>
              {mutation.error && <p className="mt-3 text-sm text-danger">{mutation.error.message}</p>}
            </AlertDialog.Body>

            <AlertDialog.Footer>
              <Button slot="close" variant="outline">
                Annuller
              </Button>
              <Button variant="danger" isPending={mutation.isPending} onPress={remove}>
                Fjern adgang
              </Button>
            </AlertDialog.Footer>
          </AlertDialog.Dialog>
        </AlertDialog.Container>
      </AlertDialog.Backdrop>
    </AlertDialog>
  )
}
