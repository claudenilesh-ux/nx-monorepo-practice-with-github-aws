import { auth } from '@clerk/nextjs/server';
import EditorRoute from './editor-route';

export default async function EditorLayout({ children }: { children: React.ReactNode }) {
  await auth.protect();
  return <><EditorRoute />{children}</>;
}
