import { SignUp } from '@clerk/nextjs';
import { AuthLayout } from '../../_components/auth-layout/auth-layout';
export default function SignUpPage() { return <AuthLayout><SignUp /></AuthLayout>; }
