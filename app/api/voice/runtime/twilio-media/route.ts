import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json(
    {
      status: 'websocket-required',
      message: 'Twilio Media Streams must connect to the Pipecat websocket worker at this path.',
    },
    { status: 426 },
  );
}
