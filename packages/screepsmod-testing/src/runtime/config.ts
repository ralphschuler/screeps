const DEFAULT_SCENARIOS = ['default-bootstrap', 'construction-economy', 'remote-mining', 'defense-hostile', 'alliance-safety'];

function splitScenarioList(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String).map(s => s.trim()).filter(Boolean);
  if (typeof value !== 'string') return [];
  if (value.trim().toLowerCase() === 'none') return [];
  return value.split(',').map(s => s.trim()).filter(Boolean);
}

export function getConfiguredScenarios(config: any): string[] {
  const env = ((globalThis as any).process?.env ?? {}) as Record<string, string | undefined>;
  const envScenarios = splitScenarioList(env.SCREEPS_TEST_SCENARIOS);
  if (envScenarios.length > 0 || env.SCREEPS_TEST_SCENARIOS?.toLowerCase() === 'none') return envScenarios;

  const explicit = splitScenarioList(config.screepsmod?.testing?.scenarios);
  if (explicit.length > 0) return explicit;

  return [];
}

export function getDefaultScenarioList(): string[] {
  return DEFAULT_SCENARIOS.slice();
}
