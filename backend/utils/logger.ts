import winston from "winston"

type CustomLogger = winston.Logger & {
  print: (level: string, message: string) => void
}

const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  transports: [
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
  ],
}) as CustomLogger

logger.print = function (level, message) {
  const error = new Error()
  const stackLines = error.stack?.split("\n") || []
  const callerLine = stackLines[2] || undefined // get the caller function line from stack

  // Extract file path and line number from the caller line
  const match = callerLine?.match(/\((.*):(\d+):(\d+)\)$/)
  if (match) {
    const filePath = match[1]
    const lineNumber = match[2]

    this.log({
      level,
      message: `${filePath}:${lineNumber} - ${message}`,
    })
  } else {
    this.log({
      level,
      message,
    })
  }
}

export default logger
