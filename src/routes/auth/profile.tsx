import { createFileRoute } from '@tanstack/react-router'
import { authClient } from '../../lib/auth-client'
import { Button } from '@heroui/react'

export const Route = createFileRoute('/auth/profile')({ component: Profile })

function Profile() {

    const { 
        data: session, 
        isPending, //loading state
        error, //error object
        refetch //refetch the session
    } = authClient.useSession() 

    return (
        <div>
            <h1>Profile</h1>
            {isPending && <p>Loading profile...</p>}
            {error && <p>Unable to load your profile.</p>}
            {!isPending && !error && session && (
                <div>
                    <p>Welcome to your profile page!</p>
                    <p>Email: {session.user.email}</p>
                    <p>Username: {session.user.name}</p>
                    <Button type="button" onClick={() => authClient.signOut()}>
                        Sign Out
                    </Button>
                </div>
            )}
            {!isPending && !error && !session && (
                <p>You are not signed in.</p>
            )}
            <button type="button" onClick={() => refetch()}>
                Refresh
            </button>
        </div>
    )
}