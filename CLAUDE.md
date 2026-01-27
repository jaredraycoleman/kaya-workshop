# Kaya Workshop - Claude Code Guide

Workshop on AI and Indigenous Language Revitalization, **June 8–10, 2026** at LMU.

## Quick Reference

```bash
# Start dev server
npm run dev

# Workshop status (guests, budget)
npm run status

# Find a guest
npm run find -- "Howard"

# Update guest status
npm run update-status -- "Name" "Invited"

# Export to CSV
npm run export

# Build and deploy
npm run build
npm run deploy

# Sync with Google Drive
gdrive files list --parent 11ckcjb8H3czgbkGkALEzwmwmr2dVj4pt
gdrive files upload --parent 11ckcjb8H3czgbkGkALEzwmwmr2dVj4pt <file>
```

## Project Structure

```
kaya-workshop/
├── CLAUDE.md              # This file
├── README.md              # Project overview
├── src/                   # React web app
│   ├── components/        # UI components (shadcn/ui)
│   │   ├── ui/            # Base components (button, card, table, etc.)
│   │   └── dashboard/     # Dashboard-specific components
│   └── lib/               # Utilities and types
│       ├── data.ts        # Data access functions
│       ├── types.ts       # TypeScript types
│       └── utils.ts       # Helpers (cn function)
├── scripts/               # CLI scripts (TypeScript, run with tsx)
│   ├── status.ts          # Show workshop status
│   ├── find.ts            # Find guest by name
│   ├── guests.ts          # List guests with filters
│   ├── update-status.ts   # Update guest status
│   └── export.ts          # Export to CSV
├── data/workshop.json     # Source of truth (JSON, git-tracked)
├── public/docs/           # PDFs served by web app
├── todo/                  # Draft emails
│   └── done/              # Sent emails
└── docs/                  # Original reference documents
```

## Data Store

**Source of truth**: `data/workshop.json` (JSON file, git-tracked)

You can edit the JSON directly or use the CLI scripts.

### Data Structure
- `guests` - Invitees with status, affiliation, stipends, tags
- `budget` - Line items totaling $50k
- `organizers`, `schedule`, `topics`, `travel_costs`

### Guest Statuses
- `Accepted`, `Accepted (Tentative)` - Confirmed
- `Invited` - Awaiting response
- `Planned` - Ready to invite
- `Proposed` - Under consideration
- `Declined`, `No Response` - Not attending

## When Jared Asks To...

### "Invite someone" or "draft an email"
1. Save draft to `todo/invite_<name>.md`
2. Use the template style from existing invites in `todo/done/`
3. Add person to database if not already there (edit `data/workshop.json`)

### "Update the spreadsheet" or "mark as invited"
1. Run `npm run update-status -- "Name" "Invited"`
2. Or edit `data/workshop.json` directly
3. Move the invite file to `todo/done/` if sent

### "Check the budget" or "how many can I invite"
1. Run `npm run status`
2. Participant travel budget: $18,751
3. Average stipend: ~$1,000-1,250

### "Upload to Google Drive"
```bash
gdrive files upload --parent 11ckcjb8H3czgbkGkALEzwmwmr2dVj4pt <file>
```

### "Download from Google Drive"
```bash
gdrive files download --recursive 11ckcjb8H3czgbkGkALEzwmwmr2dVj4pt
```

## Key Contacts & IDs

- **Google Drive Folder**: `11ckcjb8H3czgbkGkALEzwmwmr2dVj4pt`
- **NSF Award**: #2542375
- **Workshop Dates**: June 8–10, 2026
- **Location**: Loyola Marymount University, Los Angeles

## Important Notes

- Data is in `data/workshop.json` - human-readable and git-trackable
- Draft emails go in `todo/`, move to `todo/done/` when sent
- Keep invite emails consistent with existing style (see `todo/done/` for examples)
- Local CS faculty (UCLA, USC, LMU) don't need stipends
- Web app reads from `data/workshop.json` at build time - rebuild after data changes
- PDFs in `public/docs/` are served at `/docs/` in the web app
