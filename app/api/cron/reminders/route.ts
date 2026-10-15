import {NextRequest,NextResponse} from 'next/server';
import {DateTime} from 'luxon';
import {db} from '@/lib/server';
import {sendSms} from '@/lib/integrations';
import {TZ} from '@/lib/config';
export const runtime='nodejs';
export async function GET(req:NextRequest){
 if(!process.env.CRON_SECRET||req.headers.get('authorization')!==`Bearer ${process.env.CRON_SECRET}`)return NextResponse.json({error:'Unauthorized'},{status:401});
 try{
  // Daily cron at 13:00 UTC; next-day reminders (not precisely 24 hours).
  const next=DateTime.now().setZone(TZ).plus({days:1}).startOf('day');
  const {data,error}=await db().from('appointments').select('id,phone,service_name,stylist_name,starts_at').eq('status','confirmed').eq('sms_consent',true).is('reminder_sent_at',null).gte('starts_at',next.toUTC().toISO()!).lt('starts_at',next.plus({days:1}).toUTC().toISO()!).limit(100);
  if(error)throw error;
  let sent=0,failed=0;
  for(const a of data||[]){
   // Claim the row before sending, preventing duplicate sends on concurrent cron runs.
   const {data:claimed,error:claimError}=await db().from('appointments').update({reminder_sent_at:new Date().toISOString()}).eq('id',a.id).is('reminder_sent_at',null).select('id').maybeSingle();
   if(claimError||!claimed)continue;
   try{
    const when=DateTime.fromISO(a.starts_at).setZone(TZ).toFormat('ccc, LLL d at h:mm a');
    const r=await sendSms(a.phone,`Salon demo reminder: ${a.service_name} with ${a.stylist_name} tomorrow, ${when}. Contact the salon for changes. Reply STOP to opt out.`);
    if(!r.sent)throw new Error('SMS not configured');sent++;
   }catch(e){failed++;console.error('Reminder send failed',a.id,e);await db().from('appointments').update({reminder_sent_at:null}).eq('id',a.id);}
  }
  return NextResponse.json({processed:(data||[]).length,sent,failed});
 }catch(e){console.error('Reminder cron failed',e);return NextResponse.json({error:'Reminder job failed'},{status:500});}
}
