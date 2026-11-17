# CooptaIQ — Brevo newsletter bridge

Adds waitlist newsletter opt-ins to a Brevo list.

Formspree still stores the waitlist submission. Brevo receives only the
newsletter contact. The Brevo API key is stored in Cloudflare, not in the page.

## 1. Create the Brevo list

1. Sign up at https://www.brevo.com
2. Go to **Contacts → Lists**.
3. Create a list named `CooptaIQ updates`.
4. Copy the numeric list ID.

Optional: enable double opt-in on that list before launch.

## 2. Create a Brevo API key

1. Open **SMTP & API → API keys**.
2. Create a key with contacts permission.
3. Copy the key once. Keep it secret.

Free plan: 100,000 stored contacts, 300 emails per day.
Brevo is the newsletter sender; this worker only adds contacts.

## 3. Create the Cloudflare Worker

1. Sign in at https://dash.cloudflare.com
2. Open **Workers & Pages → Create → Worker**.
3. Name it `cooptaiq-newsletter`.
4. Replace the starter code with `brevo-worker.js`.
5. Deploy.

## 4. Add secrets and variables

In the Worker: **Settings → Variables and Secrets**.

| Name | Type | Value |
| --- | --- | --- |
| `BREVO_API_KEY` | Secret | Your Brevo API key |
| `BREVO_LIST_ID` | Text | Numeric list ID |
| `SITE_ORIGIN` | Text | Production origin, no trailing slash |

Example production origin:

```text
https://zackworkspace2.github.io
```

Origins already allowed: `http://127.0.0.1:4173`, `http://localhost:4173`,
`http://192.168.0.183:4173`.

For a custom domain, change `SITE_ORIGIN` or add the origin to
`LOCAL_ORIGINS` in the worker.

## 5. Connect the landing page

Copy the deployed Worker URL, for example:

```text
https://cooptaiq-newsletter.yourname.workers.dev
```

Replace this meta tag in `index.html`:

```html
<meta name="newsletter-endpoint" content="https://REPLACE-ME.workers.dev">
```

Until replaced, newsletter sync is skipped.

## 6. Test

1. Open the landing page.
2. Submit the waitlist form with **Send me product updates** checked.
3. Check **Brevo → Contacts** and the `CooptaIQ updates` list.
4. Submit again with the box unchecked. No contact should be added.

## Notes

- Formspree Free still caps at 50 submissions per month.
- Brevo Free allows 300 emails per day.
- The Worker never sends the Brevo API key to the browser.
- Full name is split into `FIRSTNAME` and `LASTNAME`.
- Company and role stay in Formspree.
