import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getUserPoints, getAvatarConfig } from "@/actions/db";
import AvatarCustomizer from "./AvatarCustomizer";

export default async function AvatarPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const points = await getUserPoints(session.user.id);
  const config = await getAvatarConfig(session.user.id);

  return (
    <AvatarCustomizer
      userId={session.user.id}
      points={points}
      initialConfig={config}
    />
  );
}
