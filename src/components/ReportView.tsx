
import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";

interface ReportViewProps {
    content: string;
    className?: string;
}

// Helper to parse markdown tables
interface TableData {
    headers: string[];
    rows: string[][];
}

interface ContentBlock {
    type: "text" | "table";
    content: string | TableData;
}

function parseContent(content: string): ContentBlock[] {
    const lines = content.split("\n");
    const blocks: ContentBlock[] = [];
    let currentText = "";
    let currentTable: string[] = [];
    let inTable = false;

    // Regex to identify a potential table row: starts and ends with | (ignoring whitespace)
    const tableRowRegex = /^\s*\|.*\|\s*$/;
    // Regex to identify the separator row: | --- | --- |
    // Handles various separator styles like |:---|---| or | --- | --- |
    const separatorRegex = /^\s*\|(\s*:?-+:?\s*\|)+\s*$/;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // Naive table detection: if line looks like a table row
        if (tableRowRegex.test(line)) {
            // Check if it's the start of a new table (header) or continuation
            if (!inTable) {
                const nextLine = lines[i + 1];
                if (nextLine && separatorRegex.test(nextLine)) {
                    // Start of a table! push current text buffer
                    if (currentText.trim()) {
                        blocks.push({ type: "text", content: currentText });
                        currentText = "";
                    }
                    inTable = true;
                    currentTable.push(line);
                } else {
                    // Just a random line with pipes? Treat as text
                    currentText += line + "\n";
                }
            } else {
                // Already in table, add line
                currentTable.push(line);
            }
        } else {
            if (inTable) {
                // Table ended
                inTable = false;
                if (currentTable.length > 0) {
                    blocks.push({ type: "table", content: parseTable(currentTable) });
                    currentTable = [];
                }
                currentText += line + "\n";
            } else {
                currentText += line + "\n";
            }
        }
    }

    // Flush remaining
    if (inTable && currentTable.length > 0) {
        blocks.push({ type: "table", content: parseTable(currentTable) });
    }
    if (currentText.trim()) {
        blocks.push({ type: "text", content: currentText });
    }

    return blocks;
}

function parseTable(lines: string[]): TableData {
    // lines[0] is header, lines[1] is separator, rest are rows
    // Only process if we have at least header + separator
    if (lines.length < 2) return { headers: [], rows: [] };

    const parseRow = (row: string) => {
        // Remove leading/trailing pipes and split
        return row
            .replace(/^\s*\|\s*/, "") // remove starting pipe
            .replace(/\s*\|\s*$/, "") // remove ending pipe
            .split("|")
            .map(cell => cell.trim());
    };

    const headers = parseRow(lines[0]);
    // Skip lines[1] (separator)
    const rows = lines.slice(2).map(parseRow);

    return { headers, rows };
}

export function ReportView({ content, className }: ReportViewProps) {
    // Check if content might contain tables before doing expensive parse
    const hasTable = content.includes("|") && content.includes("---");
    const blocks = hasTable ? parseContent(content) : [{ type: "text", content } as ContentBlock];

    return (
        <div className={cn("max-w-4xl mx-auto py-2", className)}>
            <div className="prose prose-lg dark:prose-invert max-w-none 
                [&>ul]:list-disc [&>ul]:pl-6 [&>ul]:mb-4
                [&>ol]:list-decimal [&>ol]:pl-6 [&>ol]:mb-4
                [&>li]:mb-1
            ">
                {blocks.map((block, idx) => {
                    if (block.type === "table") {
                        const data = block.content as TableData;
                        return (
                            <div key={idx} className="my-8 overflow-hidden rounded-lg border border-border bg-card shadow-sm">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-muted/50 text-muted-foreground font-semibold">
                                            <tr>
                                                {data.headers.map((h, i) => (
                                                    <th key={i} className="px-4 py-3 border-b border-border/60">{h}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border">
                                            {data.rows.map((row, rIdx) => (
                                                <tr key={rIdx} className="hover:bg-muted/30">
                                                    {row.map((cell, cIdx) => (
                                                        <td key={cIdx} className="px-4 py-3 align-top text-muted-foreground">{cell}</td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        );
                    } else {
                        return (
                            <div key={idx} className="[&>h1]:text-3xl [&>h1]:font-heading [&>h1]:font-bold [&>h1]:mb-6
                                [&>h2]:text-2xl [&>h2]:font-heading [&>h2]:font-semibold [&>h2]:mt-10 [&>h2]:mb-4 [&>h2]:border-b [&>h2]:border-border/60 [&>h2]:pb-2
                                [&>h3]:text-xl [&>h3]:font-heading [&>h3]:font-semibold [&>h3]:mt-8 [&>h3]:mb-3
                                [&>p]:text-muted-foreground [&>p]:leading-relaxed [&>p]:mb-4
                                [&>blockquote]:bg-primary/5 [&>blockquote]:border-l-4 [&>blockquote]:border-primary [&>blockquote]:rounded-r-lg [&>blockquote]:p-4 [&>blockquote]:my-6 [&>blockquote]:text-foreground [&>blockquote]:not-italic [&>blockquote]:shadow-sm
                                [&>hr]:my-10 [&>hr]:border-border
                                [&>ul]:list-disc [&>ul]:pl-6 [&>ul]:space-y-2
                                [&>ol]:list-decimal [&>ol]:pl-6 [&>ol]:space-y-2
                                [&>li>strong]:text-foreground">
                                <ReactMarkdown>
                                    {block.content as string}
                                </ReactMarkdown>
                            </div>
                        );
                    }
                })}
            </div>
        </div>
    );
}
