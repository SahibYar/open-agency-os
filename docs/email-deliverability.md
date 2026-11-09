# Email deliverability with Mautic

Mautic is a full marketing automation platform, but it needs a reliable SMTP provider to deliver email. Sending directly from your VPS IP will get your messages flagged as spam by every major email provider.

This guide gets Mautic sending through Postmark (recommended for reliability) or Amazon SES (recommended for volume). Both have generous free tiers.

## Why you cannot send from your VPS IP

Consumer and business inboxes (Gmail, Outlook, Yahoo) use IP reputation to filter spam. A new VPS IP has no reputation — 100% of cold outreach goes to spam, and even transactional mail often fails.

The solution: a dedicated email sending service with established IP pools, automatic handling of bounces and unsubscribes, and DKIM signing.

## Recommended providers

| Provider | Free tier | Best for |
|---|---|---|
| **Postmark** | 100 emails/month free, then $1.25/1k | Transactional, high deliverability |
| **Amazon SES** | 3,000/month free (from EC2), $0.10/1k | High volume, lowest cost |
| **Mailgun** | 100/day free | Good developer experience |
| **Brevo** | 300/day free | EU data residency |

## 1. Set up Postmark

1. Create an account at postmarkapp.com
2. Add a **Sender Signature** for your domain (e.g. `no-reply@myagency.com`)
3. Verify domain ownership by adding the shown DNS TXT record
4. In your server settings, find the **SMTP credentials**:
   - Host: `smtp.postmarkapp.com`
   - Port: `587` (STARTTLS) or `465` (TLS)
   - Username: your server API token
   - Password: your server API token

## 2. Configure DNS records

Before sending, add these DNS records for your domain. Postmark will show you the exact values:

```
# SPF — authorise Postmark to send on your behalf
TXT  @   "v=spf1 include:spf.mtasv.net ~all"

# DKIM — cryptographically sign outgoing mail
TXT  pm._domainkey   "v=DKIM1; k=rsa; p=..."

# DMARC — policy for failed authentication
TXT  _dmarc   "v=DMARC1; p=quarantine; rua=mailto:dmarc@myagency.com"
```

Allow 15–30 minutes for DNS to propagate before testing.

## 3. Configure Mautic SMTP

1. Log into Mautic at `https://go.{DOMAIN}`
2. Go to **Settings (gear icon) → Configuration → Email Settings**
3. Set:
   - **Mailer transport**: Other SMTP Server
   - **SMTP host**: `smtp.postmarkapp.com`
   - **SMTP port**: `587`
   - **SMTP security**: STARTTLS
   - **SMTP auth mode**: Login
   - **SMTP username**: your Postmark API token
   - **SMTP password**: your Postmark API token
4. Click **Apply and Test**. Mautic will send a test email.

## 4. Configure the From address

In Mautic: **Settings → Configuration → Email Settings → Default From Email**

Use an address you verified in Postmark (e.g. `hello@myagency.com`).

Do NOT use a generic Gmail or free email address — it will fail DMARC checks.

## 5. Create a nurture segment

The `06-lead-follow-up-sequence` workflow adds new leads to a Mautic segment. Create the segment first:

1. Mautic → **Segments → New**
2. Name: `Inbound Nurture`
3. No filters needed (contacts are added programmatically by n8n)
4. Save and note the **segment ID** from the URL (e.g. `/s/segments/1/edit` → ID is `1`)
5. Set `MAUTIC_NURTURE_SEGMENT_ID=1` in `.env` (replace `1` with your actual ID)

## 6. Create a Mautic campaign

The n8n workflows create contacts and add them to segments. Mautic campaigns define what happens next:

1. Mautic → **Campaigns → New**
2. Name: `Inbound Nurture Sequence`
3. Source: Segment → select `Inbound Nurture`
4. Add actions:
   - **Wait**: 1 day
   - **Send email**: "Following up" (create this email template first)
   - **Wait**: 2 days
   - **Send email**: "Quick question"
   - **Wait**: 7 days
   - **Send email**: "Last check-in"
5. Set campaign as **Published**

New contacts in the segment automatically enter the campaign.

## 7. Warm up your sending domain

If you are starting from zero sends, warm up gradually:

- Week 1: 50–100 emails/day
- Week 2: 200–500/day
- Week 3: 1,000+/day

Postmark's transactional pools are pre-warmed — only necessary if you're doing high-volume cold outreach via Mautic campaigns.

## Monitoring

Mautic → **Reports → Email** shows open rates, click rates, bounces, and unsubscribes.

Postmark dashboard shows delivery rates and suppression lists.

Aim for:
- Bounce rate < 2%
- Unsubscribe rate < 0.5%
- Open rate > 20% (depends on audience and industry)
