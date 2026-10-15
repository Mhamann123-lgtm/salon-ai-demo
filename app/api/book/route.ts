import {NextRequest,NextResponse} from 'next/server';
import {z} from 'zod';
import {db,slots,verifyTurnstile} from '@/lib/server';
import {SERVICES,STYLISTS,TZ} from '@/lib/config';
import {DateTime} from 'luxon';
import {appendSheet,sendSms} from '@/lib/integrations';
export const runtime='nodejs';
const schema=z.object({name:z.string().trim().min(2).max(80),phone:z.string().regex(/^\+[1-9]\d{7,14}$/),service:z.string(),stylist:z.string(),date:z.string(),start:z.string(),smsConsent:z.literal(true),turnstileToken:z.string().max(4000),website:z.string().max(200).optional()});
export async function POST(req:NextRequest){
 try{
  const raw=await req.json();const parsed=schema.safeParse(raw);
  if(!parsed.success)return NextResponse.json({error:'Please check your booking details and SMS consent.'},{status:400});
  const v=parsed.data;if(v.website)return NextResponse.json({error:'Booking could not be completed'},{status:400});
  const ip=req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()||'';
  if(!await verifyTurnstile(v.turnstileToken,ip))return NextResponse.json({error:'Security check failed. Please retry.'},{status:403});
  const option=slots(v.date,v.stylist,v.service).find(s=>s.start===v.start);
  const sv=SERVICES.find(s=>s.id===v.service),st=STYLISTS.find(s=>s.id===v.stylist);
  if(!option||!sv||!st)return NextResponse.json({error:'Invalid appointment time'},{status:400});
  // Database exclusion constraint prevents concurrent overlapping reservations.
  const {data,error}=await db().from('appointments').insert({customer_name:v.name,phone:v.phone,service_id:v.service,service_name:sv.name,stylist_id:v.stylist,stylist_name:st.name,starts_at:option.start,ends_at:option.end,sms_consent:true,status:'confirmed'}).select('id,customer_name,phone,service_name,stylist_name,starts_at,status').single();
  if(error){if(error.code==='23P01')return NextResponse.json({error:'That time was just booked. Please choose another.'},{status:409});console.error('Booking database error',error);return NextResponse.json({error:'Could not save appointment'},{status:503});}
  // Booking remains confirmed if integrations fail; staff can reconcile via database.
  const when=DateTime.fromISO(data.starts_at).setZone(TZ).toFormat('ccc, LLL d at h:mm a');
  const [sms,sheet]=await Promise.allSettled([
    sendSms(v.phone,`Salon demo: confirmed ${sv.name} with ${st.name} on ${when}. Reply STOP to opt out. Contact the salon to change or cancel.`),
    appendSheet(data)
  ]);
  if(sms.status==='rejected')console.error('SMS confirmation failed',sms.reason);
  if(sheet.status==='rejected')console.error('Sheet sync failed',sheet.reason);
  return NextResponse.json({id:data.id,message:'Appointment confirmed',smsStatus:sms.status==='fulfilled'&&sms.value.sent?'sent':'pending',sheetStatus:sheet.status==='fulfilled'&&sheet.value.synced?'synced':'pending'},{status:201});
 }catch(e){console.error('Booking request failed',e);return NextResponse.json({error:'Booking unavailable. Please try again.'},{status:503});}
}
