# Two-way SMS inbox with Chatwoot + Twilio

Chatwoot has native Twilio integration. When configured, inbound SMS from any contact appears as a conversation in your shared inbox — the same interface as email and web chat. Agents can reply directly from Chatwoot and the reply is sent as an SMS via Twilio.

This is different from the n8n `02-speed-to-lead` workflow, which is an outbound SMS trigger. This guide makes SMS a fully two-way conversation channel.

## Prerequisites

- Inbox layer running: `docker compose --profile core --profile inbox up -d`
- A Twilio account with an SMS-capable phone number
- `inbox.{DOMAIN}` accessible over HTTPS (required for Twilio webhooks)

## Step 1 — Get your Twilio credentials

In the Twilio console:

1. Note your **Account SID** (`ACxxxxx...`)
2. Note your **Auth Token**
3. Note the **Phone Number** you want to use for SMS (e.g. `+15551234567`)

## Step 2 — Create an SMS inbox in Chatwoot

1. Log into Chatwoot at `https://inbox.{DOMAIN}`
2. Go to **Settings → Inboxes → Add Inbox**
3. Choose **SMS**
4. Select **Twilio** as the provider
5. Fill in:
   - **Account SID**: your Twilio Account SID
   - **Auth Token**: your Twilio Auth Token
   - **Phone Number**: your Twilio number (E.164 format, e.g. `+15551234567`)
   - **Channel Name**: e.g. `SMS — Main Line`
6. Click **Create Inbox**

Chatwoot will display a **Webhook URL** like:
```
https://inbox.{DOMAIN}/twilio/callback
```

Copy it.

## Step 3 — Set the Chatwoot webhook in Twilio

1. In the Twilio console, go to **Phone Numbers → Manage → Active Numbers**
2. Click your SMS number
3. Under **Messaging Configuration → A message comes in**, select **Webhook**
4. Paste the Chatwoot webhook URL
5. Set the HTTP method to **HTTP POST**
6. Save

## Step 4 — Test

Send an SMS to your Twilio number from any mobile phone. After a few seconds, it should appear as a new conversation in Chatwoot under the SMS inbox you created.

Assign the conversation to an agent. Replying from Chatwoot sends the reply as an SMS to the sender.

## Step 5 — Wire to CRM (optional)

Enable the `09-chatwoot-crm-sync` workflow in n8n. It listens for the `conversation_created` Chatwoot webhook event and automatically creates or finds the contact in Twenty CRM.

To configure the Chatwoot → n8n webhook:
1. In Chatwoot: **Settings → Integrations → Webhooks → Add new webhook**
2. URL: `https://glue.{DOMAIN}/webhook/aperture-chatwoot-sync`
3. Enable: `Conversation Created`
4. Save

## Connecting the missed-call workflow

The `05-missed-call-text-back` workflow uses a separate Twilio webhook for **voice calls**, not SMS. Configure it in Twilio under your number's **Voice Configuration**:

- **A call comes in**: Webhook → `https://glue.{DOMAIN}/webhook/aperture-missed-call`
- Status callback URL: same address
- Status callback events: `no-answer`, `busy`, `failed`

## Sending SMS from n8n

The workflows (`05`, `06`, `08`) send SMS via Twilio directly from n8n using the `TWILIO_BASIC` env var (Base64 of `AccountSID:AuthToken`).

Generate it:

```bash
echo -n "ACyour_account_sid:your_auth_token" | base64
```

Paste the result into `.env` as `TWILIO_BASIC=`.
