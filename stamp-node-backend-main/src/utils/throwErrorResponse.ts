import { Response, Request } from 'express'
import { ERRORS_RESPONSES } from 'utils/'
import { TError } from 'types/errors'
import { logger } from 'logger'
import { sendEmail } from 'emailer'

export const throwErrorResponse = (req: Request, res: Response, err: any, errorType: TError, errorStatus?: number) => {
  const errorResponse = ERRORS_RESPONSES[errorType]
  const status = errorStatus || errorResponse.errorStatus

  const { body: hookData } = req

  const responseData = {
    ...errorResponse,
    errorStatus: status,
    errorInfo: err.trace || err.message || err,
  }

  let errorMessage: string

  if (typeof responseData.errorInfo === 'object') {
    errorMessage = JSON.stringify(responseData.errorInfo, null, 2)
  } else {
    errorMessage = responseData.errorInfo
  }

  logger.error(errorMessage)
  sendEmail(errorMessage, hookData)

  if (typeof responseData.errorInfo === 'string' && responseData.errorInfo.includes('<!DOCTYPE html>')) {
    res.setHeader('Content-Type', 'text/html')
    res.send(responseData.errorInfo)
    return
  }

  res.status(status).json(responseData)
}
