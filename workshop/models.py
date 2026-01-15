"""Pydantic models for workshop data."""

from datetime import date, time
from decimal import Decimal
from enum import Enum
from typing import Optional

from pydantic import BaseModel, Field


class GuestStatus(str, Enum):
    ACCEPTED = "Accepted"
    ACCEPTED_TENTATIVE = "Accepted (Tentative)"
    INVITED = "Invited"
    PLANNED = "Planned"
    PROPOSED = "Proposed"
    DECLINED = "Declined"
    NO_RESPONSE = "No Response (declined)"


class GuestType(str, Enum):
    ORGANIZER = "Organizer"
    SPEAKER = "Speaker"
    PARTICIPANT = "Participant"
    UNDECIDED = "Undecided"


class Guest(BaseModel):
    """A workshop guest/participant."""

    id: Optional[int] = None
    name: str
    affiliation: Optional[str] = None
    status: GuestStatus = GuestStatus.PROPOSED
    type: Optional[GuestType] = None
    notes: Optional[str] = None
    tags: Optional[str] = None  # Comma-separated: "CS, Academic, Linguist"
    email: Optional[str] = None
    proposed_by: Optional[str] = None
    area: Optional[str] = None  # Research area / expertise
    stipend: Decimal = Decimal("0")
    honorarium: Decimal = Decimal("0")

    @property
    def tag_list(self) -> list[str]:
        """Return tags as a list."""
        if not self.tags:
            return []
        return [t.strip() for t in self.tags.split(",") if t.strip()]

    @property
    def is_confirmed(self) -> bool:
        """Check if guest has accepted (including tentative)."""
        return self.status in (GuestStatus.ACCEPTED, GuestStatus.ACCEPTED_TENTATIVE)


class Organizer(BaseModel):
    """A workshop organizer."""

    id: Optional[int] = None
    name: str
    affiliation: Optional[str] = None
    email: Optional[str] = None
    email_secondary: Optional[str] = None


class BudgetItem(BaseModel):
    """A budget line item."""

    id: Optional[int] = None
    item: str
    amount: Decimal
    notes: Optional[str] = None


class TravelCost(BaseModel):
    """Reference travel cost from a city to LA."""

    id: Optional[int] = None
    origin: str
    avg_fare: Decimal


class TopicRecommendation(BaseModel):
    """A suggested topic or format for the workshop."""

    id: Optional[int] = None
    event: str
    type: Optional[str] = None  # Format, Topic, Output
    suggested_by: Optional[str] = None
    notes: Optional[str] = None


class ScheduleEvent(BaseModel):
    """A scheduled event in the workshop agenda."""

    id: Optional[int] = None
    day: Optional[date] = None
    start_time: Optional[time] = None
    end_time: Optional[time] = None
    event: Optional[str] = None


class BudgetSummary(BaseModel):
    """Summary of budget status."""

    total_budget: Decimal
    participant_travel_budget: Decimal
    participant_travel_committed: Decimal
    participant_travel_remaining: Decimal
    speaker_fees_budget: Decimal
    speaker_fees_committed: Decimal
    speaker_travel_budget: Decimal
    speaker_travel_committed: Decimal
    confirmed_count: int
    estimated_additional_participants: int


class GuestSummary(BaseModel):
    """Summary of guest list status."""

    total: int
    accepted: int
    accepted_tentative: int
    invited: int
    planned: int
    proposed: int
    declined: int
    no_response: int

    @property
    def confirmed(self) -> int:
        return self.accepted + self.accepted_tentative
