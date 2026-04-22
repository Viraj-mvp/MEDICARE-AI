/**
 * Prediction Orchestrator
 * This file is now a wrapper around the production-grade AI engine.
 */

export { 
    runPredictionEngine,
    type PredictionInput,
    type PredictionEngineResult,
    type PredictionSource
} from '../ai/engine';
