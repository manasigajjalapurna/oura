import { NextRequest, NextResponse } from 'next/server';
import { initializeDatabase } from '@/lib/db/schema';
import { createOuraService } from '@/lib/services/oura';
import { SyncService } from '@/lib/services/sync';

export async function POST(request: NextRequest) {
  try {
    // Initialize database
    initializeDatabase();

    // Create services
    const ouraService = createOuraService();
    const syncService = new SyncService(ouraService);

    // Get days from request or use default
    const body = await request.json().catch(() => ({}));
    const daysBack = body.daysBack || parseInt(process.env.INITIAL_SYNC_DAYS || '60');

    // Perform sync
    const result = await syncService.performFullSync(daysBack);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Sync error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function GET() {
  // Return sync status
  try {
    initializeDatabase();
    const db = require('@/lib/db/schema').default;

    const syncStatus = db.prepare('SELECT * FROM sync_status').all();

    return NextResponse.json({ syncStatus });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
