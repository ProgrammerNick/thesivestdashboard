import { createFileRoute } from "@tanstack/react-router"
import { getJobs } from "@/server/fn/jobs";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, MapPin, Briefcase, DollarSign, Building2, ExternalLink } from "lucide-react";
import { useState } from "react";


export const Route = createFileRoute("/_dashboard/jobs")({
  component: JobBoardPage,
  loader: async () => {
    const jobs = await getJobs();
    return { jobs };
  },
});

function JobBoardPage() {
  // @ts-ignore
  const { jobs } = Route.useLoaderData();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredJobs = jobs.filter((job: any) =>
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.tags.some((tag: string) => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold flex items-center gap-2">
            <Briefcase className="w-8 h-8 text-primary" />
            Job Board
          </h1>
          <p className="text-muted-foreground mt-1">
            Find roles at top funds that value your verified performance.
          </p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search roles, funds, or skills (e.g. 'Macro')..."
            className="pl-10 h-10"
            value={searchTerm}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Job Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="full-time">Full-time</SelectItem>
            <SelectItem value="contract">Contract</SelectItem>
            <SelectItem value="internship">Internship</SelectItem>
          </SelectContent>
        </Select>
        <Select>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Location" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Anywhere</SelectItem>
            <SelectItem value="remote">Remote</SelectItem>
            <SelectItem value="ny">New York</SelectItem>
            <SelectItem value="london">London</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Job List */}
      <div className="grid gap-4">
        {filteredJobs.map((job: any) => (
          <Card key={job.id} className="hover:shadow-md transition-all group border-l-4 hover:border-l-primary cursor-pointer">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Logo */}
                <div className="w-16 h-16 rounded-lg bg-muted flex-shrink-0 overflow-hidden border">
                  <img src={job.logo} alt={job.company} className="w-full h-full object-cover" />
                </div>

                {/* Info */}
                <div className="flex-1 space-y-2">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                    <div>
                      <h3 className="text-xl font-bold group-hover:text-primary transition-colors">{job.title}</h3>
                      <div className="flex items-center gap-2 text-muted-foreground font-medium text-sm mt-1">
                        <Building2 className="w-3.5 h-3.5" />
                        {job.company}
                        <span className="text-border mx-1">|</span>
                        <MapPin className="w-3.5 h-3.5" />
                        {job.location}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Badge variant="secondary">{job.type}</Badge>
                      <span className="text-muted-foreground">{job.posted}</span>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground line-clamp-2 pr-4">{job.description}</p>

                  <div className="flex flex-wrap items-center gap-4 pt-2">
                    <div className="flex items-center text-sm font-medium text-green-600 bg-green-50 px-2 py-1 rounded">
                      <DollarSign className="w-3.5 h-3.5 mr-1" />
                      {job.salary}
                    </div>
                    <div className="flex gap-2">
                      {job.tags.map((tag: string) => (
                        <Badge key={tag} variant="outline" className="text-xs font-normal">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Action */}
                <div className="flex flex-col justify-center min-w-[120px]">
                  <Button asChild>
                    <a href={job.externalUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                      Apply <ExternalLink className="w-4 h-4" />
                    </a>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
