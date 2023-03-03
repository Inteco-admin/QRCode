import nodemailer from 'nodemailer'
import { SMTP_CONFIG, EMAIL_TEMPLATE, IS_DEVELOPMENT } from 'utils'
import { logger } from 'logger'
import { IObjectAny } from 'types'

export const transporter = nodemailer.createTransport(SMTP_CONFIG)

export const sendEmail = async (error: string, hookData: IObjectAny) => {
  try {
    if (!IS_DEVELOPMENT) {
      const info = await transporter.sendMail({
        from: SMTP_CONFIG.auth.user,
        to: EMAIL_TEMPLATE.to,
        subject: EMAIL_TEMPLATE.subject,
        html: EMAIL_TEMPLATE.html(error, hookData),
      })

      logger.info(`Email message sent: ${info.messageId}`)
    }
  } catch (error) {
    logger.error(error)
  }
}
