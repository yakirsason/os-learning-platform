export interface BurstPredictionPoint {
  index: number;
  actualBurst: number;
  predictionBeforeBurst: number;
  predictionAfterBurst: number;
}

export function calculateBurstPredictions(
  actualBursts: number[],
  initialPrediction: number,
  alpha: number
): BurstPredictionPoint[] {
  let prediction = initialPrediction;

  return actualBursts.map((actualBurst, index) => {
    const predictionBeforeBurst = prediction;
    const predictionAfterBurst = alpha * actualBurst + (1 - alpha) * predictionBeforeBurst;
    prediction = predictionAfterBurst;

    return {
      index: index + 1,
      actualBurst,
      predictionBeforeBurst,
      predictionAfterBurst,
    };
  });
}
