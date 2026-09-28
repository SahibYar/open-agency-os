# Architecture

Aperture is an integration, not a monolith. Each product owns its database. n8n owns the business process. Playbooks upsert by email or phone. Core must run on 8 GB. Extra layers are compose profiles.
