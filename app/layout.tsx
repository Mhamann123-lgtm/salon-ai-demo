import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {title:'Salon AI Receptionist | Independent Concept Demo',description:'A standalone salon AI receptionist concept. Not affiliated with Amici Salon & Spa.',robots:{index:false,follow:false}};
export default function RootLayout({children}:{children:React.ReactNode}) {return <html lang="en"><body>{children}</body></html>}
