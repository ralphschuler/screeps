/**
 * Intelligence System - Unified Export
 *
 * Central export for all intelligence and coordination components
 */

export { IntelScanner } from "./intelScanner";
export type { EnemyPlayer, IntelScannerConfig } from "./intelScanner";

export { ThreatPredictor } from "./threatPredictor";
export type {
  HostileCreepTrack,
  ThreatPrediction,
  ThreatPredictorConfig
} from "./threatPredictor";

export { CrossShardIntelCoordinator } from "./crossShardIntel";
export type { CrossShardIntelConfig } from "./crossShardIntel";

export { MarketTrendAnalyzer } from "./marketTrendAnalyzer";
export type {
  SupplyDemandAnalysis,
  TradingOpportunity,
  MarketTrendAnalyzerConfig
} from "./marketTrendAnalyzer";
