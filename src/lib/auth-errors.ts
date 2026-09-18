export type AuthError = {
  status: 'default' | 'warning' | 'danger'
  title: string
  text: string
}

export function describeAuthError(code?: string, description?: string): AuthError | null {
  if (!code) return null

  switch (code) {
    case 'IDP-3200':
    case 'access_denied':
      return {
        status: 'default',
        title: 'Login blev afbrudt',
        text: 'Du afbrød MitID-login. Du kan prøve igen, når du er klar.',
      }
    case 'state_mismatch':
    case 'invalid_state':
    case 'state_not_found':
      return {
        status: 'warning',
        title: 'Login udløb',
        text: 'Der gik for lang tid, eller siden blev åbnet i en anden browser. Prøv igen.',
      }
    default:
      return {
        status: 'danger',
        title: 'Login mislykkedes',
        text: description || 'Der opstod en fejl under login. Prøv venligst igen.',
      }
  }
}
