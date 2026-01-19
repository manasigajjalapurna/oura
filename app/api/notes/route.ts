import { NextRequest, NextResponse } from 'next/server';
import { initializeDatabase } from '@/lib/db/schema';
import db from '@/lib/db/schema';

export async function GET(request: NextRequest) {
  try {
    initializeDatabase();

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');

    const notes = db.prepare(`
      SELECT * FROM user_notes
      ORDER BY date DESC, created_at DESC
      LIMIT ?
    `).all(limit);

    return NextResponse.json({ notes });
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
    const { content, noteType } = body;

    const date = new Date().toISOString().split('T')[0];

    const result = db.prepare(`
      INSERT INTO user_notes (date, note_type, content)
      VALUES (?, ?, ?)
    `).run(date, noteType || 'general', content);

    const note = db.prepare('SELECT * FROM user_notes WHERE id = ?').get(result.lastInsertRowid);

    return NextResponse.json({ success: true, note });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
