import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getCourseStats } from "@/actions/db";
import CoursesClient from "./CoursesClient";

export default async function CoursesPage() {
  const session = await auth();
  if (!session) {
    redirect("/login");
  }

  const stats = await getCourseStats();

  return (
    <div className="min-h-screen bg-[#f7f7f7] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <CoursesClient stats={stats} />
      </div>
    </div>
  );
}
