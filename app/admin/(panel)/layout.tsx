import Link from "next/link"
import { Suspense, type ReactNode } from "react"
import { redirect } from "next/navigation"
import { logoutAction } from "@/lib/admin/actions"
import { Button } from "@/components/ui/button"
import { getSession } from "@/lib/auth/current-session"

export const instant = false

async function AdminShell({ children }: { children: ReactNode }) {
  const session = await getSession()
  if (!session) redirect("/admin/login")

  return (
    <div className="flex min-h-svh flex-1 flex-col">
      <header className="border-b border-white/10 bg-primary text-primary-foreground">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3.5">
          <div className="min-w-0">
            <p className="font-serif text-2xl leading-none tracking-tight">Semilla</p>
            <p className="mt-1 text-xs text-primary-foreground/75">Administración</p>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2">
            <Link href="/admin" className="px-2 text-sm underline-offset-4 hover:underline">
              Mixes
            </Link>
            <Link href="/admin/promos" className="px-2 text-sm underline-offset-4 hover:underline">
              Promos
            </Link>
            <Link href="/" className="px-2 text-sm underline-offset-4 hover:underline">
              Ver tienda
            </Link>
            <form action={logoutAction}>
              <Button type="submit" variant="secondary" className="h-10">
                Salir
              </Button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">{children}</main>
    </div>
  )
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<p className="px-4 py-8 text-muted-foreground">Abriendo la administración…</p>}>
      <AdminShell>{children}</AdminShell>
    </Suspense>
  )
}
