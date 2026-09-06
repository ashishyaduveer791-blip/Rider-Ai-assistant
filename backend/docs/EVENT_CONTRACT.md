# Event Contract

This document defines the single, shared event format used by the Frontend, Backend, AI System, and Adaptive Attention Scheduler (AAS). All parts of the system MUST use this exact structure — no custom/incompatible event shapes are allowed.

## Event Types
- NAVIGATION
- CUSTOMER_MESSAGE
- CUSTOMER_CALL
- OTP
- MANAGER_MESSAGE
- RIDER_VOICE
- SAFETY_ALERT

## Event Statuses
- PENDING — just created, not yet queued
- QUEUED — waiting in the Event Queue
- EVALUATED — AAS has assigned a decision
- DELIVERED — successfully spoken/shown to the user
- WAITING — held back by AAS (decision = WAIT)
- MERGED — combined with another related event
- DROPPED — discarded, will not be delivered
- EXPIRED — timed out before being handled
- FAILED — an error occurred during processing

## AAS Decisions
- SPEAK — deliver this event now
- WAIT — hold, re-evaluate later
- MERGE — combine with another pending event
- DROP — discard, do not deliver

## Priority Fields
- `basePriority` (0-100, integer): static default based on event type, set at creation.
- `semanticPriority` (0-100, integer, nullable): dynamic score computed later by the AI system based on content urgency. Null until processed.

### Default basePriority per type
| Type | Default basePriority |
|---|---|
| SAFETY_ALERT | 100 |
| OTP | 90 |
| CUSTOMER_CALL | 85 |
| RIDER_VOICE | 80 |
| NAVIGATION | 75 |
| CUSTOMER_MESSAGE | 70 |
| MANAGER_MESSAGE | 60 |

## reasonCode values
- CRITICAL_SAFETY
- HIGH_URGENCY
- USER_BUSY
- LOW_PRIORITY
- DUPLICATE_CONTENT
- CONTEXT_MERGE
- RATE_LIMIT
- MANUAL_OVERRIDE
- EXPIRED_TTL
- DEFAULT

## Event Structure

| Field | Type | Required at creation? | Description |
|---|---|---|---|
| id | string | Yes | Unique identifier |
| type | enum (Event Types) | Yes | Category of event |
| source | string | Yes | Origin of the event (e.g. "customer", "rider", "manager", "system", "ai") |
| content | string | Yes | Human-readable message/payload |
| basePriority | integer (0-100) | Yes | Static priority based on type |
| semanticPriority | integer (0-100) or null | No (filled later) | Dynamic priority from AI |
| timestamp | integer (Unix ms) | Yes | When the event was created |
| status | enum (Event Statuses) | Yes (defaults to PENDING) | Lifecycle stage |
| decision | enum (AAS Decisions) or null | No (filled later) | AAS's decision |
| reasonCode | enum (reasonCode) or null | No (filled later) | Why the decision was made |

## Example Event

```json
{
  "id": "event-001",
  "type": "CUSTOMER_MESSAGE",
  "source": "customer",
  "content": "Gate 1 is closed. Use Gate 3.",
  "basePriority": 70,
  "semanticPriority": null,
  "timestamp": 1732000000000,
  "status": "PENDING",
  "decision": null,
  "reasonCode": null
}