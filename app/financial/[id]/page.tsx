// app/financial/[id]/page.tsx
import { db } from "@/firebase/admin";
import FinancialAnalysisClient from "@/components/FinancialAnalysisClient";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function FinancialAnalysisPage({ params }: PageProps) {
  const { id } = await params;

  // Get session data from Firebase
  let sessionData = null;
  try {
    const session = await db.collection("farmer_sessions").doc(id).get();
    if (session.exists) {
      sessionData = { id: session.id, ...session.data() };
    }
  } catch (error) {
    console.error("Error fetching session:", error);
  }

  if (!sessionData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Session Not Found</h1>
          <p className="mt-2">The financial analysis you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return <FinancialAnalysisClient sessionData={sessionData} sessionId={id} />;
}