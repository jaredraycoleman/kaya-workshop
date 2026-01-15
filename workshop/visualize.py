"""Visualization functions for workshop data."""

from collections import defaultdict
from typing import Optional

import matplotlib.pyplot as plt
import pandas as pd

from workshop.db import WorkshopDB
from workshop.models import GuestStatus


def plot_guest_status(db: WorkshopDB, ax: Optional[plt.Axes] = None) -> plt.Figure:
    """Pie chart of guest statuses."""
    summary = db.get_guest_summary()

    labels = []
    sizes = []
    colors = []

    status_data = [
        ("Accepted", summary.accepted, "#2ecc71"),
        ("Tentative", summary.accepted_tentative, "#f39c12"),
        ("Invited", summary.invited, "#3498db"),
        ("Planned", summary.planned, "#9b59b6"),
        ("Proposed", summary.proposed, "#95a5a6"),
        ("Declined", summary.declined + summary.no_response, "#e74c3c"),
    ]

    for label, count, color in status_data:
        if count > 0:
            labels.append(f"{label} ({count})")
            sizes.append(count)
            colors.append(color)

    if ax is None:
        fig, ax = plt.subplots(figsize=(8, 6))
    else:
        fig = ax.figure

    ax.pie(sizes, labels=labels, colors=colors, autopct="%1.0f%%", startangle=90)
    ax.set_title(f"Guest Status ({summary.total} total)")

    return fig


def plot_budget_status(db: WorkshopDB, ax: Optional[plt.Axes] = None) -> plt.Figure:
    """Bar chart of budget committed vs remaining."""
    summary = db.get_budget_summary()

    categories = ["Participant\nTravel", "Speaker\nFees", "Speaker\nTravel"]
    committed = [
        float(summary.participant_travel_committed),
        float(summary.speaker_fees_committed),
        float(summary.speaker_travel_committed),
    ]
    remaining = [
        float(summary.participant_travel_remaining),
        float(summary.speaker_fees_budget - summary.speaker_fees_committed),
        float(summary.speaker_travel_budget),
    ]

    if ax is None:
        fig, ax = plt.subplots(figsize=(10, 6))
    else:
        fig = ax.figure

    x = range(len(categories))
    width = 0.35

    bars1 = ax.bar([i - width / 2 for i in x], committed, width, label="Committed", color="#e74c3c")
    bars2 = ax.bar([i + width / 2 for i in x], remaining, width, label="Remaining", color="#2ecc71")

    ax.set_ylabel("Amount ($)")
    ax.set_title("Budget Status")
    ax.set_xticks(x)
    ax.set_xticklabels(categories)
    ax.legend()

    # Add value labels
    for bar in bars1:
        height = bar.get_height()
        if height > 0:
            ax.annotate(
                f"${height:,.0f}",
                xy=(bar.get_x() + bar.get_width() / 2, height),
                ha="center",
                va="bottom",
                fontsize=9,
            )

    for bar in bars2:
        height = bar.get_height()
        if height > 0:
            ax.annotate(
                f"${height:,.0f}",
                xy=(bar.get_x() + bar.get_width() / 2, height),
                ha="center",
                va="bottom",
                fontsize=9,
            )

    return fig


def plot_tags_breakdown(db: WorkshopDB, confirmed_only: bool = True, ax: Optional[plt.Axes] = None) -> plt.Figure:
    """Bar chart of participant tags."""
    guests = db.get_guests(confirmed_only=confirmed_only)

    tag_counts: defaultdict[str, int] = defaultdict(int)
    for g in guests:
        for tag in g.tag_list:
            tag_counts[tag] += 1

    if not tag_counts:
        if ax is None:
            fig, ax = plt.subplots()
        else:
            fig = ax.figure
        ax.text(0.5, 0.5, "No data", ha="center", va="center")
        return fig

    # Sort by count
    sorted_tags = sorted(tag_counts.items(), key=lambda x: -x[1])
    tags = [t[0] for t in sorted_tags]
    counts = [t[1] for t in sorted_tags]

    if ax is None:
        fig, ax = plt.subplots(figsize=(10, 6))
    else:
        fig = ax.figure

    bars = ax.barh(tags, counts, color="#3498db")
    ax.set_xlabel("Count")
    title = "Confirmed Participants by Tag" if confirmed_only else "All Guests by Tag"
    ax.set_title(title)
    ax.invert_yaxis()

    # Add count labels
    for bar, count in zip(bars, counts):
        ax.annotate(
            str(count),
            xy=(bar.get_width(), bar.get_y() + bar.get_height() / 2),
            ha="left",
            va="center",
            fontsize=9,
            xytext=(3, 0),
            textcoords="offset points",
        )

    return fig


def plot_dashboard(db: WorkshopDB) -> plt.Figure:
    """Create a dashboard with multiple plots."""
    fig, axes = plt.subplots(2, 2, figsize=(14, 10))

    plot_guest_status(db, ax=axes[0, 0])
    plot_budget_status(db, ax=axes[0, 1])
    plot_tags_breakdown(db, confirmed_only=True, ax=axes[1, 0])
    plot_tags_breakdown(db, confirmed_only=False, ax=axes[1, 1])
    axes[1, 1].set_title("All Guests by Tag")

    plt.tight_layout()
    return fig


def print_report(db: WorkshopDB) -> None:
    """Print a text-based report."""
    guest_summary = db.get_guest_summary()
    budget_summary = db.get_budget_summary()

    print("=" * 60)
    print("KAYA WORKSHOP - STATUS REPORT")
    print("AI & Indigenous Language Revitalization | June 8-10, 2026")
    print("=" * 60)

    print(f"\n📋 PARTICIPANTS")
    print(f"   Total in database: {guest_summary.total}")
    print(f"   Confirmed:         {guest_summary.confirmed}")
    print(f"   Pending response:  {guest_summary.invited}")
    print(f"   To invite:         {guest_summary.planned}")

    print(f"\n💰 BUDGET STATUS")
    print(f"   Participant Travel: ${budget_summary.participant_travel_committed:,.0f} / ${budget_summary.participant_travel_budget:,.0f} committed")
    print(f"   Remaining:          ${budget_summary.participant_travel_remaining:,.0f}")
    print(f"   Can invite:         ~{budget_summary.estimated_additional_participants} more participants")

    # Confirmed participants
    print(f"\n✅ CONFIRMED PARTICIPANTS ({guest_summary.confirmed})")
    print("-" * 60)
    confirmed = db.get_guests(confirmed_only=True)
    for g in confirmed:
        stipend = f"${g.stipend:,.0f}" if g.stipend else "no stipend"
        status = "(tentative)" if g.status == GuestStatus.ACCEPTED_TENTATIVE else ""
        print(f"   {g.name} - {g.affiliation or 'N/A'} [{stipend}] {status}")

    # Pending
    invited = db.get_guests(status=GuestStatus.INVITED)
    if invited:
        print(f"\n📨 AWAITING RESPONSE ({len(invited)})")
        print("-" * 60)
        for g in invited:
            print(f"   {g.name} - {g.affiliation or 'N/A'}")

    # Planned
    planned = db.get_guests(status=GuestStatus.PLANNED)
    if planned:
        print(f"\n📝 TO INVITE ({len(planned)})")
        print("-" * 60)
        for g in planned:
            print(f"   {g.name} - {g.affiliation or 'N/A'}")

    # Language program gap
    lang_program = db.get_guests(tag="Language Program")
    confirmed_lang = [g for g in lang_program if g.is_confirmed]
    print(f"\n🗣️ LANGUAGE PROGRAM PARTICIPANTS: {len(confirmed_lang)} confirmed")
    if len(confirmed_lang) < 3:
        print("   ⚠️  Goal: 3+ language program participants")
        not_confirmed = [g for g in lang_program if not g.is_confirmed]
        if not_confirmed:
            print("   Candidates:")
            for g in not_confirmed[:5]:
                print(f"      - {g.name} ({g.affiliation}) [{g.status.value}]")
