
import { use } from "react";
import CourseDetailClient from "./CourseDetailClient";

export default function CourseDetailPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = use(params); // unwrap the Promise
  return <CourseDetailClient courseId={courseId} />;
}
