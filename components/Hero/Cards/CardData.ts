export interface CardData {
  title: string;
  description: string;
  icon?: React.ReactNode;
  href: string;
}

export const cardsData: CardData[] = [
  {
    title: "Order Booker AI Assistant",
    description: "Automate order management and customer inquiries with intelligent conversational AI",
    href: "/buy?service=Order%20Booker%20AI%20Assistant",
  },
  {
    title: "AI Lead Qualification System",
    description: "Qualify leads automatically and prioritize high-value prospects for your sales team",
    href: "/buy?service=AI%20Lead%20Qualification%20System",
  },
  {
    title: "Customer Support AI Agent",
    description: "24/7 intelligent customer support that learns from your business context",
    href: "/buy?service=Customer%20Support%20AI%20Agent",
  },
  {
    title: "Invoice Processing Automation",
    description: "Extract, validate, and process invoices automatically with AI precision",
    href: "/buy?service=Invoice%20Processing%20Automation",
  },
  {
    title: "CRM Sync & Cleanup Automation",
    description: "Keep your CRM data clean and synchronized across all business systems",
    href: "/buy?service=CRM%20Sync%20%26%20Cleanup%20Automation",
  },
  {
    title: "Data Intelligence Engine",
    description: "Transform raw data into actionable insights with AI-powered analytics",
    href: "/buy?service=Data%20Intelligence%20Engine",
  },
];
