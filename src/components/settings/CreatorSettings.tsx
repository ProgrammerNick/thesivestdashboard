import { useState } from "react";
import { useRouter } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { updateUserProfile } from "@/server/fn/users";
import { togglePortfolioVisibility } from "@/server/fn/portfolio";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, DollarSign, Eye, EyeOff, Unlock, TrendingUp, Star, Share2 } from "lucide-react";

interface CreatorSettingsProps {
    user: any;
    portfolios: any[];
    posts: any[];
}

export function CreatorSettings({ user, portfolios, posts }: CreatorSettingsProps) {
    const router = useRouter();
    const [premiumEnabled, setPremiumEnabled] = useState(user.premiumContentEnabled || false);
    const [isUpdatingPremium, setIsUpdatingPremium] = useState(false);
    const [togglingPortfolio, setTogglingPortfolio] = useState<string | null>(null);
    const [isUpdatingFeatured, setIsUpdatingFeatured] = useState(false);

    const updateProfile = useMutation({
        mutationFn: updateUserProfile,
        onSuccess: () => {
            router.invalidate();
        },
        onError: () => console.error("Failed to update settings")
    });

    const toggleVisibility = useMutation({
        mutationFn: togglePortfolioVisibility,
        onSuccess: () => {
            router.invalidate();
        },
        onError: () => console.error("Failed to update portfolio")
    });

    const handlePremiumToggle = async (checked: boolean) => {
        setPremiumEnabled(checked);
        setIsUpdatingPremium(true);
        try {
            await updateProfile.mutateAsync({
                data: { premiumContentEnabled: checked }
            });
        } finally {
            setIsUpdatingPremium(false);
        }
    };

    const handlePortfolioToggle = async (portfolioId: string, currentStatus: boolean) => {
        setTogglingPortfolio(portfolioId);
        try {
            await toggleVisibility.mutateAsync({
                data: { portfolioId, isPublic: !currentStatus }
            });
        } finally {
            setTogglingPortfolio(null);
        }
    };

    const handleFeaturedPostChange = async (postId: string) => {
        setIsUpdatingFeatured(true);
        try {
            await updateProfile.mutateAsync({
                data: { featuredPostId: postId === "none" ? null : postId }
            });
        } finally {
            setIsUpdatingFeatured(false);
        }
    };

    const copyProfileLink = () => {
        const url = `${window.location.origin}/profiles/${user.id}`;
        navigator.clipboard.writeText(url);
    };

    return (
        <div className="space-y-8">
            {/* Featured Section */}
            <Card className="border-primary/20 bg-primary/5">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Star className="w-5 h-5 text-primary" />
                        <CardTitle>Featured Investment Thesis</CardTitle>
                    </div>
                    <CardDescription>
                        Select your "Best Pitch" to highlight at the top of your public profile (Investor CV).
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex flex-col gap-4">
                        <div className="space-y-2">
                            <Label>Select a Post</Label>
                            <Select
                                disabled={isUpdatingFeatured}
                                onValueChange={handleFeaturedPostChange}
                                defaultValue={user.featuredPostId || "none"}
                            >
                                <SelectTrigger className="w-full bg-background">
                                    <SelectValue placeholder="Select a thesis to feature" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">None (Hidden)</SelectItem>
                                    {posts && posts.length > 0 ? (
                                        posts.map((post) => (
                                            <SelectItem key={post.id} value={post.id}>
                                                <span className="flex items-center gap-2 truncate">
                                                    <span className="truncate max-w-[200px] md:max-w-md">{post.title}</span>
                                                    {post.type && <Badge variant="outline" className="text-[10px] h-5">{post.type}</Badge>}
                                                </span>
                                            </SelectItem>
                                        ))
                                    ) : (
                                        <div className="p-2 text-sm text-muted-foreground text-center">
                                            No posts found. Write a thesis first!
                                        </div>
                                    )}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-primary/10">
                            <div className="text-sm text-muted-foreground">
                                Share your Investor CV with the world.
                            </div>
                            <Button onClick={copyProfileLink} variant="outline" className="gap-2">
                                <Share2 className="w-4 h-4" />
                                Copy Link to Profile
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Monetization Section */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <DollarSign className="w-5 h-5 text-primary" />
                        <CardTitle>Monetization</CardTitle>
                    </div>
                    <CardDescription>
                        Earn directly from your research and insights.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 border border-border rounded-lg bg-card/50">
                        <div className="space-y-1">
                            <Label className="text-base font-medium">Enable Paid Content</Label>
                            <p className="text-sm text-muted-foreground max-w-md">
                                When enabled, you can designate specific research posts as "Premium". Users will need to subscribe to access them.
                            </p>
                        </div>
                        <div className="flex items-center gap-4">
                            {isUpdatingPremium && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
                            <Switch
                                checked={premiumEnabled}
                                onCheckedChange={handlePremiumToggle}
                            />
                        </div>
                    </div>

                    {premiumEnabled && (
                        <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 text-sm text-primary">
                            <p className="font-semibold flex items-center gap-2">
                                <Unlock className="w-4 h-4" />
                                Premium Mode Active
                            </p>
                            <p className="mt-1 opacity-90">
                                You can now mark posts as "Premium" in the editor. Set up your payout details in the "Payouts" dashboard (Coming Soon).
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Portfolio Sharing Section */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-primary" />
                        <CardTitle>Portfolio Sharing</CardTitle>
                    </div>
                    <CardDescription>
                        Select which portfolios you want to showcase on your public profile.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {portfolios.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            You haven't created any portfolios yet.
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {portfolios.map(portfolio => (
                                <div key={portfolio.id} className="flex items-center justify-between p-4 border border-border rounded-lg bg-card/50">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-full ${portfolio.isPublic ? 'bg-green-500/10 text-green-500' : 'bg-muted text-muted-foreground'}`}>
                                            {portfolio.isPublic ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                        </div>
                                        <div>
                                            <p className="font-medium">{portfolio.name}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Badge variant="outline" className="text-xs capitalize">{portfolio.type}</Badge>
                                                <span className="text-xs text-muted-foreground">
                                                    {portfolio.holdings?.length || 0} Holdings
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className={`text-sm ${portfolio.isPublic ? 'text-green-500 font-medium' : 'text-muted-foreground'}`}>
                                            {portfolio.isPublic ? 'Public' : 'Private'}
                                        </span>
                                        <Switch
                                            checked={portfolio.isPublic || false}
                                            onCheckedChange={() => handlePortfolioToggle(portfolio.id, portfolio.isPublic || false)}
                                            disabled={togglingPortfolio === portfolio.id}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
