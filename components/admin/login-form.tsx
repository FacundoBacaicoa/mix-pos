"use client"

import { useActionState } from "react"
import { loginAction, type LoginState } from "@/lib/admin/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const initial: LoginState = {}

export function LoginForm({
  hint,
}: {
  hint: { username: string; password: string } | null
}) {
  const [state, action, pending] = useActionState(loginAction, initial)

  return (
    <form action={action} className="grid gap-4" noValidate>
      {state.message ? (
        <p role="alert" className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {state.message}
        </p>
      ) : null}
      <div className="grid gap-1.5">
        <Label htmlFor="username">Usuario</Label>
        <Input id="username" name="username" autoComplete="username" className="h-11" required />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="password">Contraseña</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          className="h-11"
          required
        />
      </div>
      <Button type="submit" className="h-11" disabled={pending}>
        {pending ? "Entrando…" : "Entrar"}
      </Button>
      {hint ? (
        <p className="text-sm text-muted-foreground">
          En esta máquina el usuario es {hint.username} y la contraseña es {hint.password}. Para
          cambiarla, definí ADMIN_PASSWORD en .env.local y reiniciá.
        </p>
      ) : null}
    </form>
  )
}
