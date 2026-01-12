import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { generateStockAnalysis, type StockData, type Catalyst, type ComparableCompany } from "../features/stocks.server";

// Re-export types for consumers
export type { StockData, Catalyst, ComparableCompany };

export const searchStock = createServerFn({ method: "POST" })
    .inputValidator(z.string().min(1))
    .handler(async ({ data: query }: { data: string }) => {
        return await generateStockAnalysis(query);
    });
