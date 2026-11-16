<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

## What Lovable manages

Rules outside this block are the project's own. Change the pieces below in
Lovable, not by hand. With the [Lovable MCP](https://mcp.lovable.dev)
connected, `send_message` asks Lovable to do it; otherwise ask the user to
use the editor.

- **Database.** Do not add or edit `supabase/migrations/` or `drizzle/`.
  Ask Lovable to change the schema.
- **Generated files.** Do not edit a file whose header says it is automatically
  generated.
- **AI gateway.** Keep model calls on Lovable's gateway, and keep
  `LOVABLE_API_KEY` out of browser code.
- **Connectors.** Lovable provides native connectors. `list_connectors` shows
  which are enabled; `add_connector` only returns the dashboard link. When a
  connector is enabled, calls go through the connector gateway and need
  `LOVABLE_API_KEY`. When Lovable does not provide one, users can bring their
  own key and store it in Secrets.
- **Secrets.** Lovable manages them. Do not put secret values in the repo.
<!-- LOVABLE:END -->

- Door unlock logic lives in src/lib/advent.ts and is enforced server-side in getDoors; locked doors never get image URLs.
- Only verified owners in the Vite development preview bypass door dates for testing; production always uses Oslo date locks.
- Owner roles are provisioned only after identifying the intended owner; claim_admin checks existing ownership and never grants it to the first visitor.
- Pages ships only dist/client from a separate SPA build; private reads use the Lovable-hosted bearer-authenticated calendar endpoint with exact-origin CORS and server-side family approval.
- Approved family phone numbers live in an owner-managed RLS table; access checks require a confirmed phone in Auth rather than editable metadata, so unverified numbers cannot grant access. Private storage remains owner-only and image links expire after five minutes.
- Normalize phone input to E.164 before Auth and membership writes to keep SMS delivery and access matching consistent.
