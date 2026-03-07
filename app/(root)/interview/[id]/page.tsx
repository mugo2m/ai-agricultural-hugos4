// app/interview/[id]/page.tsx
import { db } from "@/firebase/admin";
import { notFound } from "next/navigation";
import InterviewClient from "@/components/InterviewClient";
import { ArrowLeft, DollarSign, BarChart3 } from "lucide-react";
import Link from "next/link";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function InterviewPage({ params }: PageProps) {
  const { id } = await params;

  // Get session data from Firebase
  let sessionData = null;
  try {
    const session = await db.collection("farmer_sessions").doc(id).get();
    if (session.exists) {
      sessionData = { id: session.id, ...session.data() };
      console.log("📊 InterviewPage - Session data loaded:", {
        id: sessionData.id,
        crop: sessionData.crops?.[0]
      });
    }
  } catch (error) {
    console.error("Error fetching session:", error);
  }

  if (!sessionData) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900">
      {/* Header with Navigation */}
      <div className="bg-gradient-to-r from-blue-950 to-indigo-950 text-white p-6 shadow-xl">
        <div className="container mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="p-2 bg-white/10 backdrop-blur-sm hover:bg-white/20 rounded-xl transition-all"
              >
                <ArrowLeft className="w-5 h-5 text-white" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  <Sprout className="w-6 h-6" />
                  Farm Recommendations
                </h1>
                <p className="text-white/80">
                  {sessionData.crops?.[0] || "Crop"} • {sessionData.county || "Unknown"}
                </p>
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex gap-4">
              <Link
                href={`/financial/${id}`}
                className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-medium hover:from-green-600 hover:to-emerald-700 transition-all flex items-center gap-2"
              >
                <DollarSign className="w-4 h-4" />
                Financial Analysis
              </Link>

              {/* COMPARE CROPS BY PROFIT BUTTON */}
              <Link
                href={`/compare/${id}`}
                className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl font-medium hover:from-purple-600 hover:to-pink-700 transition-all flex items-center gap-2"
              >
                <BarChart3 className="w-4 h-4" />
                Compare Crops by Profit
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <InterviewClient sessionData={sessionData} sessionId={id} />
      </div>
    </div>
  );
}