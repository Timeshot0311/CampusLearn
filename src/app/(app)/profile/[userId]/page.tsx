
import { use } from "react";
import ProfileClient from "./ProfileClient";

export default function PublicProfilePage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = use(params); // unwrap the Promise
  return <ProfileClient userId={userId} />;
}
