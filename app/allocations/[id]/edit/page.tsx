"use client";

import { useParams } from "next/navigation";
import AllocationForm from "@/components/AllocationForm";

export default function EditAllocationPage() {
  const params = useParams<{ id: string }>();
  return <AllocationForm id={params.id} />;
}
