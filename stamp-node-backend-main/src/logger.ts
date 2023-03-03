import fs from 'fs'
import path from 'path'
import { addColors, createLogger, format, transports } from 'winston'
import { LOGS_DIR } from 'utils'

const env = process.env.NODE_ENV || 'development'
const isDevelopment = env === 'development'

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
}

const level = () => {
  return isDevelopment ? 'debug' : 'warn'
}

const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
}

addColors(colors)

const logsFilePath = path.join(__dirname, LOGS_DIR)

function createLogsFile(fileName) {
  fs.writeFile(fileName, '', err => {
    console.log('The logs file has been created')
  })
}

createLogsFile(logsFilePath)

const transportsConfig = !isDevelopment
  ? [new transports.Console()]
  : [
      new transports.Console(),
      new transports.File({
        filename: logsFilePath,
      }),
    ]

const logConfiguration = {
  level: level(),
  levels,
  transports: transportsConfig,
  format: format.combine(
    format.timestamp({ format: 'MMM-DD-YYYY HH:mm:ss' }),
    format.align(),
    format.printf(info => `${info.level}: ${[info.timestamp]}: ${info.message}`)
  ),
}

export const logger = createLogger(logConfiguration)

function isObject(objValue) {
  return objValue && typeof objValue === 'object' && objValue.constructor === Object
}

export const logError = err => {
  logger.error(err)
  try {
    logger.error(JSON.stringify(err, null, 2))
    if (err.response && err.response.data && isObject(err.response.data)) {
      logger.error(JSON.stringify(err.response.data, null, 2))
    }
  } catch (e) {
    logger.error(err)
  }
}
