-- Billing and subscription system for organizations
-- Adds Stripe integration with GDPR-compliant data handling

-- Add billing columns to orgs table
alter table public.orgs add column if not exists billing_status text 
  check (billing_status in ('inactive', 'trialing', 'active', 'past_due', 'canceled')) 
  not null default 'inactive';

alter table public.orgs add column if not exists entitlements jsonb not null default '{"ai": false, "seats": 10}';

alter table public.orgs add column if not exists stripe_customer_id text;

alter table public.orgs add column if not exists stripe_sub_id text;

-- Create index for billing queries
create index if not exists idx_orgs_billing_status on public.orgs(billing_status);
create index if not exists idx_orgs_stripe_customer on public.orgs(stripe_customer_id);
create index if not exists idx_orgs_stripe_sub on public.orgs(stripe_sub_id);

-- Function to check if organization has specific entitlement
create or replace function has_entitlement(org_uuid uuid, entitlement_key text)
returns boolean
language plpgsql
security definer
as $$
declare
  org_entitlements jsonb;
begin
  -- Get organization entitlements
  select entitlements into org_entitlements
  from public.orgs
  where id = org_uuid;
  
  -- Return false if org not found
  if org_entitlements is null then
    return false;
  end if;
  
  -- Check if entitlement exists and is true
  return coalesce((org_entitlements->entitlement_key)::boolean, false);
end;
$$;

-- Function to update organization entitlements
create or replace function update_org_entitlements(
  org_uuid uuid,
  new_entitlements jsonb
)
returns void
language plpgsql
security definer
as $$
begin
  update public.orgs
  set 
    entitlements = new_entitlements,
    updated_at = now()
  where id = org_uuid;
end;
$$;

-- Function to update billing status from webhook
create or replace function update_billing_status(
  customer_id text,
  new_status text,
  subscription_id text default null
)
returns void
language plpgsql
security definer
as $$
declare
  new_entitlements jsonb;
begin
  -- Determine entitlements based on billing status
  case new_status
    when 'active' then
      new_entitlements = '{"ai": true, "seats": 100}';
    when 'trialing' then
      new_entitlements = '{"ai": true, "seats": 100}';
    else
      new_entitlements = '{"ai": false, "seats": 10}';
  end case;
  
  -- Update organization
  update public.orgs
  set 
    billing_status = new_status,
    entitlements = new_entitlements,
    stripe_sub_id = coalesce(subscription_id, stripe_sub_id),
    updated_at = now()
  where stripe_customer_id = customer_id;
end;
$$;

-- Grant execute permissions to authenticated users for the entitlement check function
grant execute on function has_entitlement(uuid, text) to authenticated;

-- Note: The other functions are security definer and will be called from API routes with service role