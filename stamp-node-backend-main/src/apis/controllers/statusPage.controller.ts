import { NextFunction, Request, Response } from 'express'
import { get2LeggedAuthAccessToken, getDocumentInfo, isVersionRelevant, getDocumentLog } from 'apis/helpers'
import { AUTODESK_DOCS_URL, dateFormat, ERRORS_MESSAGES, getUserDataByEmail, getErrorMessage } from 'utils'

const dateNone = '--/--/----'

const statusPage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { urn } = req.query

  if (!urn) {
    next(new Error(ERRORS_MESSAGES.INCORRECT_QUERY_PARAMS))
    return
  } else {
    try {
      const accessToken: string = await get2LeggedAuthAccessToken()

      const { logData } = await getDocumentLog(String(urn))

      if (!logData) {
        next(new Error(getErrorMessage(ERRORS_MESSAGES.LOG_NOT_FOUND, { urn: String(urn) })))
        return
      }

      const {
        adsk_user: approverUserEmail,
        reviewId,
        approvalDate,
        adsk_project: projectId,
        approvedResourceUrn,
      } = logData
      const projectIdDataManagement = projectId
      const reviewURL: URL = new URL(`projects/${projectId.replace('b.', '')}/reviews/${reviewId}`, AUTODESK_DOCS_URL)

      const { fullName, jobTitle } = await getUserDataByEmail(accessToken, String(approverUserEmail))
      console.log(fullName, jobTitle)
      const { documentName, documentLink, documentVersion, documentCreateTime } = await getDocumentInfo(
        accessToken,
        projectIdDataManagement,
        String(approvedResourceUrn)
      )
      const isLastVersion: boolean = await isVersionRelevant(
        accessToken,
        projectIdDataManagement,
        String(approvedResourceUrn)
      )

      res.render('home', {
        isLastVersion,
        documentName,
        documentLink,
        documentVersion,
        documentCreateTime: documentCreateTime ? dateFormat(String(documentCreateTime)) : dateNone,
        fullName,
        jobTitle,
        approvalDate: approvalDate ? dateFormat(String(approvalDate)) : dateNone,
        reviewURL: reviewURL.href,
      })
    } catch (e) {
      next(e)
    }
  }
}

export default {
  statusPage,
}
