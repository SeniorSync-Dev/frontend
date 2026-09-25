import { useState } from 'react'
import { AlertDialog, Button } from '@heroui/react'
import { useNavigate } from '@tanstack/react-router'
import { UserMinus } from 'lucide-react'
import { useRemoveCitizenLink } from './api'

export function RemoveCitizenModal({
  citizenId,
  citizenName,
}: {
  citizenId: string
  citizenName: string
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
      <button
        onClick={() => setIsOpen(true)}
        title="Fjern min adgang"
        aria-label={`Fjern min adgang til ${citizenName}`}
        className="flex size-9 flex-none items-center justify-center rounded-md text-muted hover:bg-surface-hover hover:text-danger"
      >
        <UserMinus className="size-4" aria-hidden />
      </button>

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
