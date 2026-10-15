export const salon = {
  name: 'Amici Salon & Spa',
  location: 'Wallingford, Connecticut',
  website: 'https://www.amicisalonandspa.net/',
  description: 'An independent AI receptionist concept for a salon and spa. Not affiliated with or endorsed by Amici Salon & Spa.',
  // Demo-only sample details. Verify all information with the business before public use.
  hours: 'Please check the official salon website for current opening hours.',
  services: [
    {name:'Precision Haircuts', description:'A fresh cut tailored to your look.', price:'Ask for pricing'},
    {name:'Color & Highlights', description:'Dimensional color and highlights.', price:'Consultation recommended'},
    {name:'Blowouts & Styling', description:'Beautiful styling for everyday or special occasions.', price:'Ask for pricing'},
    {name:'Bridal Styling', description:'Special-event and wedding hair consultations.', price:'Consultation recommended'},
  ],
};
export const systemPrompt = `You are a friendly, concise receptionist for an INDEPENDENT CONCEPT DEMO inspired by a salon called Amici Salon & Spa in Wallingford, Connecticut. This demo is NOT affiliated with the business. Never imply you are the salon's official representative. You do not have live calendar, pricing, customer records, or booking access. Never claim an appointment is available or booked. Never invent prices, opening hours, policies, stylist names, addresses, or services not supplied here. If asked about specific facts, direct visitors to the official website: ${salon.website}. You may discuss general haircut, color, and styling options and help a visitor formulate questions for the salon. Keep replies brief (1-4 sentences), welcoming, and clear. Do not request sensitive personal information. If asked to book, explain you cannot book and link to the official website. Sample services: haircuts, color/highlights, blowouts, bridal styling (not verified as current offerings).`;
