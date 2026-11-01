-- =============================================================================
-- ALABASTRO ALTA PERFUMERÍA — ESQUEMA POSTGRESQL ESTANDARIZADO PARA SUPABASE
-- Compatible 100% con:
--   1. Supabase Cloud (SQL Editor / Supabase CLI Migrations)
--   2. Contenedor PostgreSQL 16 Dockerizado Local
-- Incluye: Extensiones, Esquema auth, Roles (anon, authenticated, service_role),
-- Tablas public.*, Triggers updated_at, Sincronización auth.users -> public.users,
-- Índices B-Tree & GIN (JSONB), Row Level Security (RLS) y Publicación Realtime.
-- =============================================================================

BEGIN;

-- -----------------------------------------------------------------------------
-- 1. EXTENSIONES ESTÁNDAR DE SUPABASE
-- -----------------------------------------------------------------------------
DO $$
BEGIN
  CREATE EXTENSION IF NOT EXISTS "pgcrypto";
  CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
EXCEPTION
  WHEN insufficient_privilege OR others THEN
    NULL;
END
$$;

-- -----------------------------------------------------------------------------
-- 2. ROLES Y ESQUEMA `auth` (Paridad en Docker Local con Supabase GoTrue/PostgREST)
-- -----------------------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
    CREATE ROLE anon NOLOGIN NOINHERIT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
    CREATE ROLE authenticated NOLOGIN NOINHERIT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'service_role') THEN
    CREATE ROLE service_role NOLOGIN NOINHERIT BYPASSRLS;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticator') THEN
    CREATE ROLE authenticator NOINHERIT;
    GRANT anon, authenticated, service_role TO authenticator;
  END IF;
EXCEPTION
  WHEN insufficient_privilege OR others THEN
    -- En Supabase Cloud estos roles ya existen y son administrados por la plataforma
    NULL;
END
$$;

-- Garantizar que el usuario administrativo del contenedor tenga BYPASSRLS igual que postgres/service_role
DO $$
BEGIN
  EXECUTE format('ALTER ROLE %I BYPASSRLS', current_user);
EXCEPTION
  WHEN insufficient_privilege OR others THEN
    NULL;
END
$$;

DO $$
BEGIN
  CREATE SCHEMA IF NOT EXISTS auth;
  CREATE SCHEMA IF NOT EXISTS storage;

  -- Tabla `auth.users` (solo se crea si no existe, p. ej. en PostgreSQL Dockerizado local)
  CREATE TABLE IF NOT EXISTS auth.users (
    instance_id uuid,
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    aud varchar(255) DEFAULT 'authenticated',
    role varchar(255) DEFAULT 'authenticated',
    email varchar(255) UNIQUE,
    encrypted_password varchar(255),
    email_confirmed_at timestamptz DEFAULT timezone('utc'::text, now()),
    invited_at timestamptz,
    confirmation_token varchar(255),
    confirmation_sent_at timestamptz,
    recovery_token varchar(255),
    recovery_sent_at timestamptz,
    email_change_token_new varchar(255),
    email_change varchar(255),
    email_change_sent_at timestamptz,
    last_sign_in_at timestamptz,
    raw_app_meta_data jsonb DEFAULT '{"provider": "email", "providers": ["email"]}'::jsonb,
    raw_user_meta_data jsonb DEFAULT '{}'::jsonb,
    is_super_admin boolean DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
    phone text UNIQUE DEFAULT NULL,
    phone_confirmed_at timestamptz,
    is_sso_user boolean NOT NULL DEFAULT false,
    deleted_at timestamptz
  );
EXCEPTION
  WHEN insufficient_privilege OR others THEN
    -- En Supabase Cloud el esquema auth es administrado por supabase_admin
    NULL;
END
$$;

-- Funciones de contexto JWT de Supabase (`auth.jwt()`, `auth.uid()`, `auth.role()`, `auth.email()`)
-- Se crean únicamente si no existen (en Supabase Cloud ya están preinstaladas).
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'auth' AND p.proname = 'jwt'
  ) THEN
    EXECUTE $func$
      CREATE FUNCTION auth.jwt() RETURNS jsonb
      LANGUAGE sql STABLE
      AS $body$
        SELECT COALESCE(
          NULLIF(current_setting('request.jwt.claim', true), ''),
          NULLIF(current_setting('request.jwt.claims', true), ''),
          '{}'
        )::jsonb;
      $body$;
    $func$;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'auth' AND p.proname = 'uid'
  ) THEN
    EXECUTE $func$
      CREATE FUNCTION auth.uid() RETURNS uuid
      LANGUAGE sql STABLE
      AS $body$
        SELECT NULLIF(
          COALESCE(
            NULLIF(current_setting('request.jwt.claim.sub', true), ''),
            (NULLIF(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')
          ),
          ''
        )::uuid;
      $body$;
    $func$;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'auth' AND p.proname = 'role'
  ) THEN
    EXECUTE $func$
      CREATE FUNCTION auth.role() RETURNS text
      LANGUAGE sql STABLE
      AS $body$
        SELECT COALESCE(
          NULLIF(current_setting('request.jwt.claim.role', true), ''),
          (NULLIF(current_setting('request.jwt.claims', true), '')::jsonb ->> 'role'),
          current_user
        )::text;
      $body$;
    $func$;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'auth' AND p.proname = 'email'
  ) THEN
    EXECUTE $func$
      CREATE FUNCTION auth.email() RETURNS text
      LANGUAGE sql STABLE
      AS $body$
        SELECT COALESCE(
          NULLIF(current_setting('request.jwt.claim.email', true), ''),
          (NULLIF(current_setting('request.jwt.claims', true), '')::jsonb ->> 'email')
        )::text;
      $body$;
    $func$;
  END IF;
EXCEPTION
  WHEN insufficient_privilege OR others THEN
    NULL;
END
$$;

-- -----------------------------------------------------------------------------
-- 3. FUNCIÓN TRIGGER ESTÁNDAR DE SUPABASE PARA `updated_at`
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$;

-- -----------------------------------------------------------------------------
-- 4. TABLAS PRINCIPALES DEL ESQUEMA `public` (Estándar Supabase)
-- -----------------------------------------------------------------------------

-- 4.1 Tabla de Usuarios y Perfiles (`public.users`)
CREATE TABLE IF NOT EXISTS public.users (
  id text PRIMARY KEY DEFAULT (gen_random_uuid())::text,
  auth_user_id uuid UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL,
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  phone text,
  password_hash text NOT NULL DEFAULT '',
  role text NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin', 'service_role')),
  avatar_url text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now())
);

COMMENT ON TABLE public.users IS 'Perfiles de clientes y administradores de ALABASTRO vinculados con Supabase Auth (auth.users).';

-- 4.2 Tabla de Catálogo de Perfumes (`public.products`)
CREATE TABLE IF NOT EXISTS public.products (
  id text PRIMARY KEY,
  uuid uuid UNIQUE NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  full_name text,
  brand text NOT NULL DEFAULT 'Lattafa',
  gender text NOT NULL DEFAULT 'unisex',
  gender_display text,
  origin text DEFAULT 'Dubái, Emiratos Árabes Unidos',
  image text,
  subtitle text,
  family text NOT NULL,
  family_display text,
  price numeric(12, 2) NOT NULL CHECK (price >= 0),
  stock integer NOT NULL DEFAULT 20 CHECK (stock >= 0),
  size text DEFAULT '100 ml / 3.4 FL. OZ.',
  concentration text,
  description text,
  top_notes jsonb NOT NULL DEFAULT '[]'::jsonb,
  heart_notes jsonb NOT NULL DEFAULT '[]'::jsonb,
  base_notes jsonb NOT NULL DEFAULT '[]'::jsonb,
  longevity text,
  sillage text,
  best_for text,
  gradient jsonb NOT NULL DEFAULT '{}'::jsonb,
  quiz_tags jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now())
);

COMMENT ON TABLE public.products IS 'Catálogo oficial de fragancias árabes originales de ALABASTRO Alta Perfumería.';

-- 4.3 Tabla de Pedidos / Órdenes (`public.orders`)
CREATE TABLE IF NOT EXISTS public.orders (
  id text PRIMARY KEY,
  uuid uuid UNIQUE NOT NULL DEFAULT gen_random_uuid(),
  user_id text REFERENCES public.users(id) ON DELETE SET NULL,
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  customer_phone text,
  shipping_address text NOT NULL,
  city text NOT NULL,
  payment_method text NOT NULL DEFAULT 'transferencia',
  status text NOT NULL DEFAULT 'pendiente' CHECK (status IN ('pendiente', 'confirmado', 'en_preparacion', 'enviado', 'entregado', 'cancelado')),
  subtotal numeric(12, 2) NOT NULL CHECK (subtotal >= 0),
  shipping_cost numeric(12, 2) NOT NULL DEFAULT 0 CHECK (shipping_cost >= 0),
  total numeric(12, 2) NOT NULL CHECK (total >= 0),
  gift_packaging boolean NOT NULL DEFAULT false,
  notes text,
  items jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now())
);

COMMENT ON TABLE public.orders IS 'Órdenes de compra y despachos nacionales registrados en ALABASTRO.';

-- 4.4 Tabla de Suscriptores del Círculo Privado (`public.subscribers`)
CREATE TABLE IF NOT EXISTS public.subscribers (
  id bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  uuid uuid UNIQUE NOT NULL DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now())
);

COMMENT ON TABLE public.subscribers IS 'Suscriptores del boletín VIP de ALABASTRO.';

-- 4.5 Tabla de Reseñas y Testimonios (`public.reviews`)
CREATE TABLE IF NOT EXISTS public.reviews (
  id bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  uuid uuid UNIQUE NOT NULL DEFAULT gen_random_uuid(),
  product_id text REFERENCES public.products(id) ON DELETE CASCADE,
  author_name text NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text NOT NULL,
  verified_purchase boolean NOT NULL DEFAULT true,
  status text NOT NULL DEFAULT 'aprobada' CHECK (status IN ('aprobada', 'pendiente', 'rechazada')),
  created_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now())
);

COMMENT ON TABLE public.reviews IS 'Reseñas verificadas y calificaciones de fragancias.';

-- 4.6 Tabla de Configuración Global de Tienda (`public.settings`)
CREATE TABLE IF NOT EXISTS public.settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL DEFAULT '{}'::jsonb,
  description text,
  updated_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now())
);

COMMENT ON TABLE public.settings IS 'Parámetros comerciales y reglas de negocio de la tienda.';

-- 4.7 Tabla de Registro de Auditoría (`public.activity_logs`)
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id bigint GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  uuid uuid UNIQUE NOT NULL DEFAULT gen_random_uuid(),
  user_id text,
  user_name text,
  action text NOT NULL,
  details text,
  created_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now())
);

COMMENT ON TABLE public.activity_logs IS 'Historial inmutable de auditoría de la Consola de Administración.';

-- -----------------------------------------------------------------------------
-- 5. MIGRACIÓN NO DESTRUCTIVA DE COLUMNAS SUPABASE (Para bases existentes)
-- -----------------------------------------------------------------------------
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS auth_user_id uuid UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS avatar_url text;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS metadata jsonb NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now());

ALTER TABLE public.products ADD COLUMN IF NOT EXISTS uuid uuid UNIQUE NOT NULL DEFAULT gen_random_uuid();
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS brand text DEFAULT 'Lattafa';
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS gender text DEFAULT 'unisex';
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS gender_display text;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS origin text DEFAULT 'Dubái, Emiratos Árabes Unidos';
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS image text;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS full_name text;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now());

ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS uuid uuid UNIQUE NOT NULL DEFAULT gen_random_uuid();
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now());

ALTER TABLE public.subscribers ADD COLUMN IF NOT EXISTS uuid uuid UNIQUE NOT NULL DEFAULT gen_random_uuid();

ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS uuid uuid UNIQUE NOT NULL DEFAULT gen_random_uuid();
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now());

ALTER TABLE public.activity_logs ADD COLUMN IF NOT EXISTS uuid uuid UNIQUE NOT NULL DEFAULT gen_random_uuid();

-- -----------------------------------------------------------------------------
-- 6. TRIGGERS DE `updated_at` Y SINCRONIZACIÓN `auth.users` -> `public.users`
-- -----------------------------------------------------------------------------
DROP TRIGGER IF EXISTS set_users_updated_at ON public.users;
CREATE TRIGGER set_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_products_updated_at ON public.products;
CREATE TRIGGER set_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_orders_updated_at ON public.orders;
CREATE TRIGGER set_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_reviews_updated_at ON public.reviews;
CREATE TRIGGER set_reviews_updated_at
  BEFORE UPDATE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_settings_updated_at ON public.settings;
CREATE TRIGGER set_settings_updated_at
  BEFORE UPDATE ON public.settings
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Trigger oficial de Supabase para sincronizar registros desde `auth.users` hacia `public.users`
-- SEGURIDAD SUPABASE: Nunca se lee `raw_user_meta_data->>'role'` para evitar auto-asignación de privilegios en signUp()
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, auth_user_id, name, email, phone, password_hash, role, metadata)
  VALUES (
    COALESCE(NEW.raw_user_meta_data->>'legacy_id', NEW.id::text),
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    LOWER(NEW.email),
    COALESCE(NEW.phone, NEW.raw_user_meta_data->>'phone', ''),
    COALESCE(NEW.encrypted_password, ''),
    CASE
      WHEN (NEW.raw_app_meta_data->>'role') = 'admin' THEN 'admin'
      ELSE 'customer'
    END,
    COALESCE(NEW.raw_user_meta_data, '{}'::jsonb)
  )
  ON CONFLICT (email) DO UPDATE SET
    auth_user_id = EXCLUDED.auth_user_id,
    updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.handle_new_auth_user() FROM PUBLIC;

DO $$
BEGIN
  DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
  CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();
EXCEPTION
  WHEN insufficient_privilege OR others THEN
    NULL;
END
$$;

-- -----------------------------------------------------------------------------
-- 7. ÍNDICES DE RENDIMIENTO (B-TREE & GIN JSONB)
-- -----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users (LOWER(email));
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users (role);
CREATE INDEX IF NOT EXISTS idx_users_auth_user_id ON public.users (auth_user_id);

CREATE INDEX IF NOT EXISTS idx_products_family ON public.products (family);
CREATE INDEX IF NOT EXISTS idx_products_brand ON public.products (brand);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON public.products (is_active);
CREATE INDEX IF NOT EXISTS idx_products_stock ON public.products (stock);
CREATE INDEX IF NOT EXISTS idx_products_quiz_tags_gin ON public.products USING GIN (quiz_tags);

CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders (status);
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON public.orders (LOWER(customer_email));
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders (user_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_items_gin ON public.orders USING GIN (items);

CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON public.reviews (product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_status ON public.reviews (status);

CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON public.activity_logs (created_at DESC);

-- -----------------------------------------------------------------------------
-- 8. FUNCIÓN AUXILIAR DE AUTORIZACIÓN PARA POLÍTICAS RLS (`public.is_admin()`)
-- Optimizada con InitPlan `(select auth.jwt())` y `(select auth.uid())` y sin `user_metadata`
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    current_user IN ('postgres', 'service_role', 'alabastro_user')
    OR ((select auth.jwt()) ->> 'role') IN ('admin', 'service_role')
    OR ((select auth.jwt()) -> 'app_metadata' ->> 'role') = 'admin'
    OR EXISTS (
      SELECT 1 FROM public.users u
      WHERE (
        u.id = ((select auth.jwt()) ->> 'id')
        OR u.id = ((select auth.jwt()) ->> 'sub')
        OR ((select auth.uid()) IS NOT NULL AND u.auth_user_id = (select auth.uid()))
        OR ((select auth.email()) IS NOT NULL AND LOWER(u.email) = LOWER((select auth.email())))
      )
      AND u.role = 'admin'
    );
$$;

REVOKE EXECUTE ON FUNCTION public.is_admin() FROM PUBLIC;
DO $$
BEGIN
  GRANT EXECUTE ON FUNCTION public.is_admin() TO anon, authenticated, service_role;
EXCEPTION
  WHEN insufficient_privilege OR others THEN
    NULL;
END
$$;

-- -----------------------------------------------------------------------------
-- 9. ROW LEVEL SECURITY (RLS) Y POLÍTICAS ESTÁNDAR DE SUPABASE
-- -----------------------------------------------------------------------------
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- 9.1 Políticas para `public.products`
DROP POLICY IF EXISTS "products_select_public" ON public.products;
CREATE POLICY "products_select_public"
  ON public.products FOR SELECT
  TO anon, authenticated
  USING (is_active = true OR (select public.is_admin()));

DROP POLICY IF EXISTS "products_admin_all" ON public.products;
CREATE POLICY "products_admin_all"
  ON public.products FOR ALL
  TO authenticated, service_role
  USING ((select public.is_admin()))
  WITH CHECK ((select public.is_admin()));

-- 9.2 Políticas para `public.orders`
DROP POLICY IF EXISTS "orders_insert_public" ON public.orders;
CREATE POLICY "orders_insert_public"
  ON public.orders FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "orders_select_own_or_admin" ON public.orders;
CREATE POLICY "orders_select_own_or_admin"
  ON public.orders FOR SELECT
  TO authenticated
  USING (
    (select public.is_admin())
    OR user_id = ((select auth.jwt()) ->> 'id')
    OR user_id = ((select auth.jwt()) ->> 'sub')
    OR LOWER(customer_email) = LOWER(COALESCE((select auth.email()), ''))
  );

DROP POLICY IF EXISTS "orders_admin_modify" ON public.orders;
CREATE POLICY "orders_admin_modify"
  ON public.orders FOR UPDATE
  TO authenticated, service_role
  USING ((select public.is_admin()))
  WITH CHECK ((select public.is_admin()));

DROP POLICY IF EXISTS "orders_admin_delete" ON public.orders;
CREATE POLICY "orders_admin_delete"
  ON public.orders FOR DELETE
  TO authenticated, service_role
  USING ((select public.is_admin()));

-- 9.3 Políticas para `public.users`
DROP POLICY IF EXISTS "users_select_own_or_admin" ON public.users;
CREATE POLICY "users_select_own_or_admin"
  ON public.users FOR SELECT
  TO authenticated
  USING (
    (select public.is_admin())
    OR id = ((select auth.jwt()) ->> 'id')
    OR id = ((select auth.jwt()) ->> 'sub')
    OR ((select auth.uid()) IS NOT NULL AND auth_user_id = (select auth.uid()))
    OR LOWER(email) = LOWER(COALESCE((select auth.email()), ''))
  );

DROP POLICY IF EXISTS "users_insert_registration" ON public.users;
CREATE POLICY "users_insert_registration"
  ON public.users FOR INSERT
  TO anon, authenticated
  WITH CHECK (role = 'customer' OR (select public.is_admin()));

DROP POLICY IF EXISTS "users_update_own_or_admin" ON public.users;
CREATE POLICY "users_update_own_or_admin"
  ON public.users FOR UPDATE
  TO authenticated
  USING (
    (select public.is_admin())
    OR id = ((select auth.jwt()) ->> 'id')
    OR ((select auth.uid()) IS NOT NULL AND auth_user_id = (select auth.uid()))
  )
  WITH CHECK (
    (select public.is_admin())
    OR (role = 'customer' AND (id = ((select auth.jwt()) ->> 'id') OR ((select auth.uid()) IS NOT NULL AND auth_user_id = (select auth.uid()))))
  );

-- 9.4 Políticas para `public.subscribers`
DROP POLICY IF EXISTS "subscribers_insert_public" ON public.subscribers;
CREATE POLICY "subscribers_insert_public"
  ON public.subscribers FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "subscribers_admin_all" ON public.subscribers;
CREATE POLICY "subscribers_admin_all"
  ON public.subscribers FOR ALL
  TO authenticated, service_role
  USING ((select public.is_admin()))
  WITH CHECK ((select public.is_admin()));

-- 9.5 Políticas para `public.reviews`
DROP POLICY IF EXISTS "reviews_select_approved_or_admin" ON public.reviews;
CREATE POLICY "reviews_select_approved_or_admin"
  ON public.reviews FOR SELECT
  TO anon, authenticated
  USING (status = 'aprobada' OR (select public.is_admin()));

DROP POLICY IF EXISTS "reviews_insert_public" ON public.reviews;
CREATE POLICY "reviews_insert_public"
  ON public.reviews FOR INSERT
  TO anon, authenticated
  WITH CHECK (rating >= 1 AND rating <= 5);

DROP POLICY IF EXISTS "reviews_admin_modify" ON public.reviews;
CREATE POLICY "reviews_admin_modify"
  ON public.reviews FOR ALL
  TO authenticated, service_role
  USING ((select public.is_admin()))
  WITH CHECK ((select public.is_admin()));

-- 9.6 Políticas para `public.settings`
DROP POLICY IF EXISTS "settings_select_public" ON public.settings;
CREATE POLICY "settings_select_public"
  ON public.settings FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "settings_admin_all" ON public.settings;
CREATE POLICY "settings_admin_all"
  ON public.settings FOR ALL
  TO authenticated, service_role
  USING ((select public.is_admin()))
  WITH CHECK ((select public.is_admin()));

-- 9.7 Políticas para `public.activity_logs`
DROP POLICY IF EXISTS "activity_logs_admin_all" ON public.activity_logs;
CREATE POLICY "activity_logs_admin_all"
  ON public.activity_logs FOR ALL
  TO authenticated, service_role
  USING ((select public.is_admin()))
  WITH CHECK ((select public.is_admin()));

-- -----------------------------------------------------------------------------
-- 10. PERMISOS DE ROLES ESTÁNDAR DE SUPABASE (GRANTS)
-- -----------------------------------------------------------------------------
DO $$
BEGIN
  GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
  GRANT SELECT ON public.products, public.reviews, public.settings TO anon, authenticated;
  GRANT INSERT ON public.orders, public.subscribers, public.reviews, public.users TO anon, authenticated;
  GRANT SELECT, UPDATE ON public.users, public.orders TO authenticated;
  GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO service_role;
  GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
EXCEPTION
  WHEN insufficient_privilege OR others THEN
    NULL;
END
$$;

-- -----------------------------------------------------------------------------
-- 11. PUBLICACIÓN SUPABASE REALTIME (`supabase_realtime`)
-- -----------------------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    CREATE PUBLICATION supabase_realtime;
  END IF;
EXCEPTION
  WHEN insufficient_privilege OR others THEN
    NULL;
END
$$;

DO $$
DECLARE
  tbl text;
BEGIN
  FOREACH tbl IN ARRAY ARRAY['products', 'orders', 'reviews', 'settings']
  LOOP
    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables
      WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = tbl
    ) THEN
      EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE public.%I', tbl);
    END IF;
  END LOOP;
EXCEPTION
  WHEN insufficient_privilege OR others THEN
    NULL;
END
$$;

COMMIT;

