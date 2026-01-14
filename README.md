# Kaya Workshop - AI & Indigenous Languages

Workshop on AI and Indigenous Language Revitalization, **June 8–10, 2026**.

> **Note to Claude**: Keep this README updated with any new instructions, file references, or context needed for future sessions. Keep it concise.

## Workshop Summary

An interdisciplinary workshop to define responsible and collaborative practices for applying AI to endangered language research and revitalization. Brings together language teachers, linguists, archivists, and AI researchers to surface shared challenges, highlight promising approaches, and develop guidance for effective collaboration. Outputs: position paper, recommendations for researchers/funders, and formation of an interdisciplinary working group.

## Python Environment

```bash
conda activate kaya-workshop
```

Packages: `openpyxl` (for reading Excel files)

## Google Drive

Files managed with [gdrive](https://github.com/glotlabs/gdrive). Folder ID: `11ckcjb8H3czgbkGkALEzwmwmr2dVj4pt`

```bash
# List files
gdrive files list --parent 11ckcjb8H3czgbkGkALEzwmwmr2dVj4pt

# Download all files
gdrive files download --recursive 11ckcjb8H3czgbkGkALEzwmwmr2dVj4pt

# Upload a file
gdrive files upload --parent 11ckcjb8H3czgbkGkALEzwmwmr2dVj4pt <filename>

# Export Google Docs (use filename extension to set format)
gdrive files export <DOC_ID> "output.xlsx"
gdrive files export <DOC_ID> "output.pdf"
```

## Key Files

| File | Description |
|------|-------------|
| `Workshop on AI and Indigenous Languages Data.xlsx` | Main planning spreadsheet (Guest List, Budget, Schedule, etc.). Use this .xlsx version, not the legacy Google Sheet. |
| `Final Awarded Proposal (with PII).pdf` | Funded proposal |
| `Project Description.pdf` / `Project Summary.pdf` | Grant documents |
| `Topics-Suggestions.pdf` | Topic/format ideas |

## Spreadsheet Sheets

- **Organization Committee** – 5 organizers
- **Guest List** – Invitees with status, affiliation, stipends
- **Budget** – $50k total (travel, speakers, meals, indirect)
- **Travel Costs** – Reference airfares to LA
- **Topics/Format Recommendations** – Event formats and outputs
- **Schedule** – June 8–10, 2026 agenda
