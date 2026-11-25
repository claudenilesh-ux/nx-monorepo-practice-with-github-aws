import { SignIn } from "@clerk/nextjs";
import { AuthLayout } from "../../_components/auth-layout/auth-layout";
export default function SignInPage() {
  return (
    <AuthLayout>
      <SignIn />
    </AuthLayout>
  );
}
