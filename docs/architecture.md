# Architecture

Aperture is an integration, not a monolith. Each product keeps its database, its release cycle, and its license. n8n is the only component that is allowed to know about all of them.

```text
                    Internet
                       |
                    Caddy (TLS)
         ______________|________________
         |      |      |       |       |
       n8n   Twenty Chatwoot Cal.com  Mautic / WordPress
         |______|______|_______|_______|
                       |
                  Postgres 16
                  (one instance,
                   one database
                   per product)

              Redis: Twenty, Chatwoot, n8n queues as needed
              MariaDB: Mautic + WordPress only
```

## Why not one database

Twenty, Chatwoot, Cal.com, and n8n all speak Postgres, but they own their schemas. Sharing a database name would couple upgrades. `ops/postgres-init/01-databases.sql` creates separate databases on first boot of an empty volume. If the volume already exists, create the databases by hand; init scripts do not re-run.

## Why n8n is the bus

HighLevel workflows live inside the CRM. Ours cannot, because the CRM is Twenty and the inbox is Chatwoot. The durable rule:

1. A product emits a webhook or we poll its API.
2. n8n normalizes the payload (email, phone E.164, source, external ids).
3. n8n writes to the other products.
4. Failures stay in n8n's execution log. We do not hide them inside a custom queue yet.

Code nodes are allowed. A 15-line normalizer is better than a fake integration framework.

## Identity of a person

There is no global person table. The canonical record is the Twenty person. Everywhere else stores Twenty's id:

| System | Key we store |
| --- | --- |
| Twenty | `person.id` (source of truth) |
| Mautic | contact field `twenty_id` |
| Chatwoot | contact custom attribute `twenty_id` |
| Cal.com | booking metadata `twentyId` when the webhook allows it |
| WordPress | form hidden field `twenty_id` only after the person exists |

Email is the match key when the id is missing. Phone is the fallback. If both conflict, the playbook stops and opens a Chatwoot note instead of merging blindly.

## What this repo owns

| In this repo | Not in this repo |
| --- | --- |
| Compose, Caddy, env template | Twenty's UI |
| Playbook JSON and docs | Mautic's campaign engine |
| The opinion about defaults | Chatwoot's channels |
| Gap tracking | Carrier contracts |

If a change requires patching upstream source, it is out of scope until we publish a fork with a reason.
