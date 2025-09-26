-- P1: RPC for incrementing subscription usage
CREATE OR REPLACE FUNCTION public.increment_subscription_usage(
  p_subscription_id uuid,
  p_period_start date,
  p_column text,
  p_amount integer DEFAULT 1
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_column = 'quizzes_created' THEN
    UPDATE public.subscription_usage
      SET quizzes_created = quizzes_created + p_amount,
          updated_at = now()
      WHERE subscription_id = p_subscription_id AND period_start = p_period_start;
  ELSIF p_column = 'ai_4o_used' THEN
    UPDATE public.subscription_usage
      SET ai_4o_used = ai_4o_used + p_amount,
          updated_at = now()
      WHERE subscription_id = p_subscription_id AND period_start = p_period_start;
  ELSE
    UPDATE public.subscription_usage
      SET ai_3_5_used = ai_3_5_used + p_amount,
          updated_at = now()
      WHERE subscription_id = p_subscription_id AND period_start = p_period_start;
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.increment_subscription_usage(uuid, date, text, integer) FROM public;
GRANT EXECUTE ON FUNCTION public.increment_subscription_usage(uuid, date, text, integer) TO service_role;
