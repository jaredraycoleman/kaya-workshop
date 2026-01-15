# Kaya Workshop - AI & Indigenous Languages

Workshop on AI and Indigenous Language Revitalization, **June 8–10, 2026**.

> **Note to Claude**: Keep this README updated with any new instructions, file references, or context needed for future sessions. Keep it concise.

## Workshop Summary

An interdisciplinary workshop to define responsible and collaborative practices for applying AI to endangered language research and revitalization. Brings together language teachers, linguists, archivists, and AI researchers to surface shared challenges, highlight promising approaches, and develop guidance for effective collaboration. Outputs: position paper, recommendations for researchers/funders, and formation of an interdisciplinary working group.

## Python Environment

```bash
conda activate kaya-workshop
```

Packages: `openpyxl`, `pydantic`, `pandas`, `matplotlib`

## Database

Workshop data is stored in SQLite at `data/workshop.db`. Use the `workshop` Python module to access it.

### CLI Commands

```bash
# Show overall status (guests, budget)
python -m workshop.cli status

# List guests (with optional filters)
python -m workshop.cli guests
python -m workshop.cli guests --confirmed
python -m workshop.cli guests --status "Invited"
python -m workshop.cli guests --tag "Language Program"

# Find a specific guest
python -m workshop.cli find "Howard"

# Update guest status
python -m workshop.cli update-status "Howard Paden" "Accepted"

# Show detailed budget
python -m workshop.cli budget

# Export to Excel (for sharing with co-organizers)
python -m workshop.cli export workshop_export.xlsx
```

### Python API

```python
from workshop import WorkshopDB, GuestStatus

db = WorkshopDB()

# Get guests
db.get_guests()                           # All guests
db.get_guests(confirmed_only=True)        # Confirmed only
db.get_guests(status=GuestStatus.INVITED) # By status
db.get_guests(tag="Language Program")     # By tag
db.get_guest_by_name("Howard")            # Find by name

# Update status
db.update_guest_status("Howard Paden", GuestStatus.ACCEPTED)

# Budget
db.get_budget_summary()  # Returns BudgetSummary with remaining amounts

# Export
db.export_to_excel("export.xlsx")
db.to_dataframe("guests")  # Get as pandas DataFrame
```

### Visualizations

```python
from workshop.visualize import plot_dashboard, print_report
plot_dashboard(db)  # Multi-panel dashboard
print_report(db)    # Text report
```

### Jupyter Notebook

`workshop_report.ipynb` - Interactive report with visualizations

## Google Drive

Files managed with [gdrive](https://github.com/glotlabs/gdrive). Folder ID: `11ckcjb8H3czgbkGkALEzwmwmr2dVj4pt`

```bash
# List files
gdrive files list --parent 11ckcjb8H3czgbkGkALEzwmwmr2dVj4pt

# Download all files
gdrive files download --recursive 11ckcjb8H3czgbkGkALEzwmwmr2dVj4pt

# Upload a file
gdrive files upload --parent 11ckcjb8H3czgbkGkALEzwmwmr2dVj4pt <filename>
```

## Key Files

| File | Description |
|------|-------------|
| `data/workshop.db` | SQLite database (source of truth) |
| `workshop/` | Python module for data access |
| `workshop_report.ipynb` | Jupyter notebook for reports |
| `Workshop on AI & Indigenous Language Revitalization/` | Downloaded Google Drive files |

## Database Tables

- **guests** – Invitees with status, affiliation, stipends, tags
- **organizers** – 5 organizers
- **budget** – $50k total (travel, speakers, meals, indirect)
- **travel_costs** – Reference airfares to LA
- **topics** – Event formats and outputs
- **schedule** – June 8–10, 2026 agenda
