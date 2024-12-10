import os from "os"
import { ACBrowserManager } from "accessibility-checker/lib/ACBrowserManager"
import { IBaselineReport } from "accessibility-checker/lib/common/engine/IReport"

export type AccessibilityCheckerReport = IBaselineReport

export const acBrowserManager = ACBrowserManager

// Limit concurrent executions to number of CPUs
export const cpuCount = os.cpus().length
