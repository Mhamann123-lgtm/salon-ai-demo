import 'server-only';
import {createClient} from '@supabase/supabase-js';
import {DateTime} from 'luxon';
import {HOURS,SERVICES,STYLISTS,TZ} from './config';

export function db(){
  const url=process.env.SUPABASE_URL, key=process.env.SUPABASE_SERVICE_ROLE_KEY;
  if(!url||!key) throw new Error('Supabase server environment is not configured');
  return createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
}
export function slots(date:string,stylist:string,service:string){
  const sv=SERVICES.find(x=>x.id===service), st=STYLISTS.find(x=>x.id===stylist);
  const day=DateTime.fromISO(date,{zone:TZ});
  if(!sv||!st||!day.isValid||day.toISODate()!==date) return [];
  const today=DateTime.now().setZone(TZ);
  if(day.startOf('day')<today.startOf('day')||day.startOf('day')>today.plus({days:60}).startOf('day'))return [];
  const h=HOURS[day.weekday%7];if(!h)return [];
  let cursor=DateTime.fromISO(`${date}T${h.open}`,{zone:TZ});
  const closing=DateTime.fromISO(`${date}T${h.close}`,{zone:TZ});
  const out:{start:string;end:string;label:string}[]=[];
  while(cursor.plus({minutes:sv.minutes})<=closing){
    if(cursor>today.plus({minutes:60})) out.push({start:cursor.toUTC().toISO()!,end:cursor.plus({minutes:sv.minutes}).toUTC().toISO()!,label:cursor.toFormat('h:mm a')});
    cursor=cursor.plus({minutes:30});
  }
  return out;
}
export async function availableSlots(date:string,stylist:string,service:string){
  const possible=slots(date,stylist,service);if(!possible.length)return [];
  const start=possible[0].start;
  const end=possible[possible.length-1].end;
  const {data,error}=await db().from('appointments').select('starts_at,ends_at').eq('stylist_id',stylist).eq('status','confirmed').lt('starts_at',end).gt('ends_at',start);
  if(error)throw error;
  return possible.filter(s=>!(data||[]).some(b=>new Date(b.starts_at)<new Date(s.end)&&new Date(b.ends_at)>new Date(s.start)));
}
export async function verifyTurnstile(token:string,ip:string){
  const secret=process.env.TURNSTILE_SECRET_KEY;
  if(!secret)return process.env.NODE_ENV!=='production';
  if(!token)return false;
  const body=new URLSearchParams({secret,response:token,remoteip:ip});
  const r=await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify',{method:'POST',body,cache:'no-store'});
  if(!r.ok)return false;
  const data=await r.json();return data.success===true;
}
