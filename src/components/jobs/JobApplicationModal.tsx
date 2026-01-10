import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle2, ChevronRight, PieChart, ShieldCheck } from "lucide-react";
import { useState } from "react";

interface JobApplicationModalProps {
    job: any;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    userPortfolios?: any[];
    userPosts?: any[];
}

export function JobApplicationModal({ job, open, onOpenChange, userPortfolios = [], userPosts = [] }: JobApplicationModalProps) {
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);

    // Form state
    const [selectedPortfolioId, setSelectedPortfolioId] = useState<string | null>(null);
    const [selectedPostId, setSelectedPostId] = useState<string | null>(null);

    // Reset state when opening a new job
    // Note: In a real app we might use useEffect to reset when `job` changes, 
    // but here the modal unmounts/remounts often or we can just rely on manual open.

    const handleSubmit = async () => {
        setIsLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        setIsLoading(false);
        setStep(3); // Success
    };

    if (!job) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>
                        {step === 1 && `Apply for ${job.title}`}
                        {step === 2 && "Review Application"}
                        {step === 3 && "Application Sent!"}
                    </DialogTitle>
                    <DialogDescription>
                        {step === 1 && (
                            <>
                                Applying to <span className="font-semibold text-foreground">{job.company}</span>.
                                Your profile and verified stats will be shared.
                            </>
                        )}
                        {step === 2 && "Confirm your details before submitting."}
                        {step === 3 && "Your application has been successfully submitted."}
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4">
                    {step === 1 && (
                        <div className="space-y-6">
                            {/* Portfolio Selector */}
                            <div className="space-y-3">
                                <Label className="text-base font-semibold">Attach a Portfolio (Optional)</Label>
                                <p className="text-sm text-muted-foreground">Select a portfolio that demonstrates your competence for this strategy.</p>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[200px] overflow-y-auto">
                                    {userPortfolios.length > 0 ? (
                                        userPortfolios.map((p) => (
                                            <SelectorCard
                                                key={p.id}
                                                icon={<PieChart className={`w-5 h-5 ${selectedPortfolioId === p.id ? "text-green-600" : "text-muted-foreground"}`} />}
                                                title={p.name}
                                                detail={p.snapshots?.[0]?.totalValue ? `$${Number(p.snapshots[0].totalValue).toLocaleString()}` : "No Data"}
                                                selected={selectedPortfolioId === p.id}
                                                onClick={() => setSelectedPortfolioId(selectedPortfolioId === p.id ? null : p.id)}
                                            />
                                        ))
                                    ) : (
                                        <div className="col-span-2 text-sm text-center p-4 border rounded-lg bg-muted/20 text-muted-foreground">
                                            No portfolios found. Create one in your dashboard to apply.
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Research Selector */}
                            <div className="space-y-3">
                                <Label className="text-base font-semibold">Featured Research</Label>
                                <Select onValueChange={setSelectedPostId}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select your best thesis..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {userPosts.length > 0 ? (
                                            userPosts.map((post) => (
                                                <SelectItem key={post.id} value={post.id}>
                                                    {post.title}
                                                </SelectItem>
                                            ))
                                        ) : (
                                            <SelectItem value="none" disabled>No research posts found</SelectItem>
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-3">
                                <Label htmlFor="cover">Cover Note (Optional)</Label>
                                <Textarea id="cover" placeholder="Briefly explain why you're a good fit..." className="h-24" />
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-4">
                            <div className="bg-muted/50 p-4 rounded-lg space-y-3">
                                <ReviewItem label="Role" value={job.title} />
                                <ReviewItem label="Company" value={job.company} />
                                <hr className="border-border/50" />
                                <ReviewItem
                                    label="Attached Portfolio"
                                    value={selectedPortfolioId ? userPortfolios.find(p => p.id === selectedPortfolioId)?.name : "None (Optional)"}
                                    highlight={!!selectedPortfolioId}
                                />
                                <ReviewItem
                                    label="Featured Research"
                                    value={userPosts.find(p => p.id === selectedPostId)?.title || "None Selected"}
                                />
                            </div>
                            {selectedPortfolioId && (
                                <div className="flex items-start gap-3 p-3 bg-blue-500/10 text-blue-600 rounded-md text-sm">
                                    <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                                    <p>Your trade history for the attached portfolio will be visible to the hiring team at {job.company}.</p>
                                </div>
                            )}
                        </div>
                    )}

                    {step === 3 && (
                        <div className="text-center space-y-4 py-4">
                            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle2 className="w-8 h-8" />
                            </div>
                            <p className="text-muted-foreground max-w-sm mx-auto">
                                {job.company} has received your application. You can track status in your dashboard.
                            </p>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    {step === 1 && (
                        <>
                            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                            <Button onClick={() => setStep(2)}>
                                Next Step <ChevronRight className="w-4 h-4 ml-2" />
                            </Button>
                        </>
                    )}
                    {step === 2 && (
                        <>
                            <Button variant="ghost" onClick={() => setStep(1)}>Back</Button>
                            <Button onClick={handleSubmit} disabled={isLoading}>
                                {isLoading ? "Submitting..." : "Submit Application"}
                            </Button>
                        </>
                    )}
                    {step === 3 && (
                        <Button onClick={() => onOpenChange(false)} className="w-full sm:w-auto">
                            Return to Job Board
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function SelectorCard({ icon, title, detail, selected, onClick }: any) {
    return (
        <div
            onClick={onClick}
            className={`p-4 border rounded-lg cursor-pointer transition-all flex items-center gap-3 ${selected ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'hover:border-primary/50'}`}
        >
            <div className="p-2 bg-background rounded-md border shadow-sm">
                {icon}
            </div>
            <div>
                <div className="font-semibold text-sm">{title}</div>
                <div className="text-xs text-muted-foreground">{detail}</div>
            </div>
            {selected && <CheckCircle2 className="w-4 h-4 text-primary ml-auto" />}
        </div>
    )
}

function ReviewItem({ label, value, highlight }: any) {
    return (
        <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{label}</span>
            <span className={`font-medium ${highlight ? 'text-primary' : ''}`}>{value}</span>
        </div>
    )
}
