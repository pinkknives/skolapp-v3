### Organisations (I1)

- organisations(id, name, slug, created_at)
- organisation_members(id, org_id → organisations.id, user_id → users.id, role enum: admin/teacher, created_at, UNIQUE(org_id,user_id))
- schools(id, org_id → organisations.id, name, created_at)
- classes(id, org_id → organisations.id, school_id → schools.id, teacher_id → users.id, name, created_at)
 - organisation_invites(id, org_id → organisations.id, email, role, token UNIQUE, status, expires_at, created_by → users.id, accepted_by → users.id, created_at, accepted_at)
 - org_domains(domain PK, org_id → organisations.id, created_at)
 - audit_logs(id, org_id → organisations.id, actor_id → users.id, action, resource_type, resource_id, metadata, created_at)

RLS (översikt):
- Medlemmar kan SELECT på sin orgs rader; admin krävs för ändringar av org/medlemmar
- schools/classes scoper SELECT/ALL till medlemmar i samma org via org_id

## ERD – public schema

### Tables

- users
  - id (uuid, PK)
  - name (varchar, null)
  - email (varchar, unique)
  - email_verified (timestamptz, null)
  - image (text, null)
  - role (varchar, default 'student')
  - school_id (uuid, null)
  - created_at (timestamptz)
  - updated_at (timestamptz)
  - Indexes:
    - users_pkey (id)
    - users_email_key (unique on email)
    - idx_users_email (email)

- accounts
  - id (uuid, PK)
  - user_id (uuid, FK → users.id)
  - type (varchar)
  - provider (varchar)
  - provider_account_id (varchar)
  - refresh_token (text, null)
  - access_token (text, null)
  - expires_at (bigint, null)
  - token_type (varchar, null)
  - scope (varchar, null)
  - id_token (text, null)
  - session_state (varchar, null)
  - created_at (timestamptz)
  - updated_at (timestamptz)
  - Indexes:
    - accounts_pkey (id)
    - accounts_provider_provider_account_id_key (unique on provider, provider_account_id)
    - idx_accounts_user_id (user_id)

- sessions
  - id (uuid, PK)
  - session_token (varchar, unique)
  - user_id (uuid, FK → users.id)
  - expires (timestamptz)
  - created_at (timestamptz)
  - updated_at (timestamptz)
  - Indexes:
    - sessions_pkey (id)
    - sessions_session_token_key (unique on session_token)
    - idx_sessions_token (session_token)
    - idx_sessions_user_id (user_id)

- verification_tokens
  - identifier (varchar)
  - token (varchar)
  - expires (timestamptz)
  - PK: (identifier, token)
  - Indexes:
    - verification_tokens_pkey (identifier, token)
    - verification_tokens_token_key (unique on token)

### Relations

- accounts.user_id → users.id (FK)
- sessions.user_id → users.id (FK)

### Notes

- users.school_id saknar FK – avsiktligt om extern referens; annars överväg FK och index.
- verification_tokens har RLS avstängt (OK för verifieringsflöden).


