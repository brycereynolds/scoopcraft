import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * Server-Sent Events endpoint for the admin order queue.
 * Sends a heartbeat every 20s to keep the connection alive.
 * External systems (e.g. webhooks) can POST to /api/admin/sse/notify
 * to broadcast events to all connected admin clients.
 */
export async function GET(): Promise<Response> {
  const session = await auth();

  if (!session?.user || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      // Send initial connection confirmation
      controller.enqueue(encoder.encode('event: connected\ndata: {}\n\n'));

      // Heartbeat every 20 seconds to prevent timeout
      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(': heartbeat\n\n'));
        } catch {
          clearInterval(heartbeat);
        }
      }, 20000);

      // Clean up on close
      const cleanup = () => {
        clearInterval(heartbeat);
        try {
          controller.close();
        } catch {
          // already closed
        }
      };

      // Close after 5 minutes — clients will reconnect automatically
      setTimeout(cleanup, 5 * 60 * 1000);
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
