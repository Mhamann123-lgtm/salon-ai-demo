import OpenAI from 'openai';
import { NextRequest, NextResponse } from 'next/server';
import { systemPrompt } from '../../../lib/salon';

export const runtime = 'nodejs';
const MAX_BODY_BYTES = 12000;
const MAX_MESSAGES = 12;
const MAX_MESSAGE_CHARS = 700;

export async function POST(req: NextRequest) {
  try {
    const type = req.headers.get('content-type') || '';
    if (!type.includes('application/json')) return NextResponse.json({error:'JSON required'}, {status:415});
    const contentLength = Number(req.headers.get('content-length') || '0');
    if (contentLength > MAX_BODY_BYTES) return NextResponse.json({error:'Request too large'}, {status:413});
    const raw = await req.text();
    if (raw.length > MAX_BODY_BYTES) return NextResponse.json({error:'Request too large'}, {status:413});
    const body = JSON.parse(raw);
    if (!Array.isArray(body.messages) || body.messages.length < 1 || body.messages.length > MAX_MESSAGES) return NextResponse.json({error:'Invalid conversation'}, {status:400});
    const messages = body.messages;
    if (!messages.every((m: unknown) => typeof m === 'object' && m !== null && 'role' in m && 'content' in m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string' && m.content.trim().length > 0 && m.content.length <= MAX_MESSAGE_CHARS)) return NextResponse.json({error:'Invalid messages'}, {status:400});
    if (messages[messages.length-1].role !== 'user') return NextResponse.json({error:'Last message must be from user'}, {status:400});
    if (!process.env.OPENAI_API_KEY) return NextResponse.json({error:'AI is not configured yet. Add OPENAI_API_KEY on the server.'}, {status:503});
    const client = new OpenAI({apiKey:process.env.OPENAI_API_KEY});
    const result = await client.chat.completions.create({model:process.env.OPENAI_MODEL || 'gpt-4.1-mini',temperature:0.3,max_tokens:240,messages:[{role:'system',content:systemPrompt},...messages]});
    return NextResponse.json({reply:result.choices[0]?.message?.content || 'Please visit the official website for more information.'},{headers:{'Cache-Control':'no-store'}});
  } catch (err) {
    if (err instanceof SyntaxError) return NextResponse.json({error:'Invalid JSON'}, {status:400});
    console.error('Chat request failed',err instanceof Error ? err.name : 'unknown');
    return NextResponse.json({error:'The assistant is temporarily unavailable. Please try again.'},{status:500});
  }
}
