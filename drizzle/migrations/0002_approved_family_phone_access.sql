CREATE TABLE public.calendar_phone_members (
 phone text PRIMARY KEY CHECK (phone ~ '^\+[1-9][0-9]{7,14}$'),
 created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, DELETE ON public.calendar_phone_members TO authenticated;
GRANT ALL ON public.calendar_phone_members TO service_role;
ALTER TABLE public.calendar_phone_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owner manages approved family phones" ON public.calendar_phone_members FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE OR REPLACE FUNCTION public.has_calendar_access() RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
 SELECT auth.uid() IS NOT NULL AND (public.has_role(auth.uid(), 'admin') OR EXISTS (
  SELECT 1 FROM public.calendar_phone_members m JOIN auth.users u ON u.id = auth.uid()
  WHERE u.phone_confirmed_at IS NOT NULL AND m.phone = '+' || ltrim(u.phone, '+')
 ));
$$;
REVOKE ALL ON FUNCTION public.has_calendar_access() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_calendar_access() TO authenticated;
COMMENT ON TABLE public.calendar_members IS 'DEPRECATED: replaced by calendar_phone_members; email approvals no longer grant calendar access';