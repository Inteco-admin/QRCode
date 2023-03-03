import dotenv from 'dotenv'
import morgan from 'morgan'
import { logger } from './logger'
import { Request, Response, NextFunction } from 'express'
import { ERRORS_TYPES, ERRORS_RESPONSES, throwErrorResponse } from 'utils/'

dotenv.config()

morgan.token('body', (req: Request) => JSON.stringify(req.body))

export const requestLogger = morgan(':method :url :status :res[content-length] - :response-time ms :body', {
  stream: {
    write: (message: String) => {
      logger.http(message)
    },
  },
})

export function errorHandlerMiddleware(err: any, req: Request, res: Response, next: NextFunction) {
  if (err.name === 'AxiosError') {
    const status = err?.response?.status || 500
    if (status === ERRORS_RESPONSES[ERRORS_TYPES.UNAUTHORIZED].errorStatus) {
      throwErrorResponse(req, res, err, ERRORS_TYPES.UNAUTHORIZED)
    } else {
      throwErrorResponse(req, res, err.response.data, ERRORS_TYPES.AJAX_ERROR, status)
    }
  } else {
    throwErrorResponse(req, res, err, ERRORS_TYPES.INTERNAL_SERVER_ERROR)
  }
}
