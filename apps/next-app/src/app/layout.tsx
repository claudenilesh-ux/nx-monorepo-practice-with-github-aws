import { ClerkProvider } from '@clerk/nextjs';
import { dark } from '@clerk/ui/themes';
import './global.scss';

export const metadata = { title: 'Archloom', description: 'Project editor' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body><ClerkProvider signInUrl="/sign-in" signUpUrl="/sign-up" afterSignOutUrl={process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_OUT_URL} localization={{ formFieldInputPlaceholder__emailAddress: "Enter your email", signIn: { start: { title: "Welcome to Archloom", titleCombined: "Welcome to Archloom", subtitle: "Sign in to your workspace", actionText: "New here?" } } }} appearance={{
    theme: dark,
    options: { socialButtonsVariant: 'blockButton' },
    variables: {
      colorPrimary: 'var(--accent-primary)',
      colorBackground: 'var(--bg-surface)',
      colorForeground: 'var(--text-primary)',
      colorMutedForeground: 'var(--text-muted)',
      colorInput: 'var(--bg-hover)',
      colorInputForeground: 'var(--text-primary)',
      colorDanger: 'var(--state-error)',
      colorBorder: 'var(--border-default)',
      fontFamily: 'var(--font-sans)',
      borderRadius: 'var(--radius-md)',
    },
  }}>{children}</ClerkProvider></body></html>;
}
