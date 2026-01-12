import { createServerFn } from "@tanstack/react-start";

// Mock Data for Job Listings
export const getJobs = createServerFn({ method: "GET" }).handler(async () => {
    return [
        {
            id: "1",
            title: "Equity Research Analyst (TMT)",
            company: "BlueRidge Capital",
            location: "New York, NY",
            type: "Full-time",
            salary: "$150k - $250k",
            posted: "2 days ago",
            logo: "https://ui-avatars.com/api/?name=BlueRidge+Capital&background=0D8ABC&color=fff",
            tags: ["TMT", "L/S Equity", "Modeling"],
            description: "Seeking an analyst with deep conviction in the semiconductor space. Must have a proven track record of generating alpha.",
            externalUrl: "https://example.com/apply/1"
        },
        {
            id: "2",
            title: "Junior Macro Trader",
            company: "Atlas Global",
            location: "London, UK (Remote Option)",
            type: "Full-time",
            salary: "$120k - $200k + Bonus",
            posted: "5 hours ago",
            logo: "https://ui-avatars.com/api/?name=Atlas+Global&background=random",
            tags: ["Macro", "FX", "Commodities"],
            description: "Join our global macro desk. We value independent thinkers who can navigate volatility.",
            externalUrl: "https://example.com/apply/2"
        },
        {
            id: "3",
            title: "Crypto Quant Researcher",
            company: "DeFi Params",
            location: "Remote",
            type: "Contract",
            salary: "$150/hr",
            posted: "1 day ago",
            logo: "https://ui-avatars.com/api/?name=DeFi+Params&background=random",
            tags: ["DeFi", "Solidity", "Python"],
            description: "Looking for a researcher to design AMM bonding curves and governance mechanisms.",
            externalUrl: "https://example.com/apply/3"
        },
        {
            id: "4",
            title: "Investment Intern",
            company: "Sequoia Heritage",
            location: "Menlo Park, CA",
            type: "Internship",
            salary: "$8k/month",
            posted: "1 week ago",
            logo: "https://ui-avatars.com/api/?name=Sequoia+Heritage&background=random",
            tags: ["Venture", "Growth", "Research"],
            description: "Summer internship for students passionate about long-term compounding and business quality.",
            externalUrl: "https://example.com/apply/4"
        }
    ];
});
