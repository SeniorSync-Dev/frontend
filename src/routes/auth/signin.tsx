import { createFileRoute } from '@tanstack/react-router'
import { Button, Card, Checkbox, Input } from '@heroui/react'
import { authClient } from '../../lib/auth-client'

export const Route = createFileRoute('/auth/signin')({ component: Signin })



function Signin() {
    async function signInWithMitID() {
        await authClient.signIn.social({
            provider: "mitid",
            callbackURL: "http://localhost:3001/auth/profile",
        })
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(168,85,247,0.18),_transparent_26%),radial-gradient(circle_at_bottom_right,_rgba(59,130,246,0.18),_transparent_30%),linear-gradient(180deg,_#f8fafc_0%,_#eef2ff_100%)] px-4 py-12 text-slate-900">
            <Card className="w-full max-w-md border border-slate-200/80 bg-white/80 shadow-[0_24px_80px_-30px_rgba(15,23,42,0.45)] backdrop-blur-xl">
                <div className="p-7 sm:p-8">
                    <div className="mb-8 text-center">
                        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-lg font-semibold text-white shadow-lg shadow-slate-900/15">
                            S
                        </div>
                        <p className="text-xs font-medium uppercase tracking-[0.28em] text-slate-500">
                            Welcome back
                        </p>
                        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
                            Sign in
                        </h1>
                    </div>

                    <div className="flex items-center justify-between gap-3">
                        <Button onClick={signInWithMitID} className="h-12 w-full rounded-xl">Sign in with MitID</Button>
                    </div>
                </div>
            </Card>
        </div>
    )
}