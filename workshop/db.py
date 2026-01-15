"""SQLite database interface for workshop data."""

import sqlite3
from datetime import date, time
from decimal import Decimal
from pathlib import Path
from typing import Optional

import pandas as pd

from workshop.models import (
    Guest,
    GuestStatus,
    GuestType,
    Organizer,
    BudgetItem,
    TravelCost,
    TopicRecommendation,
    ScheduleEvent,
    BudgetSummary,
    GuestSummary,
)

DEFAULT_DB_PATH = Path(__file__).parent.parent / "data" / "workshop.db"


class WorkshopDB:
    """Interface to the workshop SQLite database."""

    def __init__(self, db_path: Path | str = DEFAULT_DB_PATH):
        self.db_path = Path(db_path)
        self.db_path.parent.mkdir(parents=True, exist_ok=True)
        self._init_db()

    def _get_conn(self) -> sqlite3.Connection:
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        return conn

    def _init_db(self) -> None:
        """Create tables if they don't exist."""
        conn = self._get_conn()
        conn.executescript("""
            CREATE TABLE IF NOT EXISTS guests (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                affiliation TEXT,
                status TEXT DEFAULT 'Proposed',
                type TEXT,
                notes TEXT,
                tags TEXT,
                email TEXT,
                proposed_by TEXT,
                area TEXT,
                stipend REAL DEFAULT 0,
                honorarium REAL DEFAULT 0
            );

            CREATE TABLE IF NOT EXISTS organizers (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                affiliation TEXT,
                email TEXT,
                email_secondary TEXT
            );

            CREATE TABLE IF NOT EXISTS budget (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                item TEXT NOT NULL,
                amount REAL NOT NULL,
                notes TEXT
            );

            CREATE TABLE IF NOT EXISTS travel_costs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                origin TEXT NOT NULL,
                avg_fare REAL NOT NULL
            );

            CREATE TABLE IF NOT EXISTS topics (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                event TEXT NOT NULL,
                type TEXT,
                suggested_by TEXT,
                notes TEXT
            );

            CREATE TABLE IF NOT EXISTS schedule (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                day TEXT,
                start_time TEXT,
                end_time TEXT,
                event TEXT
            );
        """)
        conn.commit()
        conn.close()

    # -------------------------------------------------------------------------
    # Guest operations
    # -------------------------------------------------------------------------

    def get_guests(
        self,
        status: Optional[GuestStatus | list[GuestStatus]] = None,
        tag: Optional[str] = None,
        confirmed_only: bool = False,
    ) -> list[Guest]:
        """Get guests with optional filtering."""
        conn = self._get_conn()
        query = "SELECT * FROM guests WHERE 1=1"
        params: list = []

        if confirmed_only:
            query += " AND status IN (?, ?)"
            params.extend([GuestStatus.ACCEPTED.value, GuestStatus.ACCEPTED_TENTATIVE.value])
        elif status:
            if isinstance(status, list):
                placeholders = ",".join("?" * len(status))
                query += f" AND status IN ({placeholders})"
                params.extend([s.value for s in status])
            else:
                query += " AND status = ?"
                params.append(status.value)

        if tag:
            query += " AND tags LIKE ?"
            params.append(f"%{tag}%")

        query += " ORDER BY name"
        rows = conn.execute(query, params).fetchall()
        conn.close()

        return [self._row_to_guest(row) for row in rows]

    def get_guest(self, guest_id: int) -> Optional[Guest]:
        """Get a single guest by ID."""
        conn = self._get_conn()
        row = conn.execute("SELECT * FROM guests WHERE id = ?", (guest_id,)).fetchone()
        conn.close()
        return self._row_to_guest(row) if row else None

    def get_guest_by_name(self, name: str) -> Optional[Guest]:
        """Get a single guest by name (case-insensitive partial match)."""
        conn = self._get_conn()
        row = conn.execute(
            "SELECT * FROM guests WHERE LOWER(name) LIKE LOWER(?)", (f"%{name}%",)
        ).fetchone()
        conn.close()
        return self._row_to_guest(row) if row else None

    def add_guest(self, guest: Guest) -> Guest:
        """Add a new guest."""
        conn = self._get_conn()
        cursor = conn.execute(
            """INSERT INTO guests (name, affiliation, status, type, notes, tags,
               email, proposed_by, area, stipend, honorarium)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (
                guest.name,
                guest.affiliation,
                guest.status.value,
                guest.type.value if guest.type else None,
                guest.notes,
                guest.tags,
                guest.email,
                guest.proposed_by,
                guest.area,
                float(guest.stipend),
                float(guest.honorarium),
            ),
        )
        conn.commit()
        guest.id = cursor.lastrowid
        conn.close()
        return guest

    def update_guest(self, guest: Guest) -> None:
        """Update an existing guest."""
        if not guest.id:
            raise ValueError("Guest must have an ID to update")
        conn = self._get_conn()
        conn.execute(
            """UPDATE guests SET name=?, affiliation=?, status=?, type=?, notes=?,
               tags=?, email=?, proposed_by=?, area=?, stipend=?, honorarium=?
               WHERE id=?""",
            (
                guest.name,
                guest.affiliation,
                guest.status.value,
                guest.type.value if guest.type else None,
                guest.notes,
                guest.tags,
                guest.email,
                guest.proposed_by,
                guest.area,
                float(guest.stipend),
                float(guest.honorarium),
                guest.id,
            ),
        )
        conn.commit()
        conn.close()

    def update_guest_status(self, name: str, status: GuestStatus) -> bool:
        """Update a guest's status by name. Returns True if found and updated."""
        guest = self.get_guest_by_name(name)
        if not guest:
            return False
        guest.status = status
        self.update_guest(guest)
        return True

    def _row_to_guest(self, row: sqlite3.Row) -> Guest:
        return Guest(
            id=row["id"],
            name=row["name"],
            affiliation=row["affiliation"],
            status=GuestStatus(row["status"]) if row["status"] else GuestStatus.PROPOSED,
            type=GuestType(row["type"]) if row["type"] else None,
            notes=row["notes"],
            tags=row["tags"],
            email=row["email"],
            proposed_by=row["proposed_by"],
            area=row["area"],
            stipend=Decimal(str(row["stipend"] or 0)),
            honorarium=Decimal(str(row["honorarium"] or 0)),
        )

    # -------------------------------------------------------------------------
    # Budget operations
    # -------------------------------------------------------------------------

    def get_budget(self) -> list[BudgetItem]:
        """Get all budget items."""
        conn = self._get_conn()
        rows = conn.execute("SELECT * FROM budget ORDER BY id").fetchall()
        conn.close()
        return [
            BudgetItem(
                id=row["id"],
                item=row["item"],
                amount=Decimal(str(row["amount"])),
                notes=row["notes"],
            )
            for row in rows
        ]

    def get_budget_summary(self) -> BudgetSummary:
        """Get a summary of budget status."""
        budget = {b.item: b.amount for b in self.get_budget()}
        guests = self.get_guests(confirmed_only=True)

        committed_stipends = sum(g.stipend for g in guests)
        committed_honoraria = sum(g.honorarium for g in guests)

        participant_budget = budget.get("Participant Travel", Decimal("18751"))
        speaker_fees_budget = budget.get("Speaker Fees", Decimal("6750"))
        speaker_travel_budget = budget.get("Speaker Travel", Decimal("11250"))
        total = budget.get("Total", Decimal("50000"))

        remaining = participant_budget - committed_stipends
        avg_stipend = Decimal("1125")
        estimated = int(remaining / avg_stipend) if avg_stipend else 0

        return BudgetSummary(
            total_budget=total,
            participant_travel_budget=participant_budget,
            participant_travel_committed=committed_stipends,
            participant_travel_remaining=remaining,
            speaker_fees_budget=speaker_fees_budget,
            speaker_fees_committed=committed_honoraria,
            speaker_travel_budget=speaker_travel_budget,
            speaker_travel_committed=Decimal("0"),
            confirmed_count=len(guests),
            estimated_additional_participants=estimated,
        )

    # -------------------------------------------------------------------------
    # Guest summary
    # -------------------------------------------------------------------------

    def get_guest_summary(self) -> GuestSummary:
        """Get a summary of guest statuses."""
        conn = self._get_conn()
        rows = conn.execute(
            "SELECT status, COUNT(*) as count FROM guests GROUP BY status"
        ).fetchall()
        conn.close()

        counts = {row["status"]: row["count"] for row in rows}
        total = sum(counts.values())

        return GuestSummary(
            total=total,
            accepted=counts.get(GuestStatus.ACCEPTED.value, 0),
            accepted_tentative=counts.get(GuestStatus.ACCEPTED_TENTATIVE.value, 0),
            invited=counts.get(GuestStatus.INVITED.value, 0),
            planned=counts.get(GuestStatus.PLANNED.value, 0),
            proposed=counts.get(GuestStatus.PROPOSED.value, 0),
            declined=counts.get(GuestStatus.DECLINED.value, 0),
            no_response=counts.get(GuestStatus.NO_RESPONSE.value, 0),
        )

    # -------------------------------------------------------------------------
    # Other tables
    # -------------------------------------------------------------------------

    def get_organizers(self) -> list[Organizer]:
        """Get all organizers."""
        conn = self._get_conn()
        rows = conn.execute("SELECT * FROM organizers ORDER BY name").fetchall()
        conn.close()
        return [
            Organizer(
                id=row["id"],
                name=row["name"],
                affiliation=row["affiliation"],
                email=row["email"],
                email_secondary=row["email_secondary"],
            )
            for row in rows
        ]

    def get_travel_costs(self) -> list[TravelCost]:
        """Get all travel cost references."""
        conn = self._get_conn()
        rows = conn.execute("SELECT * FROM travel_costs ORDER BY avg_fare").fetchall()
        conn.close()
        return [
            TravelCost(
                id=row["id"],
                origin=row["origin"],
                avg_fare=Decimal(str(row["avg_fare"])),
            )
            for row in rows
        ]

    def get_topics(self) -> list[TopicRecommendation]:
        """Get all topic/format recommendations."""
        conn = self._get_conn()
        rows = conn.execute("SELECT * FROM topics ORDER BY type, event").fetchall()
        conn.close()
        return [
            TopicRecommendation(
                id=row["id"],
                event=row["event"],
                type=row["type"],
                suggested_by=row["suggested_by"],
                notes=row["notes"],
            )
            for row in rows
        ]

    def get_schedule(self) -> list[ScheduleEvent]:
        """Get the workshop schedule."""
        conn = self._get_conn()
        rows = conn.execute("SELECT * FROM schedule ORDER BY id").fetchall()
        conn.close()
        return [
            ScheduleEvent(
                id=row["id"],
                day=date.fromisoformat(row["day"]) if row["day"] else None,
                start_time=time.fromisoformat(row["start_time"]) if row["start_time"] else None,
                end_time=time.fromisoformat(row["end_time"]) if row["end_time"] else None,
                event=row["event"],
            )
            for row in rows
        ]

    # -------------------------------------------------------------------------
    # Export / Import
    # -------------------------------------------------------------------------

    def export_to_excel(self, path: Path | str) -> None:
        """Export the database to an Excel file."""
        path = Path(path)
        conn = self._get_conn()

        with pd.ExcelWriter(path, engine="openpyxl") as writer:
            # Guests
            df = pd.read_sql_query("SELECT * FROM guests ORDER BY name", conn)
            df.to_excel(writer, sheet_name="Guest List", index=False)

            # Organizers
            df = pd.read_sql_query("SELECT * FROM organizers ORDER BY name", conn)
            df.to_excel(writer, sheet_name="Organization Committee", index=False)

            # Budget
            df = pd.read_sql_query("SELECT * FROM budget", conn)
            df.to_excel(writer, sheet_name="Budget", index=False)

            # Travel costs
            df = pd.read_sql_query("SELECT * FROM travel_costs ORDER BY avg_fare", conn)
            df.to_excel(writer, sheet_name="Travel Costs", index=False)

            # Topics
            df = pd.read_sql_query("SELECT * FROM topics", conn)
            df.to_excel(writer, sheet_name="TopicsFormat Recommendations", index=False)

            # Schedule
            df = pd.read_sql_query("SELECT * FROM schedule", conn)
            df.to_excel(writer, sheet_name="Schedule", index=False)

        conn.close()

    def to_dataframe(self, table: str = "guests") -> pd.DataFrame:
        """Get a table as a pandas DataFrame."""
        conn = self._get_conn()
        df = pd.read_sql_query(f"SELECT * FROM {table}", conn)
        conn.close()
        return df
