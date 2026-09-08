-- Migration 0025 created app.assistant_cases and app.assistant_observations
-- (RLS enabled + FORCE + tenant/workspace policy) but never granted
-- papadata_app or papadata_test access to them, unlike every sibling Papa
-- Lab table added around the same time (assistant_recommendations,
-- assistant_decisions, assistant_action_proposals, assistant_outcomes in
-- migration 0026; assistant_lab_experiments in 0027). This went unnoticed
-- because no frontend caller ever exercised papa.lab.read,
-- papa.observations.read or papa.observation.save until the "Laboratorium"
-- and "Obserwacje" tabs were wired into PapaAssistantExperience.tsx --
-- verified against a real database: both endpoints failed with
-- "permission denied for table assistant_cases" / "assistant_observations".

GRANT SELECT, INSERT, UPDATE ON
  app.assistant_cases,
  app.assistant_observations
TO papadata_app;

GRANT SELECT, INSERT, UPDATE, DELETE ON
  app.assistant_cases,
  app.assistant_observations
TO papadata_test;
