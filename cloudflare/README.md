# CooptaIQ — Brevo contact bridge

Adds every waitlist registration to a Brevo waitlist list. That list triggers
a Brevo automation that sends the welcome email.

Newsletter opt-ins are also added to the newsletter list.

Formspree still stores the waitlist submission. The Brevo API key is stored in
Cloudflare, not in the page.

## 1. Create two Brevo lists

1. Sign up at https://www.brevo.com
2. Go to **Contacts → Lists**.
3. Create `CooptaIQ waitlist`.
4. Create `CooptaIQ updates`.
5. Copy both numeric list IDs.

Do not enable double opt-in on the waitlist list. It is for the welcome email,
not marketing campaigns.

## 2. Create a Brevo API key

1. Open **SMTP & API → API keys**.
2. Create a restricted key with:
```text
Contacts = All
```
3. Copy the key once. Keep it secret.

Free plan: 100,000 stored contacts, 300 emails per day.

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
| `BREVO_WAITLIST_ID` | Text | Waitlist list ID |
| `BREVO_LIST_ID` | Text | Newsletter list ID |
| `SITE_ORIGIN` | Text | `https://www.cooptaiq.com` |

Origins already allowed: `http://127.0.0.1:4173`, `http://localhost:4173`,
`http://192.168.0.183:4173`.

## 5. Create the welcome automation

In Brevo:

1. Open **Automation**.
2. Create a workflow.
3. Trigger: **Contact added to a list**.
4. Select `CooptaIQ waitlist`.
5. Add a **Send email** step.
6. Create the welcome email.

Suggested subject:

```text
Welcome to CooptaIQ
```

Suggested body:

```text
Hi {{contact.FIRSTNAME}},

Thank you for joining the CooptaIQ waitlist.

We're building a better way for companies to manage people, recruitment
assessments and workplace learning. You'll be among the first to know when
CooptaIQ is ready.

Admitted. Assessed. Confirmed.

— CooptaIQ
```

7. Activate the automation.

## 6. Connect the landing page

The page already uses:

```html
<meta name="newsletter-endpoint" content="https://cooptaiq-newsletter.cooptaiq.workers.dev">
```

## 7. Test

1. Submit the waitlist form without the newsletter box.
2. Confirm the contact appears in `CooptaIQ waitlist`.
3. Confirm the welcome email arrives.
4. Submit again with the newsletter box checked.
5. Confirm the contact also appears in `CooptaIQ updates`.

## Notes

- Formspree Free still caps at 50 submissions per month.
- Brevo Free allows 300 emails per day.
- Do not send marketing campaigns to the waitlist list.
- The Worker never sends the Brevo API key to the browser.
- Full name is split into `FIRSTNAME` and `LASTNAME`.
- Company and role stay in Formspree.
