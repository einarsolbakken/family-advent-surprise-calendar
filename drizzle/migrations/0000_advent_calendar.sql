CREATE TYPE public.app_role AS ENUM ('admin');
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own roles" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.claim_admin()
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF auth.uid() IS NULL THEN RETURN false; END IF;
  IF EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') THEN
    RETURN public.has_role(auth.uid(), 'admin');
  END IF;
  INSERT INTO public.user_roles (user_id, role) VALUES (auth.uid(), 'admin');
  RETURN true;
END $$;
REVOKE EXECUTE ON FUNCTION public.claim_admin() FROM anon, public;
GRANT EXECUTE ON FUNCTION public.claim_admin() TO authenticated;

CREATE TABLE public.doors (
  day int PRIMARY KEY CHECK (day BETWEEN 1 AND 24),
  image_path text NOT NULL,
  caption text,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.doors TO authenticated;
GRANT ALL ON public.doors TO service_role;
ALTER TABLE public.doors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin all doors" ON public.doors FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "admin manage advent files" ON storage.objects FOR ALL TO authenticated
  USING (bucket_id = 'advent' AND public.has_role(auth.uid(), 'admin'))
  WITH CHECK (bucket_id = 'advent' AND public.has_role(auth.uid(), 'admin'));