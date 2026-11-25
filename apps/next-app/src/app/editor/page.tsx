import { auth } from '@clerk/nextjs/server';
import Editor from './editor';
export default async function EditorPage() {
  await auth.protect();
  return <Editor />;
}
