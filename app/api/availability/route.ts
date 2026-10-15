import {NextRequest,NextResponse} from 'next/server';
import {availableSlots} from '@/lib/server';
export const runtime='nodejs';
export async function GET(req:NextRequest){
 try{
  const p=req.nextUrl.searchParams;
  const date=p.get('date')||'',stylist=p.get('stylist')||'',service=p.get('service')||'';
  const slots=await availableSlots(date,stylist,service);
  return NextResponse.json({slots},{headers:{'Cache-Control':'no-store'}});
 }catch(e){console.error('Availability failed',e);return NextResponse.json({error:'Availability unavailable'},{status:503});}
}
