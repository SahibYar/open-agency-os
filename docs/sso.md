# Single sign-on with Authelia

Authelia adds one login screen in front of every Aperture service. Instead of managing five separate logins (Twenty, Chatwoot, Mautic, Cal.com, n8n), your team authenticates once and the session is shared across all subdomains.

## How it works

Caddy uses `forward_auth` to check every request against Authelia before forwarding it upstream. If the browser has a valid Authelia session cookie, the request goes through. If not, the browser is redirected to `auth.{DOMAIN}` to log in.

n8n webhook paths (`/webhook/*`) bypass SSO so external services (Twilio, Cal.com webhooks, WordPress form submissions) can POST without a session.

## Prerequisites

- Core layer is running and DNS is configured
- `auth.{DOMAIN}` resolves to your server
- `dash.{DOMAIN}` resolves to your server (for the control panel)

## 1. Set the SSO secrets

`bash setup.sh` already generated three Authelia secrets in `.env`:

```
AUTHELIA_JWT_SECRET=...
AUTHELIA_SESSION_SECRET=...
AUTHELIA_STORAGE_ENCRYPTION_KEY=...
```

These are set. No action needed.

## 2. Set your admin password

The default credentials are `admin` / `ChangeMe1!`. **Change the password before exposing to the internet.**

Generate a new bcrypt hash:

```bash
docker run --rm authelia/authelia:latest \
  authelia crypto hash generate bcrypt --password 'YourNewPassword'
```

Copy the output hash (starts with `$2b$12$...`) into `authelia/users_database.yml`:

```yaml
users:
  admin:
    displayname: Agency Admin
    password: "$2b$12$your-new-hash-here"
    email: you@example.com
    groups:
      - admins
```

To add more users, duplicate the `admin:` block with a different username.

## 3. Swap the Caddyfile

```bash
# Back up the current Caddyfile
cp Caddyfile Caddyfile.base

# Use the SSO-enabled version
cp Caddyfile.sso Caddyfile
```

## 4. Start the SSO profile

```bash
docker compose --profile core --profile sso up -d
```

Verify Authelia is healthy:

```bash
docker compose ps authelia
# Should show: healthy
```

## 5. Test

Open `https://crm.{DOMAIN}` in a browser. You should be redirected to `https://auth.{DOMAIN}` for login. After logging in with `admin` / your password, you are redirected back to Twenty.

The session persists for 8 hours (configurable in `authelia/configuration.yml` under `session.expiration`).

## Troubleshooting

**Redirect loop:** Authelia is not reachable from Caddy. Check `docker compose logs authelia`.

**Cookie domain mismatch:** `AUTHELIA_SESSION__DOMAIN` in `.env` must match your root domain exactly (e.g. `myagency.com`, not `www.myagency.com`).

**Webhook returns 401:** n8n webhook paths should bypass SSO. Verify `Caddyfile` (or `Caddyfile.sso`) has the `@webhook` path matcher in the `glue.{DOMAIN}` block.

## Going further

- **2FA:** Uncomment the `totp:` section and set `default_policy: two_factor` in `authelia/configuration.yml`
- **Email notifications:** Replace `notifier.filesystem` with `notifier.smtp` to send password-reset emails
- **More users:** Add entries under `users:` in `authelia/users_database.yml`
