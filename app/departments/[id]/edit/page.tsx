"use client";

import { useParams } from "next/navigation";
import DepartmentForm from "@/components/DepartmentForm";

export default function EditDepartmentPage() {
  const params = useParams<{ id: string }>();
  return <DepartmentForm id={params.id} />;
}
