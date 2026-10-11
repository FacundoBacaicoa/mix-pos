import Link from "next/link"
import { LoginForm } from "@/components/admin/login-form"
import { devLoginHint } from "@/lib/password"

export const metadata = {
  title: "Entrar",
}

export default function LoginPage() {
  return (
    <div className="mx-auto flex min-h-svh w-full max-w-md flex-col justify-center px-4 py-12">
      <p className="text-sm font-medium tracking-[0.16em] text-primary uppercase">Semilla</p>
      <h1 className="mt-2 font-serif text-4xl tracking-tight">Administración</h1>
      <p className="mt-3 text-sm text-muted-foreground">
        Desde acá se cargan los mixes, el stock y las fotos. Esta entrada no aparece en la tienda.
      </p>
      <div className="mt-8">
        <LoginForm hint={devLoginHint()} />
      </div>
      <Link href="/" className="mt-8 text-sm text-muted-foreground underline underline-offset-4">
        Volver a la tienda
      </Link>
    </div>
  )
}
