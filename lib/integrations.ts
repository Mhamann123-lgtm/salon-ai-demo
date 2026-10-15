import 'server-only';
import twilio from 'twilio';
import {google} from 'googleapis';
import {DateTime} from 'luxon';
import {TZ} from './config';

export async function sendSms(to:string,body:string){
 const {TWILIO_ACCOUNT_SID:sid,TWILIO_AUTH_TOKEN:token,TWILIO_MESSAGING_SERVICE_SID:service}=process.env;
 if(!sid||!token||!service) return {sent:false,reason:'Twilio not configured'};
 const message=await twilio(sid,token).messages.create({to,body,messagingServiceSid:service});
 return {sent:true,id:message.sid};
}
export async function appendSheet(a:{id:string;customer_name:string;phone:string;service_name:string;stylist_name:string;starts_at:string;status:string}){
 const {GOOGLE_SERVICE_ACCOUNT_EMAIL:email,GOOGLE_PRIVATE_KEY:key,GOOGLE_SHEET_ID:sheet}=process.env;
 if(!email||!key||!sheet)return {synced:false,reason:'Google Sheets not configured'};
 const auth=new google.auth.JWT({email,key:key.replace(/\\n/g,'\n'),scopes:['https://www.googleapis.com/auth/spreadsheets']});
 const sheets=google.sheets({version:'v4',auth});
 await sheets.spreadsheets.values.append({spreadsheetId:sheet,range:'Appointments!A:G',valueInputOption:'RAW',insertDataOption:'INSERT_ROWS',requestBody:{values:[[a.id,a.customer_name,a.phone,a.service_name,a.stylist_name,DateTime.fromISO(a.starts_at).setZone(TZ).toFormat('yyyy-LL-dd h:mm a'),a.status]]}});
 return {synced:true};
}
