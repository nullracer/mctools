# School calendar on GitHub Pages

This is a static calendar site. GitHub Actions retrieves the iCalendar feed using a repository secret, converts it to `events.json`, and deploys the site to GitHub Pages every six hours (and on manual runs or pushes to `main`). The private feed URL is never written into the website files.

## Set it up

1. Create a GitHub repository and add these files. Push them to the `main` branch.
2. In the repository, open **Settings → Secrets and variables → Actions → New repository secret**. Name it `CALENDAR_FEED` and paste the full iCalendar URL as its value.
3. Open **Settings → Pages** and choose **GitHub Actions** as the build and deployment source.
4. Open the **Actions** tab, select **Refresh and publish calendar**, and choose **Run workflow**. Once it succeeds, the Pages URL appears in the workflow run and Pages settings.

## Privacy

The feed URL contains a private-looking token. Treat it like a password: keep it in the `CALENDAR_FEED` secret and do not paste it into HTML, JavaScript, README files, or a public issue. The published `events.json` is public, so only use this for events that are appropriate to publish. If the URL has been shared somewhere unintended, check whether the calendar system lets you regenerate the feed URL.

The workflow refreshes every six hours. Scheduled workflows can run late, and the site will not update until a run succeeds. The page itself is static and needs no server.
