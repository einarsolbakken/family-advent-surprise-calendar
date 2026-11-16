# Welcome to your Lovable project

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Open your project in the [Lovable editor](https://lovable.dev) and keep building.

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: connect the project to GitHub and every change made in Lovable is committed straight to your repository.
- **Full ownership**: this code is yours. Push to your repository and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

## Built with

- TanStack Start
- TypeScript
- React
- Tailwind CSS

## GitHub Pages deployment

This app has two deployments: GitHub Pages serves the static interface, and a published Lovable app serves `/api/public/calendar`. GitHub Pages alone cannot protect images or enforce dates. Images stay in private Cloud storage, not in GitHub.

1. Connect GitHub using Lovable Project settings → Git. Enable Pages in repository Settings → Pages, source **GitHub Actions**. The workflow assumes the synced branch is `main`; change its branch entry if your synced branch differs.
2. Sign in to the app as the intended owner. Ownership must be provisioned after verifying that account; no first-visitor ownership is granted. Add approved family email addresses from `/admin` afterwards.
3. Publish the Lovable server deployment when ready. Set server secret `CALENDAR_PAGES_ORIGIN` to the exact Pages origin (for example `https://your-account.github.io`, without the repository path). Add the Pages callback URL to the allowed auth redirect URLs and validate Google/Lovable sign-in on that domain before sharing.
4. In GitHub Settings → Secrets and variables → Actions → Variables, add `VITE_CALENDAR_API_ORIGIN` (published Lovable origin without trailing slash), `VITE_SUPABASE_URL`, and `VITE_SUPABASE_PUBLISHABLE_KEY` (the existing public client configuration). These are public configuration values, not private credentials. Never add a service-role key, database password, or private images.
5. Run **Publish calendar to GitHub Pages** from Actions. The build calculates the repository base path and uploads only `dist/client`. Static fallbacks support refreshing `/admin` and other client paths. The server bundle is never uploaded.

The workflow deliberately fails if configuration is missing. Publishing is not automatic from this chat. Do not share the site until owner access, family sign-in, the published API, and the exact-origin configuration have been verified. Cloud usage remains separate from GitHub Pages hosting.
