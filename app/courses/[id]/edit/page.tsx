"use client";

import { useParams } from "next/navigation";
import CourseForm from "@/components/CourseForm";

export default function EditCoursePage() {
  const params = useParams<{ id: string }>();
  return <CourseForm id={params.id} />;
}
