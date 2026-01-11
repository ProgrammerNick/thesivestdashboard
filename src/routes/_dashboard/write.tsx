import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import TiptapEditor from '@/components/Editor/TiptapEditor';
import { createPost } from '@/server/fn/posts';
import { getPresignedUrl } from '@/server/fn/upload';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';

export const Route = createFileRoute('/_dashboard/write')({
    component: WritePage,
});

function WritePage() {
    const navigate = useNavigate();
    const [title, setTitle] = useState('');
    const [subtitle, setSubtitle] = useState('');
    const [content, setContent] = useState<any>(null); // Use appropriate type for Tiptap JSON
    const [coverImage, setCoverImage] = useState<string | null>(null);
    const [attachments, setAttachments] = useState<{ url: string, type: string, filename: string, size: number }[]>([]);

    const createPostMutation = useMutation({
        mutationFn: createPost,
        onSuccess: (data) => {
            // Redirect to the post or dashboard
            // navigate({ to: `/posts/${data.slug}` }); // Assuming logic to generate slug if not provided, or ID
            // For now redirect to dashboard until we confirm the slug/id route works
            navigate({ to: '/dashboard' });
        },
    });

    const handleUploadImage = async (file: File): Promise<string> => {
        const key = `uploads/${Date.now()}-${file.name}`;
        const { url: uploadUrl } = await getPresignedUrl({ data: { key, contentType: file.type } });

        await fetch(uploadUrl, {
            method: "PUT",
            body: file,
            headers: { "Content-Type": file.type },
        });

        // Construct public URL - assuming standard S3 public bucket pattern or configured proxy
        // If basic S3:
        const imageUrl = uploadUrl.split('?')[0];
        return imageUrl;
    };

    const handleUploadAttachment = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            const key = `attachments/${Date.now()}-${file.name}`;
            const { url: uploadUrl } = await getPresignedUrl({ data: { key, contentType: file.type } });

            await fetch(uploadUrl, {
                method: "PUT",
                body: file,
                headers: { "Content-Type": file.type },
            });

            const publicUrl = uploadUrl.split('?')[0];
            setAttachments([...attachments, {
                url: publicUrl,
                type: file.type.includes('pdf') ? 'pdf' : 'image',
                filename: file.name,
                size: file.size
            }]);
        }
    };

    const handlePublish = async () => {
        if (!title || !content) {
            alert("Title and content are required");
            return;
        }

        createPostMutation.mutate({
            data: {
                title,
                subtitle,
                content,
                coverImage: coverImage || undefined,
                published: true,
                attachments: attachments
            }
        });
    };

    const handleSaveDraft = async () => {
        createPostMutation.mutate({
            data: {
                title,
                subtitle,
                content,
                coverImage: coverImage || undefined,
                published: false,
                attachments: attachments
            }
        });
    };

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Write a new post</h1>
                <div className="space-x-2">
                    <Button variant="outline" onClick={handleSaveDraft} disabled={createPostMutation.isPending}>
                        {createPostMutation.isPending ? 'Saving...' : 'Save Draft'}
                    </Button>
                    <Button onClick={handlePublish} disabled={createPostMutation.isPending}>
                        {createPostMutation.isPending ? 'Publishing...' : 'Publish'}
                    </Button>
                </div>
            </div>

            <div className="space-y-4">
                <div>
                    <Label htmlFor="title" className="sr-only">Title</Label>
                    <Input
                        id="title"
                        placeholder="Post Title"
                        className="text-4xl font-bold border-none shadow-none p-0 h-auto focus-visible:ring-0"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                </div>
                <div>
                    <Label htmlFor="subtitle" className="sr-only">Subtitle</Label>
                    <Input
                        id="subtitle"
                        placeholder="Subtitle (optional)"
                        className="text-xl text-muted-foreground border-none shadow-none p-0 h-auto focus-visible:ring-0"
                        value={subtitle}
                        onChange={(e) => setSubtitle(e.target.value)}
                    />
                </div>

                {/* Attachments Section */}
                <div className="border p-4 rounded-md">
                    <h3 className="font-semibold mb-2">Attachments</h3>
                    <div className="space-y-2 mb-4">
                        {attachments.map((att, idx) => (
                            <div key={idx} className="flex items-center justify-between bg-muted p-2 rounded">
                                <span className="text-sm truncate">{att.filename}</span>
                                <Button variant="ghost" size="sm" onClick={() => setAttachments(attachments.filter((_, i) => i !== idx))}>Remove</Button>
                            </div>
                        ))}
                    </div>
                    <div className="flex items-center gap-2">
                        <Label htmlFor="attachment-upload" className="cursor-pointer bg-secondary text-secondary-foreground hover:bg-secondary/80 h-9 px-4 py-2 rounded-md inline-flex items-center justify-center text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50">
                            Upload PDF / File
                        </Label>
                        <Input
                            id="attachment-upload"
                            type="file"
                            className="hidden"
                            onChange={handleUploadAttachment}
                        />
                    </div>
                </div>

                <TiptapEditor
                    content={content}
                    onChange={setContent}
                    onUploadImage={handleUploadImage}
                />
            </div>
        </div>
    );
}
