// app/api/farmer/farmerscomments/update-read/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/firebase/admin';

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, read } = body;

    if (!id || typeof read !== 'boolean') {
      return NextResponse.json(
        { error: 'Missing required fields: id, read (boolean)' },
        { status: 400 }
      );
    }

    await db.collection('farmerscomments').doc(id).update({ read });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('❌ Error updating read status:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update status' },
      { status: 500 }
    );
  }
}