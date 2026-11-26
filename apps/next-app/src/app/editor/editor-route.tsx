"use client";
import { useParams } from "next/navigation";
import Editor from "./editor";

export default function EditorRoute() {
  const params = useParams<{ projectId?: string }>();
  return <Editor projectId={params.projectId} />;
}
