import { useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Alert, Button, Card, Input, Spinner } from '@heroui/react'
import { authClient } from '../../lib/auth-client'
import { useFacilities } from '../../lib/admin/facilities'
import {
  useCancelInvitation,
  useInvitations,
  useInviteMember,
  useMembers,
  useUpdateMemberRole,
} from '../../lib/admin/organization'
import { orgRoleLabels } from '../../models/organization'
import type { OrgRole } from '../../models/organization'
import type { Facility } from '../../models/facility'

export const Route = createFileRoute('/admin/dashboard')({
  component: RouteComponent,
})

function RoleSelect({ value, onChange }: { value: string; onChange: (role: OrgRole) => void }) {
  return (
    <select
      className="rounded-md border border-border bg-background px-3 py-1.5 text-sm"
      value={value}
      onChange={(e) => onChange(e.target.value as OrgRole)}
    >
      {Object.entries(orgRoleLabels).map(([role, label]) => (
        <option key={role} value={role}>
          {label}
        </option>
      ))}
    </select>
  )
}

function FacilitySelect({
  facilities,
  value,
  onChange,
}: {
  facilities: Array<Facility>
  value: string
  onChange: (facilityId: string) => void
}) {
  return (
    <select
      required
      className="rounded-md border border-border bg-background px-3 py-1.5 text-sm"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      <option value="" disabled>
        Vælg facilitet
      </option>
      {facilities.map((facility) => (
        <option key={facility.id} value={facility.id}>
          {facility.name}
        </option>
      ))}
    </select>
  )
}

function RouteComponent() {
  const navigate = useNavigate()
  const { data: session, isPending: isSessionPending, refetch: refetchSession } = authClient.useSession()
  const { data: organizations, refetch: refetchOrganizations } = authClient.useListOrganizations()
  const organization =
    organizations?.find((org) => org.id === session?.session.activeOrganizationId) ?? organizations?.[0]

  const { data: members = [], isError: membersError } = useMembers(organization?.id)
  const { data: invitations = [], isError: invitationsError } = useInvitations(organization?.id)
  const { data: facilities = [], isError: facilitiesError } = useFacilities()
  const inviteMember = useInviteMember(organization?.id)
  const updateMemberRole = useUpdateMemberRole(organization?.id)
  const cancelInvitation = useCancelInvitation(organization?.id)

  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<OrgRole>('citizen')
  const [inviteFacilityId, setInviteFacilityId] = useState('')
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const error =
    membersError || invitationsError || facilitiesError
      ? 'Kunne ikke hente organisationsdata.'
      : (inviteMember.error?.message ??
        updateMemberRole.error?.message ??
        cancelInvitation.error?.message ??
        null)

  function handleInvite(e: React.FormEvent) {
    e.preventDefault()
    if (!organization || !inviteEmail) return
    if (inviteRole === 'citizen' && !inviteFacilityId) return

    inviteMember.mutate(
      { email: inviteEmail, role: inviteRole, facilityId: inviteRole === 'citizen' ? inviteFacilityId : undefined },
      {
        onSuccess: () => {
          setInviteEmail('')
          setInviteFacilityId('')
        },
      },
    )
  }

  async function copyInvitationLink(invitationId: string) {
    await navigator.clipboard.writeText(`${window.location.origin}/auth/accept-invitation/${invitationId}`)
    setCopiedId(invitationId)
  }

  if (isSessionPending) {
    return (
      <div className="flex flex-1 items-center justify-center py-24">
        <Spinner size="lg" color="accent" aria-label="Henter…" />
      </div>
    )
  }

  if (!session) {
    return (
      <div className="flex flex-1 items-center justify-center px-4 py-16">
        <Card className="w-full max-w-md">
          <Card.Header className="items-center text-center">
            <Card.Title>Du er ikke logget ind</Card.Title>
            <Card.Description>Log ind som medarbejder for at administrere organisationen.</Card.Description>
          </Card.Header>
          <Card.Footer className="justify-center">
            <Button variant="primary" onPress={() => navigate({ to: '/admin/signin' })}>
              Log ind
            </Button>
          </Card.Footer>
        </Card>
      </div>
    )
  }

  if (!organization) {
    return (
      <div className="flex flex-1 items-center justify-center px-4 py-16">
        <Card className="w-full max-w-md">
          <Card.Header className="items-center text-center">
            <Card.Title>Ingen organisation fundet</Card.Title>
            <Card.Description>Opret organisationen for at komme i gang.</Card.Description>
          </Card.Header>
          <Card.Footer className="justify-center">
            <Button
              variant="primary"
              onPress={() =>
                authClient.organization
                  .create({ name: 'SeniorSync', slug: 'seniorsync' })
                  .then(() => refetchOrganizations())
              }
            >
              Opret organisation
            </Button>
          </Card.Footer>
        </Card>
      </div>
    )
  }

  const pendingInvitations = invitations.filter((invitation) => invitation.status === 'pending')

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-4 py-12 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="text-2xl font-semibold">{organization.name}</h1>
        {organizations && organizations.length > 1 && (
          <select
            aria-label="Organisation"
            className="rounded-md border border-border bg-background px-3 py-2 text-sm"
            value={organization.id}
            onChange={async (e) => {
              const selectedOrg = organizations.find((org) => org.id === e.target.value)
              if (!selectedOrg) return

              await authClient.organization.setActive({
                organizationId: selectedOrg.id,
                organizationSlug: selectedOrg.slug,
              })
              await refetchSession()
            }}
          >
            {organizations.map((org) => (
              <option key={org.id} value={org.id}>
                {org.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {error && (
        <Alert status="danger">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Title>Der opstod en fejl</Alert.Title>
            <Alert.Description>{error}</Alert.Description>
          </Alert.Content>
        </Alert>
      )}

      <Card>
        <Card.Header>
          <Card.Title>Medlemmer</Card.Title>
        </Card.Header>
        <Card.Content className="flex flex-col gap-3">
          {members.length === 0 ? (
            <p className="text-sm text-muted">Ingen medlemmer endnu.</p>
          ) : (
            members.map((member) => (
              <div
                key={member.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border px-4 py-3"
              >
                <div>
                  <p className="text-sm font-medium">{member.user.name}</p>
                  <p className="text-sm text-muted">{member.user.email}</p>
                </div>
                <RoleSelect
                  value={member.role}
                  onChange={(role) => updateMemberRole.mutate({ memberId: member.id, role })}
                />
              </div>
            ))
          )}
        </Card.Content>
      </Card>

      <Card>
        <Card.Header>
          <Card.Title>Inviter nyt medlem</Card.Title>
          <Card.Description>Der sendes ingen e-mail - kopiér linket herunder og del det selv.</Card.Description>
        </Card.Header>
        <Card.Content>
          <form onSubmit={handleInvite} className="flex flex-wrap items-end gap-3">
            <Input
              type="email"
              required
              placeholder="navn@eksempel.dk"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              className="min-w-[220px] flex-1"
            />
            <RoleSelect value={inviteRole} onChange={setInviteRole} />
            {inviteRole === 'citizen' && (
              <FacilitySelect facilities={facilities} value={inviteFacilityId} onChange={setInviteFacilityId} />
            )}
            <Button type="submit" variant="primary">
              Opret invitation
            </Button>
          </form>
        </Card.Content>
      </Card>

      <Card>
        <Card.Header>
          <Card.Title>Afventende invitationer</Card.Title>
        </Card.Header>
        <Card.Content className="flex flex-col gap-3">
          {pendingInvitations.length === 0 ? (
            <p className="text-sm text-muted">Ingen afventende invitationer.</p>
          ) : (
            pendingInvitations.map((invitation) => (
              <div
                key={invitation.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border px-4 py-3"
              >
                <div>
                  <p className="text-sm font-medium">{invitation.email}</p>
                  <p className="text-sm text-muted">
                    {orgRoleLabels[invitation.role as OrgRole] ?? invitation.role}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="secondary" size="sm" onPress={() => copyInvitationLink(invitation.id)}>
                    {copiedId === invitation.id ? 'Kopieret!' : 'Kopiér link'}
                  </Button>
                  <Button variant="danger-soft" size="sm" onPress={() => cancelInvitation.mutate(invitation.id)}>
                    Annullér
                  </Button>
                </div>
              </div>
            ))
          )}
        </Card.Content>
      </Card>
    </div>
  )
}