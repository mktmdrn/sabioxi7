"use client";

import dynamic from "next/dynamic";

import { AvatarConfig } from "@/actions/db";

const Avatar3D = dynamic(() => import("@/components/Avatar3D"), { ssr: false });

export default function MiniAvatar({ config }: { config: AvatarConfig }) {
  return (
    <div className="bg-gradient-to-b from-slate-800/50 to-slate-900 rounded-2xl overflow-hidden">
      <Avatar3D config={config} size="small" />
    </div>
  );
}
