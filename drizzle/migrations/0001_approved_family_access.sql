CREATE TABLE public.calendar_members (
 email text PRIMARY KEY CHECK (email = lower(trim(email)) AND length(email) <= 254 AND email LIKE '%@%'),
 created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, DELETE ON public.calendar_members TO authenticated;
GRANT ALL ON public.calendar_members TO service_role;
ALTER TABLE public.calendar_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owner manages approved family" ON public.calendar_members FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE OR REPLACE FUNCTION public.has_calendar_access() RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
 SELECT auth.uid() IS NOT NULL AND (public.has_role(auth.uid(), 'admin') OR EXISTS (SELECT 1 FROM public.calendar_members WHERE email = lower(auth.jwt()->>'email')));
$$;
REVOKE ALL ON FUNCTION public.has_calendar_access() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_calendar_access() TO authenticated;
CREATE OR REPLACE FUNCTION public.claim_admin() RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
 SELECT auth.uid() IS NOT NULL AND public.has_role(auth.uid(), 'admin');
$$;
REVOKE ALL ON FUNCTION public.claim_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.claim_admin() TO authenticated;