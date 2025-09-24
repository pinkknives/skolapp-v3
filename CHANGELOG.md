# Changelog

## v0.4.0 — Milestones A–D complete

- Data model & RLS (A1–A2): base tables, policies, GDPR constraints
- Aggregation RPCs (A3): `get_student_progress`, `get_class_progress`, `get_school_progress`, `list_top_bottom_students`
- Charts & analytics UI (B): Line/Bar/Distribution + teacher/student/class pages
- Shareable reports (C): signed links, read‑only report page, PDF/PNG export
- AI insights v1 (D): endpoints + panel with explainability sources
- Ops: backfill workflow (verify/backfill), tag v0.10.0 for analytics bundle

Upgrade
- Apply migrations 016→020
- Run the backfill workflow (mode: backfill)
- Set env: NextAuth, Supabase, OpenAI, Stripe, Google
