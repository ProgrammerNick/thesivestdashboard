import { useState, useRef } from "react";
import { useRouter } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { updateUserProfile } from "@/server/fn/users";
import { getPresignedUrl } from "@/server/fn/upload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Upload, User, Globe, Twitter, Linkedin, MapPin } from "lucide-react";

interface ProfileSettingsProps {
    user: any; // Type should be imported from schema/server return
}

export function ProfileSettings({ user }: ProfileSettingsProps) {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    // Form state
    const [bio, setBio] = useState(user.bio || "");
    const [investingStyle, setInvestingStyle] = useState(user.investingStyle || "");
    const [location, setLocation] = useState(user.location || "");
    const [website, setWebsite] = useState(user.website || "");
    const [twitter, setTwitter] = useState(user.twitter || "");
    const [linkedin, setLinkedin] = useState(user.linkedin || "");
    const [avatarUrl, setAvatarUrl] = useState(user.image || "");

    const updateProfile = useMutation({
        mutationFn: updateUserProfile,
        onSuccess: async () => {
            await router.invalidate();
            router.navigate({ to: "/profiles/$id", params: { id: user.id } });
        },
        onError: (err) => {
            console.error(err);
        }
    });

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // basic validation
        if (file.size > 5 * 1024 * 1024) {
            console.error("File size must be less than 5MB");
            return;
        }

        setIsUploading(true);
        try {
            // 1. Get presigned URL
            const key = `avatars/${user.id}-${Date.now()}-${file.name}`;
            const { url } = await getPresignedUrl({ data: { key, contentType: file.type } });

            // 2. Upload file
            await fetch(url, {
                method: "PUT",
                body: file,
                headers: { "Content-Type": file.type },
            });

            // 3. Update state (URL is the base part without query params)
            const cleanUrl = url.split("?")[0];
            setAvatarUrl(cleanUrl);

            // Auto-save the new image URL
            await updateProfile.mutateAsync({ data: { image: cleanUrl } });

        } catch (err) {
            console.error(err);
        } finally {
            setIsUploading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await updateProfile.mutateAsync({
                data: {
                    bio,
                    investingStyle: investingStyle || null,
                    location,
                    website,
                    twitter,
                    linkedin,
                }
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Public Profile</CardTitle>
                    <CardDescription>
                        This is how others will see you on the platform.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                    {/* Avatar Upload */}
                    <div className="flex items-center gap-6">
                        <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                            <Avatar className="w-24 h-24 border-2 border-border group-hover:border-primary transition-colors">
                                <AvatarImage src={avatarUrl} />
                                <AvatarFallback className="text-2xl bg-muted">
                                    {user.name?.[0]?.toUpperCase() || <User />}
                                </AvatarFallback>
                            </Avatar>
                            <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Upload className="w-6 h-6 text-white" />
                            </div>
                            {isUploading && (
                                <div className="absolute inset-0 bg-background/80 rounded-full flex items-center justify-center">
                                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                                </div>
                            )}
                        </div>
                        <div className="space-y-1">
                            <h3 className="font-medium text-lg">Profile Picture</h3>
                            <p className="text-sm text-muted-foreground">
                                Click to upload. JPG, PNG or GIF up to 5MB.
                            </p>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleFileChange}
                            />
                        </div>
                    </div>

                    <form onSubmit={handleSave} className="space-y-6">
                        <div className="grid gap-2">
                            <Label htmlFor="bio">Bio</Label>
                            <Textarea
                                id="bio"
                                placeholder="Tell the community about your investing philosophy..."
                                className="resize-none min-h-[100px]"
                                maxLength={280}
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                            />
                            <p className="text-xs text-muted-foreground text-right">
                                {bio.length}/280
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="grid gap-2">
                                <Label htmlFor="style">Investing Style</Label>
                                <Select value={investingStyle} onValueChange={setInvestingStyle}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select style..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Value">Value</SelectItem>
                                        <SelectItem value="Growth">Growth</SelectItem>
                                        <SelectItem value="Momentum">Momentum</SelectItem>
                                        <SelectItem value="Dividend">Dividend</SelectItem>
                                        <SelectItem value="Index">Index</SelectItem>
                                        <SelectItem value="Quantitative">Quantitative</SelectItem>
                                        <SelectItem value="Day Trading">Day Trading</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="location">Location</Label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="location"
                                        placeholder="New York, NY"
                                        className="pl-9"
                                        value={location}
                                        onChange={(e) => setLocation(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4 pt-4 border-t border-border">
                            <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">Social Links</h3>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="grid gap-2">
                                    <Label htmlFor="website">Website</Label>
                                    <div className="relative">
                                        <Globe className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="website"
                                            placeholder="https://yoursite.com"
                                            className="pl-9"
                                            value={website}
                                            onChange={(e) => setWebsite(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="twitter">Twitter / X</Label>
                                    <div className="relative">
                                        <Twitter className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="twitter"
                                            placeholder="@username"
                                            className="pl-9"
                                            value={twitter}
                                            onChange={(e) => setTwitter(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="linkedin">LinkedIn</Label>
                                    <div className="relative">
                                        <Linkedin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="linkedin"
                                            placeholder="LinkedIn Profile URL"
                                            className="pl-9"
                                            value={linkedin}
                                            onChange={(e) => setLinkedin(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end pt-4">
                            <Button type="submit" disabled={isLoading}>
                                {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                Save Changes
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
