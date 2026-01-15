"""Command-line interface for workshop management."""

import argparse
import sys
from pathlib import Path

from workshop.db import WorkshopDB
from workshop.models import GuestStatus


def cmd_status(db: WorkshopDB, args: argparse.Namespace) -> None:
    """Show overall workshop status."""
    guest_summary = db.get_guest_summary()
    budget_summary = db.get_budget_summary()

    print("=" * 50)
    print("WORKSHOP STATUS")
    print("=" * 50)

    print(f"\n📋 GUESTS ({guest_summary.total} total)")
    print(f"   ✅ Confirmed: {guest_summary.confirmed}")
    print(f"      - Accepted: {guest_summary.accepted}")
    print(f"      - Tentative: {guest_summary.accepted_tentative}")
    print(f"   📨 Invited: {guest_summary.invited}")
    print(f"   📝 Planned: {guest_summary.planned}")
    print(f"   💡 Proposed: {guest_summary.proposed}")
    print(f"   ❌ Declined/No Response: {guest_summary.declined + guest_summary.no_response}")

    print(f"\n💰 BUDGET")
    print(f"   Total: ${budget_summary.total_budget:,.0f}")
    print(f"\n   Participant Travel:")
    print(f"      Budget:    ${budget_summary.participant_travel_budget:,.0f}")
    print(f"      Committed: ${budget_summary.participant_travel_committed:,.0f}")
    print(f"      Remaining: ${budget_summary.participant_travel_remaining:,.0f}")
    print(f"\n   → Can invite ~{budget_summary.estimated_additional_participants} more participants")


def cmd_guests(db: WorkshopDB, args: argparse.Namespace) -> None:
    """List guests with optional filtering."""
    status = None
    if args.status:
        try:
            status = GuestStatus(args.status)
        except ValueError:
            print(f"Invalid status: {args.status}")
            print(f"Valid options: {[s.value for s in GuestStatus]}")
            return

    guests = db.get_guests(
        status=status,
        tag=args.tag,
        confirmed_only=args.confirmed,
    )

    if not guests:
        print("No guests found matching criteria.")
        return

    print(f"\n{'Name':<30} {'Affiliation':<35} {'Status':<20} {'Stipend':>10}")
    print("-" * 97)
    for g in guests:
        stipend = f"${g.stipend:,.0f}" if g.stipend else "-"
        print(f"{g.name:<30} {(g.affiliation or ''):<35} {g.status.value:<20} {stipend:>10}")

    print(f"\nTotal: {len(guests)} guests")


def cmd_find(db: WorkshopDB, args: argparse.Namespace) -> None:
    """Find a guest by name."""
    guest = db.get_guest_by_name(args.name)
    if not guest:
        print(f"No guest found matching '{args.name}'")
        return

    print(f"\n{guest.name}")
    print("=" * len(guest.name))
    print(f"Affiliation: {guest.affiliation or 'N/A'}")
    print(f"Status:      {guest.status.value}")
    print(f"Type:        {guest.type.value if guest.type else 'N/A'}")
    print(f"Email:       {guest.email or 'N/A'}")
    print(f"Tags:        {guest.tags or 'N/A'}")
    print(f"Area:        {guest.area or 'N/A'}")
    print(f"Proposed by: {guest.proposed_by or 'N/A'}")
    print(f"Stipend:     ${guest.stipend:,.0f}")
    print(f"Honorarium:  ${guest.honorarium:,.0f}")
    if guest.notes:
        print(f"Notes:       {guest.notes}")


def cmd_update_status(db: WorkshopDB, args: argparse.Namespace) -> None:
    """Update a guest's status."""
    try:
        status = GuestStatus(args.status)
    except ValueError:
        print(f"Invalid status: {args.status}")
        print(f"Valid options: {[s.value for s in GuestStatus]}")
        return

    if db.update_guest_status(args.name, status):
        print(f"Updated {args.name} → {status.value}")
    else:
        print(f"No guest found matching '{args.name}'")


def cmd_export(db: WorkshopDB, args: argparse.Namespace) -> None:
    """Export database to Excel."""
    path = Path(args.output)
    db.export_to_excel(path)
    print(f"Exported to {path}")


def cmd_budget(db: WorkshopDB, args: argparse.Namespace) -> None:
    """Show detailed budget breakdown."""
    budget = db.get_budget()
    summary = db.get_budget_summary()

    print("\n💰 BUDGET BREAKDOWN")
    print("=" * 40)
    for item in budget:
        print(f"{item.item:<25} ${item.amount:>10,.0f}")
    print("=" * 40)

    print("\n📊 COMMITTED FUNDS (from confirmed guests)")
    print(f"   Stipends:   ${summary.participant_travel_committed:,.0f}")
    print(f"   Honoraria:  ${summary.speaker_fees_committed:,.0f}")

    print(f"\n💵 REMAINING")
    print(f"   Participant Travel: ${summary.participant_travel_remaining:,.0f}")
    print(f"   Speaker Fees:       ${summary.speaker_fees_budget - summary.speaker_fees_committed:,.0f}")
    print(f"   Speaker Travel:     ${summary.speaker_travel_budget:,.0f}")


def main() -> None:
    parser = argparse.ArgumentParser(description="Workshop management CLI")
    parser.add_argument("--db", type=Path, help="Path to database file")
    subparsers = parser.add_subparsers(dest="command", required=True)

    # status command
    subparsers.add_parser("status", help="Show overall workshop status")

    # guests command
    guests_parser = subparsers.add_parser("guests", help="List guests")
    guests_parser.add_argument("--status", help="Filter by status")
    guests_parser.add_argument("--tag", help="Filter by tag")
    guests_parser.add_argument("--confirmed", action="store_true", help="Show only confirmed")

    # find command
    find_parser = subparsers.add_parser("find", help="Find a guest by name")
    find_parser.add_argument("name", help="Name to search for")

    # update-status command
    update_parser = subparsers.add_parser("update-status", help="Update guest status")
    update_parser.add_argument("name", help="Guest name")
    update_parser.add_argument("status", help="New status")

    # export command
    export_parser = subparsers.add_parser("export", help="Export to Excel")
    export_parser.add_argument("output", help="Output file path")

    # budget command
    subparsers.add_parser("budget", help="Show detailed budget")

    args = parser.parse_args()
    db = WorkshopDB(args.db) if args.db else WorkshopDB()

    commands = {
        "status": cmd_status,
        "guests": cmd_guests,
        "find": cmd_find,
        "update-status": cmd_update_status,
        "export": cmd_export,
        "budget": cmd_budget,
    }

    commands[args.command](db, args)


if __name__ == "__main__":
    main()
