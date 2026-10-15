export const TZ = 'America/New_York';
// DEMO data: replace with each salon's approved services, staff and working hours.
export const SERVICES = [
  {id:'cut', name:'Haircut & Style', minutes:60, price:'Consult salon'},
  {id:'mens', name:"Men’s Haircut", minutes:30, price:'Consult salon'},
  {id:'blowout', name:'Wash & Blowout', minutes:45, price:'Consult salon'},
  {id:'color', name:'Hair Color', minutes:120, price:'Consult salon'},
  {id:'highlights', name:'Highlights', minutes:150, price:'Consult salon'},
] as const;
export const STYLISTS = [
  {id:'stylist-a',name:'Stylist A'},
  {id:'stylist-b',name:'Stylist B'},
  {id:'stylist-c',name:'Stylist C'},
] as const;
// 0 = Sunday, 1 = Monday; illustrative shop hours. Each stylist has same hours in this starter.
export const HOURS: Record<number, {open:string;close:string}|null> = {
  0:null, 1:null, 2:{open:'09:00',close:'18:00'},3:{open:'09:00',close:'18:00'},
  4:{open:'09:00',close:'19:00'},5:{open:'09:00',close:'18:00'},6:{open:'09:00',close:'16:00'}
};
