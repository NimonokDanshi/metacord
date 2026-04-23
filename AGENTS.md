<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Database & Type Safety

1. **DB Schema as Source of Truth**  
   `supabase/migrations/*.sql` is the absolute source of truth.  
   (DB スキーマの正解は `supabase/migrations/*.sql` にある SQL ファイルであると定義します。)

2. **Strict Type Synchronization**  
   `src/types/database.ts` must exactly reflect the SQL schema. It must use the modern Supabase CLI format (including `Relationships: []` and proper `Json` types) to ensure SDK compatibility.  
   (`src/types/database.ts` は常に最新の SQL スキーマと同期させ、モダンな Supabase CLI 形式を維持します。)

3. **Consult Before Mutation**  
   Never modify (ADD/DROP/ALTER) the DB schema or change types in `database.ts` without explicit user consultation and approval.  
   (DB スキーマや `database.ts` を変更・追加・削除する際は、必ず事前に相談し承認を得ます。)

4. **No `as any` Workarounds**  
   Do not use `as any` to suppress Supabase type errors. If a type error occurs, fix the underlying `database.ts` definition to match the DB.  
   (Supabase の型エラーを `as any` で回避せず、根本原因である `database.ts` を修正します。)
