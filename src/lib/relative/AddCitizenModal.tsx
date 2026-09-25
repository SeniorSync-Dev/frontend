import { useState, type ReactNode } from 'react'
import { AlertDialog, Button, InputOTP, REGEXP_ONLY_DIGITS_AND_CHARS } from '@heroui/react'
import { Plus } from 'lucide-react'
import { useInviteCodePreview, useRedeemInviteCode } from './api'

const relationshipOptions = ['Datter / søn', 'Ægtefælle', 'Svigerbarn', 'Anden']

const defaultTrigger = (open: () => void) => (
  <Button variant="primary" onPress={open}>
    <Plus className="size-4" aria-hidden />
    Tilføj borger
  </Button>
)

export function AddCitizenModal({ trigger = defaultTrigger }: { trigger?: (open: () => void) => ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [code, setCode] = useState('')
  const [relationshipType, setRelationshipType] = useState(relationshipOptions[0])

  const preview = useInviteCodePreview(code.length === 6 ? code.toUpperCase() : '')
  const redeemMutation = useRedeemInviteCode()

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    await redeemMutation.mutateAsync({ code: code.toUpperCase(), relationshipType })
    setIsOpen(false)
    setCode('')
    setRelationshipType(relationshipOptions[0])
  }

  return (
    <AlertDialog isOpen={isOpen} onOpenChange={setIsOpen}>
      {trigger(() => setIsOpen(true))}

      <AlertDialog.Backdrop isDismissable isKeyboardDismissDisabled={false}>
        <AlertDialog.Container>
          <AlertDialog.Dialog className="gap-4">
            <AlertDialog.Header>
              <AlertDialog.Heading className="text-xl font-bold">Tilføj borger</AlertDialog.Heading>
            </AlertDialog.Header>

            <AlertDialog.Body>
              <p className="mb-4 text-sm text-muted">
                Indtast den invitationskode du har fået fra plejecentret eller fra borgeren.
              </p>

              <form id="add-citizen-form" onSubmit={submit} className="flex flex-col gap-5">
                <div className="flex flex-col items-center gap-1.5">
                  <span className="self-start text-sm font-medium">Invitationskode</span>
                  <InputOTP
                    className="w-fit"
                    maxLength={6}
                    pattern={REGEXP_ONLY_DIGITS_AND_CHARS}
                    value={code}
                    onChange={(value) => setCode(value.toUpperCase())}
                  >
                    <InputOTP.Group>
                      <InputOTP.Slot index={0} />
                      <InputOTP.Slot index={1} />
                      <InputOTP.Slot index={2} />
                    </InputOTP.Group>
                    <InputOTP.Separator />
                    <InputOTP.Group>
                      <InputOTP.Slot index={3} />
                      <InputOTP.Slot index={4} />
                      <InputOTP.Slot index={5} />
                    </InputOTP.Group>
                  </InputOTP>
                  <span className="text-xs text-muted">Koden er gyldig i 7 dage.</span>
                </div>

                <label className="flex flex-col gap-1.5">
                  <span className="text-sm font-medium">Din relation til borgeren</span>
                  <select
                    value={relationshipType}
                    onChange={(e) => setRelationshipType(e.target.value)}
                    className="rounded-md border border-border bg-background px-3 py-2 text-sm"
                  >
                    {relationshipOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>

                {preview.data && (
                  <div className="rounded-md border border-border p-3">
                    <p className="text-xs font-bold tracking-wide text-muted uppercase">Koden hører til</p>
                    <p className="mt-1 text-base font-semibold">{preview.data.name}</p>
                    <p className="text-sm text-muted">
                      {preview.data.age !== undefined ? `${preview.data.age} år · ` : ''}
                      {preview.data.facilityName}
                    </p>
                  </div>
                )}

                {code.length === 6 && preview.error && <p className="text-sm text-danger">{preview.error.message}</p>}
                {redeemMutation.error && <p className="text-sm text-danger">{redeemMutation.error.message}</p>}

                <p className="text-sm text-muted">
                  {preview.data?.name ?? 'Borgeren'} eller plejecentret skal godkende din anmodning, før du får
                  adgang. Du ser kun kalender og aktiviteter.
                </p>
              </form>
            </AlertDialog.Body>

            <AlertDialog.Footer>
              <Button slot="close" variant="outline">
                Annuller
              </Button>
              <Button
                type="submit"
                form="add-citizen-form"
                variant="primary"
                isDisabled={code.length !== 6 || !preview.data}
                isPending={redeemMutation.isPending}
              >
                Send anmodning
              </Button>
            </AlertDialog.Footer>
          </AlertDialog.Dialog>
        </AlertDialog.Container>
      </AlertDialog.Backdrop>
    </AlertDialog>
  )
}
