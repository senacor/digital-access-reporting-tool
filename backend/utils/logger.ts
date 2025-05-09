import winston from "winston"

type CustomLogger = winston.Logger & {
  print: (level: string, message: string) => void
}

const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(winston.format.splat(), winston.format.simple()),
  transports: [new winston.transports.Console()],
}) as CustomLogger

logger.print = function (level, message) {
  const error = new Error()
  const stackLines = error.stack?.split("\n") || []
  const callerLine = stackLines[2] || undefined // get the caller function line from stack

  // Extract file path and line number from the caller line
  const match = callerLine?.match(/\((.*):(\d+):(\d+)\)$/)
  if (match) {
    // shorten the path to the file name
    const file = match[1].replace(/^.*[\\/]/, "")
    const lineNumber = match[2]

    this.log({
      level,
      message: `${file}:${lineNumber} - ${message}`,
    })
  } else {
    this.log({
      level,
      message,
    })
  }
}

export default logger
