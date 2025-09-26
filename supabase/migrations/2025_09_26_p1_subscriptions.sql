-- P1: Subscriptions schema + RLS + usage counters
DO $$ BEGIN
  CREATE TYPE public.subscription_plan AS ENUM ('free', 'teacher_bas', 'teacher_pro', 'school');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.subscriptions (
  id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  org_id uuid REFERENCES public.organisations(id) ON DELETE CASCADE,
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  plan public.subscription_plan NOT NULL,
  max_quizzes integer,
  ai_quota_4o integer,
  ai_quota_3_5 integer,
  stripe_customer_id text,
  stripe_subscription_id text,
  current_period_end timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT subscriptions_one_owner_chk CHECK ((num_nonnulls(org_id, user_id) = 1))
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_subscriptions_org ON public.subscriptions (org_id) WHERE org_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS uq_subscriptions_user ON public.subscriptions (user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_subscriptions_org ON public.subscriptions (org_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON public.subscriptions (user_id);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS subscriptions_select_user ON public.subscriptions;
CREATE POLICY subscriptions_select_user ON public.subscriptions
  FOR SELECT USING (
    user_id = auth.uid()
    OR (
      org_id IS NOT NULL AND EXISTS (
        SELECT 1 FROM public.organisation_members m
        WHERE m.org_id = subscriptions.org_id
          AND m.user_id = auth.uid()
          AND m.role = 'admin'
      )
    )
  );

DROP POLICY IF EXISTS subscriptions_iud_service ON public.subscriptions;
CREATE POLICY subscriptions_iud_service ON public.subscriptions
  FOR ALL TO authenticated
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

DROP POLICY IF EXISTS subscriptions_update_org_admin ON public.subscriptions;
CREATE POLICY subscriptions_update_org_admin ON public.subscriptions
  FOR UPDATE USING (
    org_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.organisation_members m
      WHERE m.org_id = subscriptions.org_id
        AND m.user_id = auth.uid()
        AND m.role = 'admin'
    )
  );

CREATE TABLE IF NOT EXISTS public.subscription_usage (
  id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  subscription_id uuid NOT NULL REFERENCES public.subscriptions(id) ON DELETE CASCADE,
  period_start date NOT NULL,
  quizzes_created integer NOT NULL DEFAULT 0,
  ai_4o_used integer NOT NULL DEFAULT 0,
  ai_3_5_used integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (subscription_id, period_start)
);

CREATE INDEX IF NOT EXISTS idx_subscription_usage_sub ON public.subscription_usage (subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscription_usage_period ON public.subscription_usage (period_start);

ALTER TABLE public.subscription_usage ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS subscription_usage_select ON public.subscription_usage;
CREATE POLICY subscription_usage_select ON public.subscription_usage
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.subscriptions s
      WHERE s.id = subscription_usage.subscription_id AND (
        s.user_id = auth.uid() OR (
          s.org_id IS NOT NULL AND EXISTS (
            SELECT 1 FROM public.organisation_members m
            WHERE m.org_id = s.org_id AND m.user_id = auth.uid() AND m.role = 'admin'
          )
        )
      )
    )
  );

DROP POLICY IF EXISTS subscription_usage_iud_service ON public.subscription_usage;
CREATE POLICY subscription_usage_iud_service ON public.subscription_usage
  FOR ALL TO authenticated
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');
