---
trigger: always_on
---

# Database Migration Protocol
- **Strict Requirement:** Never use `db push` (or equivalent commands that bypass migration files) for schema changes.
- **Workflow:** When the user requests a change to the database schema or models, follow this exact sequence:
    1. Modify the schema file (e.g., `schema.prisma` or `schema.ts`).
    2. Run `db generate` to update the client/types.
    3. Run `db migrate` (or `db migrate dev`) to create a versioned SQL migration file.
- **Context:** This ensures all changes are tracked in version control and can be safely deployed to production environments. If a user asks for a database update, always default to generating a migration file first.

# Server Logic & Functions Organization
- **Location Rule:** All server-side logic, database queries, and external API integrations (e.g., Gemini API, financial data providers) must reside in the `/fn` directory.
- **Naming Convention:** Use descriptive file names that reflect the domain (e.g., `/fn/funds.ts`, `/fn/ai-research.ts`, `/fn/market-data.ts`).
- **Separation of Concerns:** - Keep UI components/routes thin. 
    - Components should only call exported functions from the `/fn` folder.
    - Server Actions (if using Next.js) or core business logic should be defined in `/fn` and imported where needed.
- **Strict Requirement:** Do not define complex data-fetching or transformation logic directly within API route handlers or Page components. If the logic involves the database or an LLM, it belongs in `/fn`.

