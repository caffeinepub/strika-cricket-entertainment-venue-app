# Specification

## Summary
**Goal:** Ensure admin-created time slots appear immediately in the Admin “Manage Time Slots” view (including hidden/unpublished slots), while the Booking page continues to show only bookable slots.

**Planned changes:**
- Fix Admin slot listing to fetch and display all stored time slots (including hidden/unpublished and disabled), and update the list immediately after slot creation without a page refresh.
- Add an admin-only backend query to return all time slots with no filtering, and update the Admin Slots UI (AvailabilityManagementPanel) to use it via a new React Query hook.
- Keep the Booking page on the existing public availability query so it only shows live + enabled + future slots; ensure publishing (toggling Live) triggers query invalidation so Booking updates without a hard refresh.
- Update the admin “slots created” success messaging to clarify that created slots can be published (set Live) to appear on the Booking page.

**User-visible outcome:** Admins see newly created time slots instantly in “Manage Time Slots” (even when hidden), can clearly view/toggle Enabled/Disabled and Live/Hidden states, and customers only see slots on Booking after an admin publishes them.
