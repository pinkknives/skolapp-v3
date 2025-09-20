-- User-based billing system migration
-- Replaces organization-based billing with individual user billing and entitlements

-- Add billing columns to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS stripe_customer_id text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS subscription_status text 
  CHECK (subscription_status IN ('active', 'trialing', 'past_due', 'canceled', null)) 
  default null;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS plan text 
  CHECK (plan IN ('free', 'pro', null)) 
  DEFAULT 'free';

-- Create entitlements table for individual users
CREATE TABLE IF NOT EXISTS public.entitlements (
  uid uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  ai_unlimited boolean NOT NULL DEFAULT false,
  export_csv boolean NOT NULL DEFAULT false,
  advanced_analytics boolean NOT NULL DEFAULT false,
  seats integer NOT NULL DEFAULT 1,
  ai_monthly_quota integer NOT NULL DEFAULT 20,
  ai_monthly_used integer NOT NULL DEFAULT 0,
  period_start date NOT NULL DEFAULT CURRENT_DATE,
  period_end date NOT NULL DEFAULT (CURRENT_DATE + INTERVAL '1 month'),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create billing events audit table
CREATE TABLE IF NOT EXISTS public.billing_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  uid uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL,
  raw jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer ON public.profiles(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_status ON public.profiles(subscription_status);
CREATE INDEX IF NOT EXISTS idx_entitlements_uid ON public.entitlements(uid);
CREATE INDEX IF NOT EXISTS idx_entitlements_period ON public.entitlements(period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_billing_events_uid ON public.billing_events(uid);
CREATE INDEX IF NOT EXISTS idx_billing_events_type ON public.billing_events(type);
CREATE INDEX IF NOT EXISTS idx_billing_events_created_at ON public.billing_events(created_at);

-- Enable RLS on new tables
ALTER TABLE public.entitlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing_events ENABLE ROW LEVEL SECURITY;

-- RLS policies for entitlements
CREATE POLICY "user reads own entitlements"
ON public.entitlements FOR SELECT
USING (auth.uid() = uid);

CREATE POLICY "user updates own entitlements"
ON public.entitlements FOR UPDATE
USING (auth.uid() = uid);

-- RLS policies for billing events (read-only for users)
CREATE POLICY "user reads own billing events"
ON public.billing_events FOR SELECT
USING (auth.uid() = uid);

-- Function to check if user has specific entitlement
CREATE OR REPLACE FUNCTION has_user_entitlement(user_id uuid, entitlement_key text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  entitlement_value boolean;
BEGIN
  -- Get user entitlement value
  EXECUTE format('SELECT %I FROM public.entitlements WHERE uid = $1', entitlement_key)
  INTO entitlement_value
  USING user_id;
  
  -- Return false if user not found or entitlement is false/null
  RETURN COALESCE(entitlement_value, false);
END;
$$;

-- Function to update user entitlements based on subscription status
CREATE OR REPLACE FUNCTION update_user_entitlements(
  user_id uuid,
  subscription_status text,
  plan_type text DEFAULT 'free'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_ai_unlimited boolean;
  new_export_csv boolean;
  new_advanced_analytics boolean;
  new_quota integer;
BEGIN
  -- Determine entitlements based on plan
  CASE plan_type
    WHEN 'pro' THEN
      new_ai_unlimited := true;
      new_export_csv := true;
      new_advanced_analytics := true;
      new_quota := 999999; -- Effectively unlimited
    ELSE -- 'free' plan
      new_ai_unlimited := false;
      new_export_csv := false;
      new_advanced_analytics := false;
      new_quota := 20;
  END CASE;
  
  -- Insert or update entitlements
  INSERT INTO public.entitlements (
    uid, ai_unlimited, export_csv, advanced_analytics, ai_monthly_quota, updated_at
  )
  VALUES (
    user_id, new_ai_unlimited, new_export_csv, new_advanced_analytics, new_quota, now()
  )
  ON CONFLICT (uid) DO UPDATE SET
    ai_unlimited = EXCLUDED.ai_unlimited,
    export_csv = EXCLUDED.export_csv,
    advanced_analytics = EXCLUDED.advanced_analytics,
    ai_monthly_quota = EXCLUDED.ai_monthly_quota,
    updated_at = now();
    
  -- Update user profile
  UPDATE public.profiles
  SET 
    subscription_status = update_user_entitlements.subscription_status,
    plan = plan_type
  WHERE user_id = update_user_entitlements.user_id;
END;
$$;

-- Function to increment AI usage
CREATE OR REPLACE FUNCTION increment_ai_usage(user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_used integer;
  monthly_quota integer;
  has_unlimited boolean;
BEGIN
  -- Get current usage and quota
  SELECT ai_monthly_used, ai_monthly_quota, ai_unlimited
  INTO current_used, monthly_quota, has_unlimited
  FROM public.entitlements
  WHERE uid = user_id;
  
  -- If user not found, return false
  IF NOT FOUND THEN
    RETURN false;
  END IF;
  
  -- If unlimited plan, just increment counter (no limit check)
  IF has_unlimited THEN
    UPDATE public.entitlements
    SET ai_monthly_used = ai_monthly_used + 1,
        updated_at = now()
    WHERE uid = user_id;
    RETURN true;
  END IF;
  
  -- Check if user is within quota
  IF current_used >= monthly_quota THEN
    RETURN false; -- Over quota
  END IF;
  
  -- Increment usage
  UPDATE public.entitlements
  SET ai_monthly_used = ai_monthly_used + 1,
      updated_at = now()
  WHERE uid = user_id;
  
  RETURN true;
END;
$$;

-- Function to reset monthly usage (to be called by cron job)
CREATE OR REPLACE FUNCTION reset_monthly_ai_usage()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Reset usage for users whose period has ended
  UPDATE public.entitlements
  SET 
    ai_monthly_used = 0,
    period_start = CURRENT_DATE,
    period_end = CURRENT_DATE + INTERVAL '1 month',
    updated_at = now()
  WHERE period_end <= CURRENT_DATE;
END;
$$;

-- Function to update billing status from webhook
CREATE OR REPLACE FUNCTION update_user_billing_status(
  customer_id text,
  new_status text,
  subscription_id text DEFAULT null
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  target_user_id uuid;
  plan_type text;
BEGIN
  -- Find user by stripe customer ID
  SELECT user_id INTO target_user_id
  FROM public.profiles
  WHERE stripe_customer_id = customer_id;
  
  -- Return if user not found
  IF target_user_id IS NULL THEN
    RETURN;
  END IF;
  
  -- Determine plan based on status
  plan_type := CASE 
    WHEN new_status IN ('active', 'trialing') THEN 'pro'
    ELSE 'free'
  END;
  
  -- Update entitlements
  PERFORM update_user_entitlements(target_user_id, new_status, plan_type);
  
  -- Log billing event
  INSERT INTO public.billing_events (uid, type, raw)
  VALUES (
    target_user_id,
    'subscription_status_updated',
    jsonb_build_object(
      'customer_id', customer_id,
      'status', new_status,
      'subscription_id', subscription_id,
      'timestamp', now()
    )
  );
END;
$$;

-- Function to create default entitlements for new users
CREATE OR REPLACE FUNCTION create_default_entitlements()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- Create default entitlements for new user
  INSERT INTO public.entitlements (uid)
  VALUES (NEW.user_id)
  ON CONFLICT (uid) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Trigger to auto-create entitlements for new profiles
CREATE TRIGGER trigger_create_default_entitlements
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION create_default_entitlements();

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION has_user_entitlement(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_ai_usage(uuid) TO authenticated;

-- Note: Other functions are security definer and will be called from API routes with service role