import { AlertDialog, Button, buttonVariants } from '@heroui/react'
import { Phone } from 'lucide-react'
import { useCitizen } from './CitizenContext'
import { largeButton } from './styles'

export function CallForHelpButton() {
  const { careHome } = useCitizen()

  return (
    <AlertDialog>
      <Button variant="danger" className={largeButton}>
        <Phone className="size-6" aria-hidden />
        Tilkald hjælp
      </Button>

      <AlertDialog.Backdrop className="theme-citizen">
        <AlertDialog.Container>
          <AlertDialog.Dialog className="gap-5 p-7">
            <AlertDialog.Header className="flex-row items-center gap-4">
              <AlertDialog.Icon status="danger" className="size-14">
                <Phone className="size-7" aria-hidden />
              </AlertDialog.Icon>
              <AlertDialog.Heading className="text-3xl font-bold">Tilkald hjælp</AlertDialog.Heading>
            </AlertDialog.Header>

            <AlertDialog.Body className="flex flex-col gap-5 text-xl leading-relaxed text-muted">
              <div>
              <p>
                <strong className="text-foreground">Er det akut og livstruende?</strong> 
              </p>
              <p>Ring 1-1-2 med det samme.</p>
              </div>
              <a
                href="tel:112"
                className={buttonVariants({
                  variant: 'danger',
                  size: 'lg',
                  className: `${largeButton} w-full no-underline hover:bg-danger-hover`,
                })}
              >
                <Phone className="size-6" aria-hidden />
                Ring 1-1-2
              </a>
              <p>
                {careHome
                  ? `Er det ikke akut, så kontakt dit plejehjem, ${careHome.name}.`
                  : 'Du er endnu ikke tilknyttet et plejehjem. Kommunen kontakter dig, så snart det er på plads.'}
              </p>
            </AlertDialog.Body>

            <AlertDialog.Footer>
              <Button slot="close" variant="outline" className={`${largeButton} w-full sm:w-auto`}>
                Luk
              </Button>
            </AlertDialog.Footer>
          </AlertDialog.Dialog>
        </AlertDialog.Container>
      </AlertDialog.Backdrop>
    </AlertDialog>
  )
}
