# Specification

## Summary
**Goal:** Make newly created/updated time slots auto-publish by default and add admin bulk controls to hide/unhide and enable/disable all currently visible slots.

**Planned changes:**
- Backend: Update time slot create/update behavior so newly created slots and slots updated via the admin update operation default to `isLive=true` (published), while preserving an existing slot’s `isEnabled=false` unless explicitly changed.
- Backend: Add an admin-only bulk operation that takes the currently visible slot identifiers and target booleans (`isLive`, `isEnabled`) and applies those exact states in a single call.
- Frontend (Admin Slots): Remove messaging that implies newly created slots are hidden by default; add bulk actions that set Live/Hidden and Enabled/Disabled for all slots currently visible in the “Manage Time Slots” list; refresh data by invalidating/refetching `['allTimeSlots']` and `['availableTimeSlots']`.

**User-visible outcome:** Admins see newly created/updated slots publish automatically, and can bulk hide/unhide and enable/disable all currently visible slots from the Admin “Manage Time Slots” list, with the Booking page updating accordingly.
