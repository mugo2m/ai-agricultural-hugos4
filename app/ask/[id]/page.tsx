// app/ask/[id]/page.tsx
import { db } from '@/firebase/admin';
import AskAgent from '@/components/AskAgent';

export const dynamic = 'force-dynamic';

export default async function AskPage({ params }: { params: { id: string } }) {
  // ✅ FIX: Properly await and extract params
  const { id } = await params;
  const sessionId = id;

  console.log(`🌾 Loading Q&A page for session: ${sessionId}`);

  // ✅ FIX: Validate sessionId before using
  if (!sessionId || sessionId.trim() === '') {
    console.error("❌ No session ID provided");
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 shadow-xl text-center max-w-md">
          <h2 className="text-2xl font-bold text-red-600 mb-2">Invalid Session</h2>
          <p className="text-gray-600 mb-4">No session ID provided.</p>
          <a href="/" className="inline-block px-6 py-3 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600">
            Return Home
          </a>
        </div>
      </div>
    );
  }

  try {
    // 🔍 DEBUG: List all collections to see what's available
    console.log("🔍 Checking available collections...");
    const collections = await db.listCollections();
    const collectionNames = collections.map(col => col.id);
    console.log("📚 Available collections:", collectionNames);

    // Try different possible collection names
    const possibleCollections = [
      'interview_sessions',
      'sessions',
      'farmer_sessions',
      'farming_sessions'
    ];

    let sessionDoc = null;
    let usedCollection = '';

    for (const collectionName of possibleCollections) {
      console.log(`🔍 Checking collection: ${collectionName}`);
      const doc = await db.collection(collectionName).doc(sessionId).get();
      if (doc.exists) {
        sessionDoc = doc;
        usedCollection = collectionName;
        console.log(`✅ Found session in collection: ${collectionName}`);
        break;
      }
    }

    if (!sessionDoc) {
      console.error(`❌ Session not found in any collection: ${sessionId}`);

      // Try to list some recent sessions to help debug
      for (const collectionName of possibleCollections) {
        try {
          const snapshot = await db.collection(collectionName).limit(3).get();
          if (!snapshot.empty) {
            console.log(`📋 Recent sessions in ${collectionName}:`,
              snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
            );
          }
        } catch (e) {
          // Ignore errors
        }
      }

      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-8 shadow-xl text-center max-w-md">
            <h2 className="text-2xl font-bold text-red-600 mb-2">Session Not Found</h2>
            <p className="text-gray-600 mb-4">The farming session you're looking for doesn't exist.</p>
            <p className="text-sm text-gray-500 mb-4">Session ID: {sessionId}</p>
            <a href="/" className="inline-block px-6 py-3 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600">
              Return Home
            </a>
          </div>
        </div>
      );
    }

    const sessionData = sessionDoc.data();
    console.log("✅ Session loaded from:", usedCollection);
    console.log("✅ Session data:", {
      id: sessionId,
      userId: sessionData?.user_id || sessionData?.userId,
      hasRecommendations: sessionData?.recommendations?.length || 0
    });

    // Fetch user data if needed
    let userName = 'Farmer';
    const userId_field = sessionData?.user_id || sessionData?.userId;

    if (userId_field) {
      try {
        const userDoc = await db.collection('users').doc(userId_field).get();
        if (userDoc.exists) {
          const userData = userDoc.data();
          userName = userData?.name || userData?.displayName || 'Farmer';
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    }

    return (
      <div className="container mx-auto p-4 max-w-4xl">
        <AskAgent
          userName={userName}
          userId={userId_field}
          sessionId={sessionId}
          sessionData={sessionData?.session_data || sessionData}
          recommendations={sessionData?.recommendations || []}
        />
      </div>
    );

  } catch (error) {
    console.error("❌ Error loading Q&A page:", error);
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 shadow-xl text-center max-w-md">
          <h2 className="text-2xl font-bold text-red-600 mb-2">Something went wrong</h2>
          <p className="text-gray-600 mb-4">We couldn't load your farming session.</p>
          <a href="/" className="inline-block px-6 py-3 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600">
            Return Home
          </a>
        </div>
      </div>
    );
  }
}