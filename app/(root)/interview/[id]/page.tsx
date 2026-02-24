import Image from "next/image";
import { redirect } from "next/navigation";

import Agent from "@/components/Agent";
import { getRandomInterviewCover } from "@/lib/utils";

import {
  getFarmerSessionById,  // ✅ NEW: Use farmer session function
  getFeedbackByInterviewId,
} from "@/lib/actions/general.action";
import { getCurrentUser } from "@/lib/actions/auth.action";

const InterviewDetails = async ({ params }: RouteParams) => {
  const { id } = await params;

  console.log("🌾🌾🌾 FARMER SESSION PAGE LOADED 🌾🌾🌾");
  console.log("Session ID:", id);

  const user = await getCurrentUser();
  console.log("Current user:", user?.id);

  // ✅ Get farmer session instead of interview
  const session = await getFarmerSessionById(id);
  console.log("Farmer session data:", {
    exists: !!session,
    crops: session?.crops,
    county: session?.county,
    acres: session?.acres,
    recommendations: session?.recommendations?.length
  });

  if (!session) {
    console.log("❌ Farmer session not found, redirecting...");
    redirect("/");
  }

  // Create welcome message from recommendations
  const welcomeMessages = session.recommendations || [
    `Welcome! I see you grow ${session.crops?.join(", ")} in ${session.county}. Ask me anything about your farm!`
  ];

  const feedback = await getFeedbackByInterviewId({
    interviewId: id,
    userId: user?.id!,
  });

  console.log("Feedback exists:", !!feedback);

  return (
    <>
      {/* Farm Header - Green themed */}
      <div className="flex flex-row gap-4 justify-between bg-green-50 p-4 rounded-xl mb-4">
        <div className="flex flex-row gap-4 items-center max-sm:flex-col">
          <div className="flex flex-row gap-4 items-center">
            <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white text-xl">
              🌾
            </div>
            <div>
              <h3 className="capitalize text-xl font-semibold text-green-800">
                {session.crops?.join(", ")} Farm
              </h3>
              <p className="text-sm text-gray-600">
                {session.county}{session.subCounty ? `, ${session.subCounty}` : ""}
                {session.village ? `, ${session.village}` : ""}
              </p>
            </div>
          </div>

          {/* Farm Stats */}
          <div className="flex gap-3 ml-4">
            {session.acres && (
              <span className="bg-white px-3 py-1 rounded-full text-sm">
                📏 {session.acres} acres
              </span>
            )}
            {session.cattle > 0 && (
              <span className="bg-white px-3 py-1 rounded-full text-sm">
                🐄 {session.cattle} cattle
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="bg-green-100 text-green-700 px-4 py-2 rounded-lg font-medium">
            🌱 Ask & Learn
          </span>
        </div>
      </div>

      {/* Recommendations Banner */}
      {session.recommendations && session.recommendations.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
          <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
            <span>📋</span> Your Personalized Recommendations
          </h4>
          <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
            {session.recommendations.slice(0, 2).map((rec: string, idx: number) => (
              <li key={idx}>{rec}</li>
            ))}
            {session.recommendations.length > 2 && (
              <li className="text-blue-600">+ {session.recommendations.length - 2} more recommendations available</li>
            )}
          </ul>
        </div>
      )}

      {/* Agent Component - Now configured for farmer Q&A */}
      <Agent
        userName={user?.name || "Farmer"}
        userId={user?.id}
        interviewId={id}
        sessionData={session}  // ✅ Pass full session data
        profileImage={user?.profileURL}
      />
    </>
  );
};

export default InterviewDetails;