// Layout desnudo: NO llama requireAdmin, si no el login redirigiría a sí mismo.
export const dynamic = "force-dynamic";

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
