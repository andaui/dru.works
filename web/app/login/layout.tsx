import LoginPageBackground from './LoginPageBackground';

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <LoginPageBackground>{children}</LoginPageBackground>;
}
