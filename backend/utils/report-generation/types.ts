import os from "os"
import { IBaselineReport } from "accessibility-checker/lib/common/engine/IReport"

export type AccessibilityCheckerReport = IBaselineReport

// Limit concurrent executions to number of CPUs
export const cpuCount = os.cpus().length
