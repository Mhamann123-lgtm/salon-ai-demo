'use client';
import {useEffect,useState} from 'react';
import Script from 'next/script';
import {SERVICES,STYLISTS} from '@/lib/config';

type Slot={start:string;end:string;label:string};
declare global {interface Window {turnstile?:{render:(el:HTMLElement,opts:{sitekey:string;callback:(token:string)=>void;'expired-callback':()=>void})=>string;reset:(id?:string)=>void}}}
export default function Page(){
 const [service,setService]=useState<string>(SERVICES[0].id),[stylist,setStylist]=useState<string>(STYLISTS[0].id);
 const [date,setDate]=useState(''),[slots,setSlots]=useState<Slot[]>([]),[start,setStart]=useState('');
 const [name,setName]=useState(''),[phone,setPhone]=useState(''),[consent,setConsent]=useState(false);
 const [token,setToken]=useState(''),[loading,setLoading]=useState(false),[saving,setSaving]=useState(false),[message,setMessage]=useState(''),[success,setSuccess]=useState(false);
 const siteKey=process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
 useEffect(()=>{setDate(new Date().toLocaleDateString('en-CA',{timeZone:'America/New_York'}))},[]);
 useEffect(()=>{
  if(!date)return;
  const controller=new AbortController();setLoading(true);setStart('');setMessage('');
  fetch(`/api/availability?${new URLSearchParams({date,service,stylist})}`,{signal:controller.signal})
   .then(async r=>{if(!r.ok)throw new Error('Could not load times');return r.json()})
   .then(x=>setSlots(x.slots||[])).catch(e=>{if(e.name!=='AbortError'){setSlots([]);setMessage('Times unavailable. Please try again.')}}).finally(()=>setLoading(false));
  return ()=>controller.abort();
 },[date,service,stylist]);
 useEffect(()=>{
  if(!siteKey)return;
  let active=true,widget:string|undefined;
  const attempt=()=>{const el=document.getElementById('turnstile-widget');if(!active||!el||!window.turnstile||el.hasChildNodes())return false;
   widget=window.turnstile.render(el,{sitekey:siteKey,callback:setToken,'expired-callback':()=>setToken('')});return true;};
  if(attempt())return()=>{active=false};
  const t=setInterval(()=>{if(attempt())clearInterval(t)},300);
  return()=>{active=false;clearInterval(t);if(widget)window.turnstile?.reset(widget)};
 },[siteKey]);
 async function submit(e:React.FormEvent){e.preventDefault();setMessage('');setSuccess(false);
  if(!start){setMessage('Choose an available time.');return}
  if(siteKey&&!token){setMessage('Complete the security check.');return}
  setSaving(true);
  try{const r=await fetch('/api/book',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name,phone,service,stylist,date,start,smsConsent:consent,turnstileToken:token,website:''})});
   const x=await r.json();if(!r.ok)throw new Error(x.error||'Booking failed');
   setSuccess(true);setMessage(`Appointment confirmed! Reference: ${x.id}. ${x.smsStatus==='sent'?'Confirmation text sent.':'Text delivery not yet confirmed; contact the salon if needed.'}`);
   setSlots(old=>old.filter(s=>s.start!==start));setStart('');
  }catch(e){setMessage(e instanceof Error?e.message:'Could not book. Try again.')}finally{setSaving(false);setToken('');window.turnstile?.reset()}
 }
 return <>
  {siteKey&&<Script src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit" strategy="afterInteractive"/>}
  <header className="top"><a className="logo" href="#home">STUDIO <span>BOOKING</span></a><nav><a href="#services">Services</a><a href="#book">Book online</a><a href="#about">About</a></nav></header>
  <main id="home">
   <section className="hero"><div className="heroContent"><p className="eyebrow">THE MODERN SALON EXPERIENCE</p><h1>Beautiful hair.<br/><em>Effortless booking.</em></h1><p>Choose a service, find an open time, and book in minutes. A clean appointment experience designed for salons and their clients.</p><a className="cta" href="#book">Reserve your time <span>↗</span></a></div><div className="heroArt"><div className="heroArtInner">S<span>✦</span></div></div></section>
   <section className="intro" id="services"><p className="eyebrow">OUR SERVICES</p><h2>Make time for yourself.</h2><div className="services">{SERVICES.map((s,i)=><div className="service" key={s.id}><span>0{i+1}</span><div><h3>{s.name}</h3><p>{s.minutes} minutes · Price confirmed by salon</p></div><span>↗</span></div>)}</div></section>
   <section className="bookingSection" id="book"><div className="bookingCopy"><p className="eyebrow">BOOK AN APPOINTMENT</p><h2>Your next visit<br/><em>starts here.</em></h2><p>Select a service and stylist, then choose an available appointment. Bookings are stored securely and the salon team can view its schedule.</p><p className="note">Independent concept demo. Not affiliated with Amici Salon & Spa. Staff, hours, and services are examples and must be approved before public use.</p></div><form className="bookingCard" onSubmit={submit}>
     <h3>Find your appointment</h3><p className="sub">Your salon experience, on your schedule.</p>
     <div className="two"><label>Service<select value={service} onChange={e=>setService(e.target.value)}>{SERVICES.map(s=><option key={s.id} value={s.id}>{s.name} · {s.minutes} min</option>)}</select></label><label>Stylist<select value={stylist} onChange={e=>setStylist(e.target.value)}>{STYLISTS.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></label></div>
     <label>Date<input type="date" required value={date} onChange={e=>setDate(e.target.value)}/></label>
     <div className="timeTitle">Available times {loading&&<small>Loading...</small>}</div>
     <div className="slots">{slots.map(s=><button type="button" className={start===s.start?'chosen':''} key={s.start} onClick={()=>setStart(s.start)}>{s.label}</button>)}{!loading&&slots.length===0&&<p>No times available for this selection.</p>}</div>
     <div className="two"><label>Your name<input required maxLength={80} value={name} onChange={e=>setName(e.target.value)} placeholder="First and last name"/></label><label>Mobile number<input required type="tel" value={phone} onChange={e=>setPhone(e.target.value)} placeholder="+12035550123"/></label></div>
     <label className="consent"><input type="checkbox" checked={consent} onChange={e=>setConsent(e.target.checked)} required/><span>I agree to receive appointment confirmation and reminder texts at this number. Message/data rates may apply. Reply STOP to opt out. Consent is optional for marketing; this form sends only appointment-related messages.</span></label>
     <div className="trap" aria-hidden="true"><label>Website<input tabIndex={-1} autoComplete="off" name="website"/></label></div>
     {siteKey&&<div id="turnstile-widget"/>}
     <button className="submit" disabled={saving||loading||!start||!consent} type="submit">{saving?'Confirming...':'Confirm appointment'} <span>→</span></button>
     {message&&<p className={success?'success':'error'} role="status">{message}</p>}
     <p className="fine">Appointments are not final until you see a confirmation. For changes or cancellations, contact the salon directly.</p>
    </form></section>
   <section id="about" className="footerIntro"><p className="eyebrow">MADE FOR SALONS</p><h2>More time behind the chair.<br/><em>Less time on the phone.</em></h2><p>Automatic confirmations, staff schedules, and next-day text reminders, all without an AI chatbot.</p></section>
  </main><footer>INDEPENDENT SALON BOOKING CONCEPT <span>Built with Next.js · Supabase · Twilio</span></footer>
 </>;
}
