# Kaya Workshop - AI & Indigenous Languages

Workshop on AI and Indigenous Language Revitalization, **June 8–10, 2026** at Loyola Marymount University.

## Workshop Summary

An interdisciplinary workshop to define responsible and collaborative practices for applying AI to endangered language research and revitalization. Brings together language teachers, linguists, archivists, and AI researchers to surface shared challenges, highlight promising approaches, and develop guidance for effective collaboration.

**Outputs**: Position paper, recommendations for researchers/funders, and formation of an interdisciplinary working group.

## Quick Start

```bash
npm install
npm run dev      # Start dev server at http://localhost:5173
npm run build    # Build for production
npm run deploy   # Deploy to Cloudflare Pages
```

## CLI Scripts

```bash
npm run status                          # Show guest counts, budget remaining
npm run find -- "Howard"                # Find a guest by name
npm run guests                          # List all guests
npm run guests -- --confirmed           # List confirmed only
npm run guests -- --tag "CS"            # Filter by tag
npm run update-status -- "Name" "Accepted"  # Update guest status
npm run export                          # Export to CSV
```

## Project Structure

```
kaya-workshop/
├── src/                    # React web app
│   ├── components/         # UI components (shadcn/ui)
│   └── lib/                # Data utilities and types
├── scripts/                # CLI scripts (TypeScript)
├── data/workshop.json      # Workshop data (source of truth)
├── public/docs/            # PDF documents served by web app
├── todo/                   # Draft emails and action items
│   └── done/               # Sent emails
└── docs/                   # Original reference documents
```

## Web App Features

- **Dashboard**: Stats cards, budget progress, pie chart, tag breakdowns
- **Guest List**: Sortable/filterable table with search and pagination
- **Schedule**: Workshop day overview
- **Documents**: Access to proposal PDFs
- **Dark Mode**: Toggle light/dark themes

## Claude Code Commands

| Command | Description |
|---------|-------------|
| `/status` | Show guest counts, budget remaining, follow-ups needed |
| `/invite <name>` | Draft an invitation email |
| `/sent <name>` | Mark an invite as sent, update database |
| `/find-invitees <criteria>` | Search for potential invitees |
| `/sync-drive` | Export and upload to Google Drive |

## Key Information

- **NSF Award**: #2542375
- **Dates**: June 8–10, 2026
- **Location**: Loyola Marymount University, Los Angeles
- **Budget**: $50,000 total ($18,751 for participant travel)
- **Google Drive**: [Shared Folder](https://drive.google.com/drive/folders/11ckcjb8H3czgbkGkALEzwmwmr2dVj4pt)

## Tech Stack

- Vite + React + TypeScript
- Tailwind CSS v4
- shadcn/ui components
- TanStack Table + Recharts
- Cloudflare Pages for hosting

## Documentation

- [CLAUDE.md](CLAUDE.md) - Detailed instructions for Claude Code
- [docs/](docs/) - Proposal documents, project summary
