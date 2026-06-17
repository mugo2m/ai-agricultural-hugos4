// app/admin/farmerscomments/page.tsx
import { db } from "@/firebase/admin";
import { FarmersCommentsTable } from "@/components/admin/FarmersCommentsTable";

export const dynamic = "force-dynamic"; // Prevents static caching

export default async function FarmersCommentsPage() {
  // Fetch comments server‑side using firebase-admin
  const commentsSnapshot = await db
    .collection("farmerscomments")
    .orderBy("timestamp", "desc")
    .get();

  const comments = commentsSnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <FarmersCommentsTable initialComments={comments} />
      </div>
    </div>
  );
}