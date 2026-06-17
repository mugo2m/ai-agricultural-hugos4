// app/api/farmer/farmerscomments/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/firebase/admin';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { comment, farmerName, userId, sessionId, crop, country } = body;

    if (!comment || !userId || !sessionId) {
      return NextResponse.json(
        { error: 'Missing required fields: comment, userId, sessionId' },
        { status: 400 }
      );
    }

    const docRef = db.collection('farmerscomments').doc();
    await docRef.set({
      id: docRef.id,
      comment,
      farmerName: farmerName || 'Anonymous',
      userId,
      sessionId,
      crop: crop || 'general',
      country: country || 'kenya',
      timestamp: new Date().toISOString(),
      read: false,
    });

    return NextResponse.json({ success: true, id: docRef.id });
  } catch (error: any) {
    console.error('❌ Error saving farmers comment:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to save comment' },
      { status: 500 }
    );
  }
}

// ✅ GET handler – returns all comments, newest first
export async function GET() {
  try {
    const snapshot = await db
      .collection('farmerscomments')
      .orderBy('timestamp', 'desc')
      .get();

    const comments = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({ comments });
  } catch (error: any) {
    console.error('❌ Error fetching farmers comments:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch comments' },
      { status: 500 }
    );
  }
}