# Adventskalender på GitHub Pages

## Resultatet
Kalenderen vises på GitHub Pages. Bildene blir liggende privat i Lovable Cloud, med datolåsen kontrollert der. Bare godkjente familiemedlemmer får se bildene etter innlogging.

## Endringene
1. Lag en egen statisk utgave for GitHub Pages, uten å ødelegge forhåndsvisningen her.
2. Sett opp automatisk publisering via GitHub Actions, med støtte for adressen `brukernavn.github.io/repository/` og direkte åpning av sider.
3. Legg til innlogging og en eierstyrt liste over familiemedlemmer. Ukjente og utloggede besøkende får ingen bilder.
4. Flytt kalenderens bildehenting til et beskyttet endepunkt på Lovable. Publisert kalender beholder Oslo-datolåsen; teståpning gjelder bare utviklingsforhåndsvisningen.
5. Test alle 24 luker, innlogging, tilgangsavslag og datolåsen.

## Det du må bidra med
- Koble prosjektet til GitHub gjennom prosjektinnstillingene. Jeg kan lage publiseringsoppsettet, men ikke koble repositoryet eller slå på Pages for deg.
- Oppgi GitHub-brukernavn og repositorynavn når de er klare.
- Logg inn som eier slik at familietilgangen knyttes til riktig konto. Familien kan deretter legges til fra eiersiden.
- Publiser serverdelen på Lovable før GitHub Pages-utgaven kan hente bilder. Ingen publisering utføres uten at du ber om det.

## Tekniske detaljer
- Behold TanStack Router/Start og bruk en separat SPA-byggkonfigurasjon for Pages. Bare statiske klientfiler publiseres til GitHub Pages.
- Bruk et autentisert HTTP-endepunkt under `/api/public/` for forespørsler fra GitHub Pages, med servervalidert identitet, familiemedlemskap og avgrenset CORS.
- Behold privat bildelagring og korte signerte bildelenker. Ingen private nøkler eller familiebilder legges i repositoryet.
- Fjern den offentlige bildehentingen når familietilgangen aktiveres, slik at gammel tilgang ikke omgår innloggingen.

## Avgrensning
GitHub Pages erstatter ikke Lovable Cloud. Lagring og serverbruk fortsetter der og kan koste kreditter utover gratisrammen. SMS legges ikke til.