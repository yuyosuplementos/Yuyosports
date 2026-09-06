import { LoginForm } from "@/components/admin/login-form";

const ERRORS: Record<string, string> = {
  forbidden: "Esa cuenta no tiene acceso al panel. Pedí que te agreguen como administrador.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  return <LoginForm initialError={error ? ERRORS[error] : undefined} />;
}
