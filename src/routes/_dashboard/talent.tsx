import { createFileRoute, Link } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { auth } from "@/lib/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Briefcase, TrendingUp, ShieldCheck, MapPin } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLoaderData } from "@tanstack/react-router";
import { useState } from "react";

// Mock Data / Server Function
const getTalentPool = createServerFn({ method: "GET" }).handler(async () => {
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

export const Route = createFileRoute("/_dashboard/talent")({
  component: TalentPage,
  loader: () => getTalentPool(),
});

function TalentPage() {
  const talent = useLoaderData({ from: "/_dashboard/talent" });
  const [searchTerm, setSearchTerm] = useState("");

  const filteredTalent = talent.filter(t =>
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.skills.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold flex items-center gap-2">
            <Briefcase className="w-8 h-8 text-primary" />
            Talent & Jobs
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your recruiting pipeline and open positions.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">Saved Candidates</Button>
          <Button asChild><Link to="/_dashboard/jobs">View Job Board</Link></Button>
        </div>
      </div>

      <Tabs defaultValue="talent" className="space-y-6">
        <TabsList>
          <TabsTrigger value="talent">Talent Search</TabsTrigger>
          <TabsTrigger value="jobs">My Jobs</TabsTrigger>
          <TabsTrigger value="applications">Incoming Applications</TabsTrigger>
        </TabsList>

        {/* Talent Search Tab */}
        <TabsContent value="talent" className="space-y-6">
          {/* Search and Filter */}
          <Card>
            <CardContent className="pt-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search by name, role, skill (e.g. 'Semiconductors')..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Talent List */}
          <div className="grid gap-6">
            {filteredTalent.map((candidate) => (
              <Card key={candidate.id} className="overflow-hidden hover:shadow-md transition-shadow">
                <CardContent className="p-0">
                  <div className="flex flex-col md:flex-row">
                    {/* Left: Profile Info */}
                    <div className="p-6 flex-1 flex gap-6 items-start">
                      <Avatar className="w-16 h-16 border-2 border-primary/10">
                        <AvatarImage src={candidate.avatar} />
                        <AvatarFallback>{candidate.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="space-y-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-xl font-bold hover:underline cursor-pointer">{candidate.name}</h3>
                            {candidate.seeking && (
                              <Badge variant="secondary" className="text-xs bg-green-500/10 text-green-600 hover:bg-green-500/20 shadow-none border-0">
                                Open to Work
                              </Badge>
                            )}
                          </div>
                          <p className="text-primary font-medium">{candidate.role}</p>
                          <div className="flex items-center text-sm text-muted-foreground mt-1">
                            <MapPin className="w-3 h-3 mr-1" /> {candidate.location}
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {candidate.skills.map(skill => (
                            <Badge key={skill} variant="outline" className="text-xs font-normal">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Middle: Stats */}
                    <div className="p-6 md:border-l md:border-r bg-muted/30 min-w-[250px] space-y-4">
                      <div>
                        <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">YTD Return</div>
                        <div className={`text-2xl font-bold font-mono ${candidate.ytdReturn.startsWith('+') ? 'text-green-600' : 'text-red-500'}`}>
                          {candidate.ytdReturn}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-xs text-muted-foreground">Top Sector</div>
                          <div className="font-semibold text-sm">{candidate.topSector}</div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">Risk Score</div>
                          <div className="font-semibold text-sm">{candidate.riskScore}</div>
                        </div>
                      </div>
                    </div>

                    {/* Right: Action */}
                    <div className="p-6 flex flex-col justify-center gap-3 md:w-[200px]">
                      <Button className="w-full">Message</Button>
                      <Button variant="ghost" className="w-full">View Full Profile</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* My Jobs Tab */}
        <TabsContent value="jobs">
          <Card>
            <CardHeader>
              <CardTitle>Active Job Listings</CardTitle>
              <CardDescription>Manage your current open positions.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border rounded-lg p-4 flex justify-between items-center">
                  <div>
                    <div className="font-bold text-lg">Senior Equity Analyst</div>
                    <div className="text-muted-foreground">New York • Full-time • Posted 3 days ago</div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="secondary" size="sm">Edit</Button>
                    <Button variant="outline" size="sm" className="text-red-500 hover:text-red-600">Close</Button>
                  </div>
                </div>
                <Button className="w-full border-dashed" variant="outline">+ Post New Job</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Applications Tab */}
        <TabsContent value="applications">
          <Card>
            <CardHeader>
              <CardTitle>Incoming Applications</CardTitle>
              <CardDescription>Review candidates who have applied to your roles.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Candidate</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Applied</TableHead>
                    <TableHead>Match Score</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src="https://ui-avatars.com/api/?name=John+D" />
                          <AvatarFallback>JD</AvatarFallback>
                        </Avatar>
                        John Doe
                      </div>
                    </TableCell>
                    <TableCell>Senior Equity Analyst</TableCell>
                    <TableCell>2 hrs ago</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        98% Match
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="sm">Review Portfolio</Button>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src="https://ui-avatars.com/api/?name=Alice+W" />
                          <AvatarFallback>AW</AvatarFallback>
                        </Avatar>
                        Alice Wang
                      </div>
                    </TableCell>
                    <TableCell>Senior Equity Analyst</TableCell>
                    <TableCell>1 day ago</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                        75% Match
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="sm">Review Portfolio</Button>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
