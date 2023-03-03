import axios from 'axios'
import { ADMIN_API_URL, encode, ERRORS_MESSAGES, getErrorMessage } from 'utils'
import { logger } from 'logger'
import { ILogDataWithDBIds, ILogData } from 'types'

export const updateLog = async (logId: string, approvedResourceUrn: string) => {
  const updateLogUrl = new URL(`api/logs/${logId}`, ADMIN_API_URL)

  try {
    const { data } = await axios({
      method: 'patch',
      url: updateLogUrl.href,
      data: {
        added: true,
        approvedResourceUrn,
      },
    })

    return data
  } catch (error) {
    logger.error(error)
    throw error
  }
}

export const postLog = async (logData: ILogData) => {
  const postLogUrl = new URL('api/logs', ADMIN_API_URL)

  try {
    const { data } = await axios({
      method: 'post',
      url: postLogUrl.href,
      headers: {
        'Content-Type': 'application/json',
      },
      data: logData,
    })

    return data
  } catch (error) {
    logger.error(error)
    throw error
  }
}

export const getDocumentLog = async (resourceUrn: string) => {
  const encodedUrn = encode(resourceUrn)
  const getDocumentLogUrl = new URL(`api/logs/documents/${encodedUrn}`, ADMIN_API_URL)
  let hasLog: boolean = false
  let logData: ILogDataWithDBIds | null = null

  try {
    const { data } = await axios({
      method: 'get',
      url: getDocumentLogUrl.href,
    })
    logData = data
    hasLog = true
  } catch (error) {
    // @ts-ignore
    if (error?.response?.status === 404) {
      hasLog = false
    } else {
      throw error
    }
  }

  return { hasLog, logData }
}

export const getStampData = async (projectId: string, userEmail: string) => {
  const getStampDataUrl = new URL(`api/projects/${projectId}/users/${userEmail}/stamp`, ADMIN_API_URL)

  try {
    const { data } = await axios({
      method: 'get',
      url: getStampDataUrl.href,
    })

    return data
  } catch (error: any) {
    if (error?.response?.status === 404) {
      throw new Error(getErrorMessage(ERRORS_MESSAGES.USER_DATA_IS_MISSING, { email: userEmail, projectId }))
    } else {
      throw error
    }
  }
}
