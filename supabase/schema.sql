-- ============================================================
-- Satoshi Daily — Supabase Database Schema
-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================

-- ============================================================
-- 1. PROFILES — extends Supabase auth.users with app-specific data
-- ============================================================
CREATE TABLE public.profiles (
  id                uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email             text NOT NULL,
  marketing_consent boolean NOT NULL DEFAULT false,
  consent_timestamp timestamptz,
  current_streak    integer NOT NULL DEFAULT 0,
  last_played_date  date,
  created_at        timestamptz NOT NULL DEFAULT now()
);

-- Auto-create profile when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ============================================================
-- 2. PREDICTIONS — every prediction ever made
-- ============================================================
CREATE TABLE public.predictions (
  id              bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id         uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  game_date       date NOT NULL,
  predicted_price numeric(12,2) NOT NULL,
  guess_number    smallint NOT NULL DEFAULT 1,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_predictions_game_date ON public.predictions (game_date);
CREATE INDEX idx_predictions_user_date ON public.predictions (user_id, game_date DESC);
CREATE UNIQUE INDEX idx_predictions_user_date_guess
  ON public.predictions (user_id, game_date, guess_number);


-- ============================================================
-- 3. DAILY_RESULTS — the actual BTC price at target time each day
-- ============================================================
CREATE TABLE public.daily_results (
  game_date     date PRIMARY KEY,
  target_hour   smallint NOT NULL,
  target_minute smallint NOT NULL,
  actual_price  numeric(12,2),
  recorded_at   timestamptz,
  created_at    timestamptz NOT NULL DEFAULT now()
);


-- ============================================================
-- 4. PAGE_VIEWS — simple visit tracking
-- ============================================================
CREATE TABLE public.page_views (
  id          bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  page        text NOT NULL,
  user_id     uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  referrer    text,
  user_agent  text,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_page_views_created ON public.page_views (created_at DESC);
CREATE INDEX idx_page_views_page ON public.page_views (page, created_at DESC);


-- ============================================================
-- 5. WINNERS — winning predictions + payment status
-- ============================================================
CREATE TABLE public.winners (
  id              bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  game_date       date NOT NULL REFERENCES public.daily_results(game_date),
  user_id         uuid NOT NULL REFERENCES public.profiles(id),
  prediction_id   bigint NOT NULL REFERENCES public.predictions(id),
  predicted_price numeric(12,2) NOT NULL,
  actual_price    numeric(12,2) NOT NULL,
  difference      numeric(12,2) NOT NULL,
  accuracy        numeric(6,5) NOT NULL,
  prize_tier      text NOT NULL,
  prize_share     numeric(6,2),
  tx_id           text,
  tx_url          text,
  paid_at         timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_winners_game_date ON public.winners (game_date DESC);


-- ============================================================
-- 6. BONUS_UNLOCKS — track when users unlock bonus guess
-- ============================================================
CREATE TABLE public.bonus_unlocks (
  id          bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id     uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  game_date   date NOT NULL,
  platform    text NOT NULL DEFAULT 'unknown',
  created_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, game_date)
);


-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.winners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bonus_unlocks ENABLE ROW LEVEL SECURITY;

-- PROFILES
CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- PREDICTIONS
CREATE POLICY "Users can insert own predictions"
  ON public.predictions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authenticated users can read all predictions"
  ON public.predictions FOR SELECT
  USING (auth.role() = 'authenticated');

-- DAILY_RESULTS
CREATE POLICY "Anyone can read daily results"
  ON public.daily_results FOR SELECT
  USING (true);

-- PAGE_VIEWS (insert-only from client, read via dashboard)
CREATE POLICY "Anyone can insert page views"
  ON public.page_views FOR INSERT
  WITH CHECK (true);

-- WINNERS
CREATE POLICY "Anyone can read winners"
  ON public.winners FOR SELECT
  USING (true);

-- BONUS_UNLOCKS
CREATE POLICY "Users can insert own bonus unlock"
  ON public.bonus_unlocks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own bonus unlock"
  ON public.bonus_unlocks FOR SELECT
  USING (auth.uid() = user_id);
