import { NextFunction, Request, Response } from 'express'
import {
  downloadFile,
  get2LeggedAuthAccessToken,
  uploadFile,
  getUploadDirectory,
  getDataForQRCode,
  generateQRCode,
  getStamp,
  getDocumentLog,
  postLog,
  updateLog,
  getStampData,
} from 'apis/helpers'
import {
  getUserData,
  toArrayBuffer,
  addImgToPdf,
  IMG_TYPE,
  LOG_TYPES,
  ERRORS_MESSAGES,
  WEBHOOK_RESPONSES_MESSAGES,
  getErrorMessage,
} from 'utils'
import { IApprovalState, TLoglType, ILogData } from 'types'

const webHook = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { stamp } = req.query

  const { body: hookData } = req
  const { payload, resourceUrn } = hookData

  try {
    const projectId: string = payload.project
    const itemId: string = payload.lineageUrn
    const projectIdForDataManagement = `b.${projectId}`

    if (payload['custom-metadata']['dm_sys:approveState']) {
      const approvalState: IApprovalState = JSON.parse(payload['custom-metadata']['dm_sys:approveState'])
      const isApproved: boolean = approvalState.value === 'approved'

      if (isApproved) {
        const approverUserId: string = approvalState.approverUserId
        const reviewId: string = approvalState.reviewId
        const approvalDate: string = new Date().toISOString().split('T')[0] //current date

        const { hasLog, logData } = await getDocumentLog(resourceUrn)

        // Если запись уже есть и документ проштампован, то выходим
        if (hasLog && logData?.added) {
          res.json({ status: WEBHOOK_RESPONSES_MESSAGES.ALREADY_ADDED })
          return
        }

        const accessToken: string = await get2LeggedAuthAccessToken()
        const userData = await getUserData(accessToken, projectId, approverUserId)

        // Записываем в лог, если записи нет, и получаем id лога
        let logId: string
        if (!hasLog) {
          let type: TLoglType = LOG_TYPES.qr
          if (stamp !== undefined) {
            type = LOG_TYPES.stamp
          }
          const logData: ILogData = {
            adsk_project: projectIdForDataManagement,
            adsk_user: userData.email,
            documentName: payload.name,
            approvedResourceUrn: null,
            lType: type,
            added: false,
            reviewId,
            approvalDate,
            resourceUrn,
          }
          const { id } = await postLog(logData)
          logId = id
        } else if (hasLog && logData) {
          logId = logData.id
        } else {
          throw new Error(ERRORS_MESSAGES.LOG_DATA_ERROR)
        }

        let finalPDF // итоговый файл ПДФ

        const { fileData: rawFile, fileInfo: rowFileInfo } = await downloadFile(
          accessToken,
          projectIdForDataManagement,
          itemId
        )

        // добавляем QR-код
        const link = getDataForQRCode(resourceUrn)
        const qrcode = await generateQRCode(link)
        finalPDF = await addImgToPdf(rawFile, qrcode, IMG_TYPE.qrCode.name)

        if (stamp !== undefined) {
          if (userData.jobTitle === undefined || !userData.jobTitle.trim().length) {
            throw new Error(getErrorMessage(ERRORS_MESSAGES.JOB_TITLE_IS_MISSING, { email: userData.email }))
          }

          const { url: signatureUrl, contactor } = await getStampData(projectIdForDataManagement, userData.email)
          const stamp = await getStamp(userData, signatureUrl, contactor, approvalDate)

          finalPDF = await addImgToPdf(finalPDF, toArrayBuffer(stamp), IMG_TYPE.stamp.name)
        }

        // fs.writeFileSync('test.pdf', finalPDF)
        const mirroredFolderId = await getUploadDirectory(hookData, accessToken)
        const approvedResourceUrn = await uploadFile(
          accessToken,
          finalPDF,
          projectIdForDataManagement,
          mirroredFolderId,
          rowFileInfo
        )
        await updateLog(logId, approvedResourceUrn)
      }
    }

    res.json({ status: WEBHOOK_RESPONSES_MESSAGES.SUCCESS })
  } catch (e) {
    next(e)
  }
}

export default {
  webHook,
}
