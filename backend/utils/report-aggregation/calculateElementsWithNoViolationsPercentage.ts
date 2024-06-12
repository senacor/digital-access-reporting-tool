/**
 * @param elementCount Number of all elements
 * @param elementWithViolationCount Number of elements with violations
 * @returns number Percentage of elements with no violations as a number between 0 and 1
 */
export function calculateElementsWithNoViolationsPercentage(
  elementCount: number,
  elementWithViolationCount: number,
) {
  // e.g.: (10 items * 100%) / 200 total items = 5%
  const percentageOfElementsWithViolations = (elementWithViolationCount * 100) / elementCount
  // e.g.: (100% - 5%) / 100 = 0.95;
  const result = (100 - percentageOfElementsWithViolations) / 100
  const roundedResult = Math.round(result * 100) / 100
  roundedResult.toFixed(2)

  return roundedResult
}
