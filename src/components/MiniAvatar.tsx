"use client";

import dynamic from "next/dynamic";

import { AvatarConfig } from "@/actions/db";

const Avatar3D = dynamic(() => import("@/components/Avatar3D"), { ssr: false });

export default function MiniAvatar({ config }: { config: AvatarConfig }) {
  return (
    <div className="bg-gradient-to-b from-white to-[#f7f7f7] border-2 border-duo-gray rounded-2xl overflow-hidden shadow-sm">
      <Avatar3D config={config} size="small" />
    </div>
  );
}
