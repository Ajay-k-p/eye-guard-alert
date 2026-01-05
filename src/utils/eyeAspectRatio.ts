// Eye landmarks indices for MediaPipe Face Mesh
// Left eye landmarks
export const LEFT_EYE_LANDMARKS = {
  top: [159, 145],      // Upper eyelid
  bottom: [145, 153],   // Lower eyelid
  left: 33,             // Left corner
  right: 133,           // Right corner
  upper: [158, 159, 160],
  lower: [144, 145, 153],
};

// Right eye landmarks
export const RIGHT_EYE_LANDMARKS = {
  top: [386, 374],      // Upper eyelid
  bottom: [374, 380],   // Lower eyelid
  left: 362,            // Left corner
  right: 263,           // Right corner
  upper: [385, 386, 387],
  lower: [373, 374, 380],
};

// Specific landmarks for EAR calculation
export const LEFT_EYE_EAR_POINTS = [33, 160, 158, 133, 153, 144];
export const RIGHT_EYE_EAR_POINTS = [362, 385, 387, 263, 373, 380];

interface Point {
  x: number;
  y: number;
}

/**
 * Calculate Euclidean distance between two points
 */
function euclideanDistance(p1: Point, p2: Point): number {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
}

/**
 * Calculate Eye Aspect Ratio (EAR)
 * EAR = (|p2 - p6| + |p3 - p5|) / (2 * |p1 - p4|)
 * 
 * Where:
 * - p1, p4 are the horizontal eye corner landmarks
 * - p2, p6 and p3, p5 are the vertical eye landmarks
 * 
 * A typical open eye has EAR around 0.25-0.35
 * A closed eye has EAR around 0.1 or less
 */
export function calculateEAR(eyeLandmarks: Point[]): number {
  if (eyeLandmarks.length !== 6) {
    return 0;
  }

  const [p1, p2, p3, p4, p5, p6] = eyeLandmarks;

  // Vertical distances
  const vertical1 = euclideanDistance(p2, p6);
  const vertical2 = euclideanDistance(p3, p5);

  // Horizontal distance
  const horizontal = euclideanDistance(p1, p4);

  if (horizontal === 0) return 0;

  // Eye Aspect Ratio
  const ear = (vertical1 + vertical2) / (2.0 * horizontal);
  
  return ear;
}

/**
 * Get eye landmarks from face mesh results
 */
export function getEyeLandmarks(
  landmarks: { x: number; y: number; z: number }[],
  eyeIndices: number[]
): Point[] {
  return eyeIndices.map((index) => ({
    x: landmarks[index].x,
    y: landmarks[index].y,
  }));
}

/**
 * Calculate average EAR for both eyes
 */
export function calculateAverageEAR(
  landmarks: { x: number; y: number; z: number }[]
): { leftEAR: number; rightEAR: number; averageEAR: number } {
  const leftEyePoints = getEyeLandmarks(landmarks, LEFT_EYE_EAR_POINTS);
  const rightEyePoints = getEyeLandmarks(landmarks, RIGHT_EYE_EAR_POINTS);

  const leftEAR = calculateEAR(leftEyePoints);
  const rightEAR = calculateEAR(rightEyePoints);
  const averageEAR = (leftEAR + rightEAR) / 2;

  return { leftEAR, rightEAR, averageEAR };
}

/**
 * Determine if eyes are closed based on EAR threshold
 */
export function areEyesClosed(averageEAR: number, threshold: number = 0.2): boolean {
  return averageEAR < threshold;
}
