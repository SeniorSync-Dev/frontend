import { useEffect, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Alert, Spinner } from '@heroui/react'
import { API_BASE_URL } from '../../lib/auth-client'

export const Route = createFileRoute('/admin/dashboard')({
  component: RouteComponent,
})

const ROLES = ['citizen', 'relative', 'employee', 'systemAdmin'] as const
type Role = (typeof ROLES)[number]

type AdminUser = {
  id: string
  name: string
  email: string
  image: string | null
  createdAt: string
  role: Role | null
}

async function fetchUsers(): Promise<AdminUser[]> {
  const res = await fetch(`${API_BASE_URL}/api/admin/users`, { credentials: 'include' })
  if (!res.ok) throw new Error(`Kunne ikke hente brugere (${res.status})`)
  const { users } = (await res.json()) as { users: AdminUser[] }
  return users
}

async function setUserRole(userId: string, role: Role) {
  const res = await fetch(`${API_BASE_URL}/api/admin/users/${userId}/role`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role }),
  })
  if (!res.ok) throw new Error(`Kunne ikke opdatere rolle (${res.status})`)
}

function RouteComponent() {
  const [users, setUsers] = useState<AdminUser[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [pendingUserId, setPendingUserId] = useState<string | null>(null)

  function loadUsers() {
    setError(null)
    fetchUsers()
      .then(setUsers)
      .catch((err: Error) => setError(err.message))
  }

  useEffect(loadUsers, [])

  async function handleRoleChange(userId: string, role: Role) {
    setPendingUserId(userId)
    setError(null)
    try {
      await setUserRole(userId, role)
      setUsers((prev) => prev && prev.map((u) => (u.id === userId ? { ...u, role } : u)))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kunne ikke opdatere rolle')
    } finally {
      setPendingUserId(null)
    }
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-16">
      <h1 className="text-2xl font-semibold tracking-tight">Brugere</h1>
      <p className="mt-1 text-muted">Se alle brugere og tildel dem en rolle.</p>

      {error && (
        <Alert status="danger" className="mt-4">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Title>Noget gik galt</Alert.Title>
            <Alert.Description>{error}</Alert.Description>
          </Alert.Content>
        </Alert>
      )}

      {!users && !error && (
        <div className="mt-8 flex justify-center">
          <Spinner size="lg" color="accent" aria-label="Henter brugere" />
        </div>
      )}

      {users && (
        <table className="mt-6 w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b">
              <th className="py-2 pr-4 font-medium">Navn</th>
              <th className="py-2 pr-4 font-medium">Email</th>
              <th className="py-2 pr-4 font-medium">Rolle</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b">
                <td className="py-2 pr-4">{user.name}</td>
                <td className="py-2 pr-4">{user.email}</td>
                <td className="py-2 pr-4">
                  <select
                    className="rounded border bg-transparent px-2 py-1"
                    value={user.role ?? ''}
                    disabled={pendingUserId === user.id}
                    onChange={(e) => handleRoleChange(user.id, e.target.value as Role)}
                  >
                    <option value="" disabled>
                      Ingen rolle
                    </option>
                    {ROLES.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
