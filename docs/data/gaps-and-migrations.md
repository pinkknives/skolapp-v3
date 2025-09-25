## Gap-analys

1) Index på `users.school_id`
   - Motiv: förväntade JOINs/filtrering per skola.
   - Åtgärd: skapa index `idx_users_school_id`.

2) FK för `users.school_id` (om skoltabel finns)
   - Saknas i nuläget. Avvakta tills skoltabel är definierad.

## Planerade migrationer

- 2025-idx-users-school-id.sql: `create index concurrently if not exists idx_users_school_id on public.users (school_id);`


