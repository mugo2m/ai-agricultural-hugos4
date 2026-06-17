// components/admin/FarmersCommentsTable.tsx
"use client";

import { useState } from "react";
import { CheckCircle, Circle, RefreshCw, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

interface FarmerComment {
  id: string;
  comment: string;
  farmerName: string;
  userId: string;
  sessionId: string;
  crop: string;
  country: string;
  timestamp: string;
  read: boolean;
}

interface Props {
  initialComments: FarmerComment[];
}

export function FarmersCommentsTable({ initialComments }: Props) {
  const [comments, setComments] = useState<FarmerComment[]>(initialComments);
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");
  const [loading, setLoading] = useState(false);

  const refreshComments = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/farmer/farmerscomments");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setComments(data.comments || []);
    } catch (error) {
      console.error("Refresh error:", error);
      toast.error("Could not refresh comments");
    } finally {
      setLoading(false);
    }
  };

  const toggleReadStatus = async (id: string, currentRead: boolean) => {
    try {
      const res = await fetch("/api/farmer/farmerscomments/update-read", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, read: !currentRead }),
      });
      if (!res.ok) throw new Error("Update failed");
      setComments((prev) =>
        prev.map((c) => (c.id === id ? { ...c, read: !currentRead } : c))
      );
      toast.success("Status updated");
    } catch (error) {
      console.error("Update error:", error);
      toast.error("Failed to update status");
    }
  };

  const filteredComments = comments.filter((c) => {
    if (filter === "unread") return !c.read;
    if (filter === "read") return c.read;
    return true;
  });

  const unreadCount = comments.filter((c) => !c.read).length;

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
          📝 Farmers Comments
          <span className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
            {unreadCount} unread
          </span>
        </h1>
        <div className="flex gap-3">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="border rounded-lg px-4 py-2 bg-white"
          >
            <option value="all">All</option>
            <option value="unread">Unread</option>
            <option value="read">Read</option>
          </select>
          <button
            onClick={refreshComments}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading...</div>
      ) : filteredComments.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No farmers comments {filter !== "all" ? `(${filter})` : ""} yet.
        </div>
      ) : (
        <div className="bg-white shadow rounded-xl overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Farmer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Crop</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Comment</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredComments.map((c) => (
                <tr key={c.id} className={c.read ? "opacity-60" : "bg-blue-50/50"}>
                  <td className="px-6 py-4">
                    {c.read ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <Circle className="w-5 h-5 text-blue-500 animate-pulse" />
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {c.farmerName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {c.crop}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-800 max-w-md break-words">
                    {c.comment}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(c.timestamp).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => toggleReadStatus(c.id, c.read)}
                      className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                    >
                      {c.read ? (
                        <>
                          <EyeOff className="w-4 h-4" /> Mark unread
                        </>
                      ) : (
                        <>
                          <Eye className="w-4 h-4" /> Mark read
                        </>
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}