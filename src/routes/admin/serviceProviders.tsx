import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Alert, Button, Card, Input } from '@heroui/react'
import {
  useCreateServiceProviderCompany,
  useRemoveServiceProviderStaff,
  useServiceProviderCompanies,
  useServiceProviderStaff,
  useUpdateServiceProviderStaff,
} from '../../lib/admin/serviceProviders'
import { authClient } from '../../lib/auth-client'
import { serviceProviderCategoryLabels } from '../../models/service-provider'
import type { ServiceProviderCategory, ServiceProviderCompany } from '../../models/service-provider'

export const Route = createFileRoute('/admin/serviceProviders')({
  component: RouteComponent,
})

function CategorySelect({
  value,
  onChange,
}: {
  value: ServiceProviderCategory
  onChange: (category: ServiceProviderCategory) => void
}) {
  return (
    <select
      className="rounded-md border border-border bg-background px-3 py-1.5 text-sm"
      value={value}
      onChange={(e) => onChange(e.target.value as ServiceProviderCategory)}
    >
      {Object.entries(serviceProviderCategoryLabels).map(([category, label]) => (
        <option key={category} value={category}>
          {label}
        </option>
      ))}
    </select>
  )
}

function StaffCompanySelect({
  companies,
  value,
  onChange,
}: {
  companies: Array<ServiceProviderCompany>
  value: string
  onChange: (companyId: string) => void
}) {
  return (
    <select
      className="rounded-md border border-border bg-background px-3 py-1.5 text-sm"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      {companies.map((company) => (
        <option key={company.id} value={company.id}>
          {company.name}
        </option>
      ))}
    </select>
  )
}

function RouteComponent() {
  const { data: activeMemberRole } = authClient.useActiveMemberRole()
  const isSystemAdmin = activeMemberRole?.role === 'systemAdmin'

  const { data: companies = [], isError: companiesError } = useServiceProviderCompanies()
  const { data: staff = [], isError: staffError } = useServiceProviderStaff(isSystemAdmin)
  const createCompany = useCreateServiceProviderCompany()
  const updateStaff = useUpdateServiceProviderStaff()
  const removeStaff = useRemoveServiceProviderStaff()

  const [name, setName] = useState('')
  const [category, setCategory] = useState<ServiceProviderCategory>('other')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')

  const error = companiesError || (isSystemAdmin && staffError)
    ? 'Kunne ikke hente serviceudbydere.'
    : createCompany.isError
      ? 'Kunne ikke oprette serviceudbyderen.'
      : updateStaff.isError
        ? 'Kunne ikke flytte medarbejderen.'
        : removeStaff.isError
          ? 'Kunne ikke fjerne medarbejderen.'
          : null

  function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!name) return

    createCompany.mutate(
      { name, category, phone, email },
      {
        onSuccess: () => {
          setName('')
          setCategory('other')
          setPhone('')
          setEmail('')
        },
      },
    )
  }

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-4 py-12 sm:px-6">
      <h1 className="text-2xl font-semibold">Serviceudbydere</h1>

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
          <Card.Title>Serviceudbydere</Card.Title>
          <Card.Description>
            Eksterne udbydere som fysioterapeuter, svømmehaller og fitnesscentre, der kan oprette aktiviteter.
          </Card.Description>
        </Card.Header>
        <Card.Content className="flex flex-col gap-3">
          {companies.length === 0 ? (
            <p className="text-sm text-muted">Ingen serviceudbydere endnu.</p>
          ) : (
            companies.map((company) => (
              <div
                key={company.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border px-4 py-3"
              >
                <p className="text-sm font-medium">{company.name}</p>
                <p className="text-sm text-muted">{serviceProviderCategoryLabels[company.category]}</p>
              </div>
            ))
          )}
        </Card.Content>
      </Card>

      {isSystemAdmin && (
        <Card>
          <Card.Header>
            <Card.Title>Medarbejdere hos serviceudbydere</Card.Title>
            <Card.Description>Flyt en medarbejder til en anden serviceudbyder, eller fjern dem helt.</Card.Description>
          </Card.Header>
          <Card.Content className="flex flex-col gap-3">
            {staff.length === 0 ? (
              <p className="text-sm text-muted">Ingen medarbejdere tilknyttet endnu.</p>
            ) : (
              staff.map((member) => (
                <div
                  key={member.userId}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-medium">{member.userName}</p>
                    <p className="text-sm text-muted">{member.userEmail}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StaffCompanySelect
                      companies={companies}
                      value={member.companyId}
                      onChange={(companyId) => updateStaff.mutate({ userId: member.userId, companyId })}
                    />
                    <Button
                      variant="danger-soft"
                      size="sm"
                      onPress={() => removeStaff.mutate(member.userId)}
                    >
                      Fjern
                    </Button>
                  </div>
                </div>
              ))
            )}
          </Card.Content>
        </Card>
      )}

      <Card>
        <Card.Header>
          <Card.Title>Opret serviceudbyder</Card.Title>
        </Card.Header>
        <Card.Content>
          <form onSubmit={handleCreate} className="flex flex-wrap items-end gap-3">
            <Input
              required
              placeholder="Navn"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="min-w-[180px] flex-1"
            />
            <CategorySelect value={category} onChange={setCategory} />
            <Input placeholder="Telefon" value={phone} onChange={(e) => setPhone(e.target.value)} />
            <Input type="email" placeholder="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} />
            <Button type="submit" variant="primary">
              Opret
            </Button>
          </form>
        </Card.Content>
      </Card>
    </div>
  )
}
