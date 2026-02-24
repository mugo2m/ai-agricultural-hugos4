import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/actions/auth.action";
import { getFarmerSessionsByUserId } from "@/lib/actions/general.action";
import { db } from "@/firebase/admin";

async function Home() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <section className="card-cta">
        <div className="flex flex-col gap-6 max-w-lg">
          <h2 className="text-3xl font-bold text-green-800">
            🌾 Agricultural Knowledge for Farmers
          </h2>
          <p className="text-lg text-gray-700">
            Get instant answers about your crops, livestock, and farming practices.
            Ask questions by voice and receive spoken answers with helpful images.
          </p>

          <Button asChild className="btn-primary bg-green-600 hover:bg-green-700 max-sm:w-full">
            <Link href="/sign-in">Sign In to Start</Link>
          </Button>
        </div>

        <Image
          src="/farmer-hero.jpg"
          alt="Happy farmer with crops"
          width={400}
          height={400}
          className="max-sm:hidden rounded-lg shadow-lg object-cover"
        />
      </section>
    );
  }

  // Get farmer's past sessions
  const farmerSessions = await getFarmerSessionsByUserId(user.id);
  const hasPastSessions = farmerSessions.length > 0;

  // Get recent queries from their last session
  let recentQueries: any[] = [];
  if (hasPastSessions) {
    const lastSession = farmerSessions[0];
    const queriesSnapshot = await db
      .collection("farmer_sessions")
      .doc(lastSession.id)
      .collection("queries")
      .orderBy("timestamp", "desc")
      .limit(3)
      .get();

    recentQueries = queriesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  }

  return (
    <>
      {/* Hero Section */}
      <section className="card-cta bg-gradient-to-r from-green-50 to-emerald-50">
        <div className="flex flex-col gap-6 max-w-lg">
          <h2 className="text-3xl font-bold text-green-800">
            🌾 Ask Anything About Farming
          </h2>
          <p className="text-lg text-gray-700">
            Get personalized advice for your specific crops, location, and farming practices.
            Just speak your questions and receive answers with images.
          </p>

          <Button asChild className="btn-primary bg-green-600 hover:bg-green-700 max-sm:w-full">
            <Link href="/generate">🌱 Start New Farm Session</Link>
          </Button>
        </div>

        <Image
          src="/farmer-smartphone.jpg"
          alt="Farmer using smartphone"
          width={400}
          height={400}
          className="max-sm:hidden rounded-lg shadow-lg object-cover"
        />
      </section>

      {/* Past Sessions Section */}
      <section className="flex flex-col gap-6 mt-8">
        <h2 className="text-2xl font-semibold">📋 Your Farm Sessions</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {hasPastSessions ? (
            farmerSessions.map((session) => (
              <div
                key={session.id}
                className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all"
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">🌾</span>
                  <div>
                    <h3 className="font-semibold text-gray-800">
                      {session.crops?.join(", ") || "Mixed crops"}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {session.county}{session.subCounty ? `, ${session.subCounty}` : ""}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                  <div>
                    <span className="text-gray-500">Farm size:</span>
                    <span className="ml-1 font-medium">{session.acres || "?"} acres</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Cattle:</span>
                    <span className="ml-1 font-medium">{session.cattle || 0}</span>
                  </div>
                </div>

                {session.id === farmerSessions[0]?.id && recentQueries.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-xs text-gray-500 mb-2">Recent questions:</p>
                    {recentQueries.map((q, i) => (
                      <p key={i} className="text-sm text-gray-700 truncate">
                        "{q.question.substring(0, 30)}..."
                      </p>
                    ))}
                  </div>
                )}

                <div className="mt-4 flex justify-between items-center">
                  <span className="text-xs text-gray-400">
                    {new Date(session.createdAt).toLocaleDateString()}
                  </span>
                  <Link
                    href={`/interview/${session.id}`}
                    className="text-sm bg-green-100 text-green-700 px-3 py-1 rounded-full hover:bg-green-200 transition-colors"
                  >
                    Ask More →
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-3 text-center py-8 bg-gray-50 rounded-lg">
              <p className="text-gray-500">You haven't created any farm sessions yet.</p>
              <Link href="/generate" className="text-green-600 hover:text-green-700 mt-2 inline-block">
                🌾 Start your first farm session
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Knowledge Base Stats */}
      <section className="flex flex-col gap-6 mt-8 bg-blue-50 p-6 rounded-xl">
        <h2 className="text-2xl font-semibold">📚 Agricultural Knowledge Base</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg text-center">
            <div className="text-3xl font-bold text-green-600">50+</div>
            <div className="text-sm text-gray-600">Crop Guides</div>
          </div>
          <div className="bg-white p-4 rounded-lg text-center">
            <div className="text-3xl font-bold text-green-600">100+</div>
            <div className="text-sm text-gray-600">Disease Images</div>
          </div>
          <div className="bg-white p-4 rounded-lg text-center">
            <div className="text-3xl font-bold text-green-600">24/7</div>
            <div className="text-sm text-gray-600">Voice Access</div>
          </div>
          <div className="bg-white p-4 rounded-lg text-center">
            <div className="text-3xl font-bold text-green-600">Free</div>
            <div className="text-sm text-gray-600">For Farmers</div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="flex flex-col gap-6 mt-8">
        <h2 className="text-2xl font-semibold">🎯 How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-lg border border-gray-200">
            <div className="text-3xl mb-2">1️⃣</div>
            <h3 className="font-semibold mb-1">Tell us about your farm</h3>
            <p className="text-sm text-gray-600">Answer voice questions about your crops, location, and farming practices.</p>
          </div>
          <div className="bg-white p-5 rounded-lg border border-gray-200">
            <div className="text-3xl mb-2">2️⃣</div>
            <h3 className="font-semibold mb-1">Ask any question</h3>
            <p className="text-sm text-gray-600">Speak your farming questions naturally. Get answers instantly.</p>
          </div>
          <div className="bg-white p-5 rounded-lg border border-gray-200">
            <div className="text-3xl mb-2">3️⃣</div>
            <h3 className="font-semibold mb-1">See helpful images</h3>
            <p className="text-sm text-gray-600">View diagrams, disease photos, and illustrations alongside text answers.</p>
          </div>
        </div>
      </section>
    </>
  );
}

export default Home;