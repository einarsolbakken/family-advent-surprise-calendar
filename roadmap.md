# GitHub Pages calendar

- [x] Correct Pages packaging to stage the actual public build output and test private-file exclusion.

- [x] Replace family sign-in and approvals with phone numbers and SMS codes, without profiles.
- [ ] Activate hosted phone/SMS sign-in and verify a real code; requires owner configuration in Lovable Cloud phone settings.

- [x] Add a static GitHub Pages build configuration with repository-aware paths and automated deployment.
- [x] Serve private calendar images through an authenticated Lovable-hosted endpoint with Oslo date locks.
- [x] Add approved-family access and owner-managed invitations.
- [ ] Establish ownership and verify family access; needs the intended owner to sign in (there are no accounts yet).
- [ ] Verify GitHub Actions build, static navigation and cross-domain sign-in; needs repository configuration and published server deployment.
- [x] Verify signed-out denial, invalid-token denial, unconfigured-origin denial and date locks locally; desktop and mobile sign-in render correctly.
- [ ] Configure the GitHub repository and Pages URL; needs repository name and GitHub-side setup by the owner.
