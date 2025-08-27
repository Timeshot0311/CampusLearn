import { use } from "react";
import TopicDetailClient from "./TopicDetailClient";

export default function TopicDetailPage({
  params,
}: {
  params: Promise<{ topicId: string }>;
}) {
  const { topicId } = use(params); // unwrap the Promise
  return <TopicDetailClient topicId={topicId} />;
}
