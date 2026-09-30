"use client";

import { useParams } from "next/navigation";
import ProfessorForm from "@/components/ProfessorForm";

export default function EditProfessorPage() {
  const params = useParams<{ id: string }>();
  return <ProfessorForm id={params.id} />;
}
