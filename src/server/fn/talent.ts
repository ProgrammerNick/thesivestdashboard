import { createServerFn } from "@tanstack/react-start";

// Mock Data for Talent Pool
export const getTalentPool = createServerFn({ method: "GET" }).handler(async () => {
    // Ideally we fetch from DB here:
    // const users = await db.select().from(user).where(eq(user.seekingEmployment, true));

    // Returning high-quality mock data for the demo
    return [
        {
            id: "1",
            name: "Alexander V.",
            role: "Macro Strategist",
            location: "New York, NY",
            ytdReturn: "+42.5%",
            topSector: "Energy & Utilities",
            riskScore: "Low",
            seeking: true,
            skills: ["Global Macro", "Commodities", "Nuclear Thesis"],
            avatar: "https://ui-avatars.com/api/?name=Alexander+V&background=0D8ABC&color=fff"
        },
        {
            id: "2",
            name: "Sarah Chen",
            role: "Deep Value Analyst",
            location: "San Francisco, CA",
            ytdReturn: "+28.1%",
            topSector: "Technology (Hardware)",
            riskScore: "Medium",
            seeking: true,
            skills: ["Semiconductors", "Supply Chain Analysis", "Financial Modeling"],
            avatar: "https://ui-avatars.com/api/?name=Sarah+Chen&background=random"
        },
        {
            id: "3",
            name: "David K.",
            role: "Options Trader",
            location: "Chicago, IL",
            ytdReturn: "+112.4%",
            topSector: "Derivatives",
            riskScore: "High",
            seeking: true,
            skills: ["Volatility Arbitrage", "Python", "Quant Strategies"],
            avatar: "https://ui-avatars.com/api/?name=David+K&background=random"
        },
        {
            id: "4",
            name: "Elena Rodriguez",
            role: "Biotech Specialist",
            location: "Boston, MA",
            ytdReturn: "-5.2%",
            topSector: "Healthcare",
            riskScore: "High",
            seeking: true,
            skills: ["Clinical Trial Analysis", "FDA Regulations", "Small Cap"],
            avatar: "https://ui-avatars.com/api/?name=Elena+R&background=random"
        },
        {
            id: "5",
            name: "Michael Chang",
            role: "Crypto Native",
            location: "Remote",
            ytdReturn: "+210.8%",
            topSector: "Digital Assets",
            riskScore: "Very High",
            seeking: true,
            skills: ["DeFi", "On-chain Analytics", "Solidity"],
            avatar: "https://ui-avatars.com/api/?name=Michael+C&background=random"
        }
    ];
});
