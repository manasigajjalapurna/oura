import { NextRequest, NextResponse } from 'next/server';
import { initializeDatabase } from '@/lib/db/schema';
import db from '@/lib/db/schema';

export async function GET(request: NextRequest) {
  try {
    initializeDatabase();

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');

    const meals = db.prepare(`
      SELECT * FROM meals
      ORDER BY date DESC, time DESC
      LIMIT ?
    `).all(limit);

    return NextResponse.json({ meals });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    initializeDatabase();

    const body = await request.json();
    const { description, estimatedPortion, notes } = body;

    const now = new Date();
    const date = now.toISOString().split('T')[0];
    const time = now.toTimeString().split(' ')[0];

    const result = db.prepare(`
      INSERT INTO meals (date, time, description, estimated_portion, notes)
      VALUES (?, ?, ?, ?, ?)
    `).run(date, time, description, estimatedPortion || null, notes || null);

    const meal = db.prepare('SELECT * FROM meals WHERE id = ?').get(result.lastInsertRowid);

    return NextResponse.json({ success: true, meal });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
