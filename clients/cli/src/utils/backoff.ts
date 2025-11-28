export const exponentialBackoff = (attempt: number, base = 500, max = 5000) => {
  const delay = Math.min(base * 2 ** attempt, max);
  return delay;
};