export const FIBONACCI = [1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233];
export const FIBONACCI_SET = new Set(FIBONACCI);

export const getLevelFromCount = (count) =>
  FIBONACCI.filter((f) => f <= count).length;
