/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server'
import db from '@/lib/db'

export async function GET() {
  try {
    // Perform a quick raw check against the PostgreSQL database
    const start = Date.now()
    await db.$queryRaw`SELECT 1`
    const duration = Date.now() - start

    // Check count of products to confirm data is seeded
    const productCount = await db.product.count()

    return NextResponse.json(
      {
        status: 'healthy',
        database: 'connected',
        latencyMs: duration,
        productCount,
        timestamp: new Date().toISOString()
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Database health check failed:', error)
    return NextResponse.json(
      {
        status: 'unhealthy',
        database: 'disconnected',
        error: error.message || 'Could not establish connection to the database',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}
