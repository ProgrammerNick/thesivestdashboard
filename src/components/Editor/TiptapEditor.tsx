import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import {
    Bold,
    Italic,
    Heading1,
    Heading2,
    Heading3,
    Heading4,
    Heading5,
    Quote,
    List,
    ListOrdered,
    Image as ImageIcon,
    Link as LinkIcon,
    Undo,
    Redo,
    Minus
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCallback } from 'react';
import '@/editor-styles.css';

interface TiptapEditorProps {
    content: any;
    onChange: (content: any) => void;
    onUploadImage?: (file: File) => Promise<string>;
}

const MenuBar = ({ editor, onImageUpload }: { editor: any, onImageUpload?: (file: File) => Promise<string> }) => {
    if (!editor) {
        return null;
    }

    const addImage = useCallback(() => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = async () => {
            if (input.files?.length && onImageUpload) {
                const file = input.files[0];
                const url = await onImageUpload(file);
                if (url) {
                    editor.chain().focus().setImage({ src: url }).run();
                }
            }
        };
        input.click();
    }, [editor, onImageUpload]);

    const setLink = useCallback(() => {
        const previousUrl = editor.getAttributes('link').href;
        const url = window.prompt('URL', previousUrl);

        if (url === null) {
            return;
        }

        if (url === '') {
            editor.chain().focus().extendMarkRange('link').unsetLink().run();
            return;
        }

        editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    }, [editor]);

    // Get current heading level for dropdown label
    const getCurrentHeading = () => {
        for (let i = 1; i <= 6; i++) {
            if (editor.isActive('heading', { level: i })) {
                return `H${i}`;
            }
        }
        return 'Heading';
    };

    return (
        <div className="sticky top-0 z-10 flex flex-wrap items-center gap-1 py-2 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            {/* Text Formatting */}
            <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleBold().run()}
                disabled={!editor.can().chain().focus().toggleBold().run()}
                className={editor.isActive('bold') ? 'bg-primary/20 text-primary ring-1 ring-primary/30' : ''}
            >
                <Bold className="w-4 h-4" />
            </Button>
            <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleItalic().run()}
                disabled={!editor.can().chain().focus().toggleItalic().run()}
                className={editor.isActive('italic') ? 'bg-primary/20 text-primary ring-1 ring-primary/30' : ''}
            >
                <Italic className="w-4 h-4" />
            </Button>

            <div className="w-px h-6 bg-border mx-1" />

            {/* Headings Dropdown */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        size="sm"
                        className={editor.isActive('heading') ? 'bg-primary/20 text-primary ring-1 ring-primary/30' : ''}
                    >
                        {getCurrentHeading()}
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                    <DropdownMenuItem onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>
                        <Heading1 className="w-4 h-4 mr-2" />
                        <span className="font-bold text-lg">Heading 1</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
                        <Heading2 className="w-4 h-4 mr-2" />
                        <span className="font-semibold text-base">Heading 2</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
                        <Heading3 className="w-4 h-4 mr-2" />
                        <span className="font-medium">Heading 3</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}>
                        <Heading4 className="w-4 h-4 mr-2" />
                        <span className="font-medium text-sm">Heading 4</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => editor.chain().focus().toggleHeading({ level: 5 }).run()}>
                        <Heading5 className="w-4 h-4 mr-2" />
                        <span className="text-xs uppercase tracking-wide">Heading 5</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <div className="w-px h-6 bg-border mx-1" />

            {/* Lists */}
            <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={editor.isActive('bulletList') ? 'bg-primary/20 text-primary ring-1 ring-primary/30' : ''}
            >
                <List className="w-4 h-4" />
            </Button>
            <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                className={editor.isActive('orderedList') ? 'bg-primary/20 text-primary ring-1 ring-primary/30' : ''}
            >
                <ListOrdered className="w-4 h-4" />
            </Button>

            <div className="w-px h-6 bg-border mx-1" />

            {/* Block Elements */}
            <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                className={editor.isActive('blockquote') ? 'bg-primary/20 text-primary ring-1 ring-primary/30' : ''}
            >
                <Quote className="w-4 h-4" />
            </Button>
            <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().setHorizontalRule().run()}
            >
                <Minus className="w-4 h-4" />
            </Button>
            <Button
                variant="ghost"
                size="sm"
                onClick={setLink}
                className={editor.isActive('link') ? 'bg-primary/20 text-primary ring-1 ring-primary/30' : ''}
            >
                <LinkIcon className="w-4 h-4" />
            </Button>
            <Button
                variant="ghost"
                size="sm"
                onClick={addImage}
            >
                <ImageIcon className="w-4 h-4" />
            </Button>

            <div className="flex-grow" />

            {/* Undo/Redo */}
            <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().undo().run()}
                disabled={!editor.can().chain().focus().undo().run()}
            >
                <Undo className="w-4 h-4" />
            </Button>
            <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().redo().run()}
                disabled={!editor.can().chain().focus().redo().run()}
            >
                <Redo className="w-4 h-4" />
            </Button>
        </div>
    )
}

export default function TiptapEditor({ content, onChange, onUploadImage }: TiptapEditorProps) {
    const editor = useEditor({
        extensions: [
            StarterKit,
            Image,
            Link.configure({
                openOnClick: false,
            }),
        ],
        immediatelyRender: false,
        content,
        onUpdate: ({ editor }) => {
            onChange(editor.getJSON());
        },
        editorProps: {
            attributes: {
                class: 'prose prose-sm dark:prose-invert max-w-none focus:outline-none min-h-[600px] py-4 prose-headings:font-heading',
            },
        },
    });

    return (
        <div className="relative">
            <MenuBar editor={editor} onImageUpload={onUploadImage} />
            <EditorContent editor={editor} className="[&_.ProseMirror]:focus:outline-none [&_.ProseMirror_p.is-editor-empty:first-child]:before:content-[attr(data-placeholder)] [&_.ProseMirror_p.is-editor-empty:first-child]:before:text-muted-foreground/50 [&_.ProseMirror_p.is-editor-empty:first-child]:before:float-left [&_.ProseMirror_p.is-editor-empty:first-child]:before:pointer-events-none" />
        </div>
    );
}
