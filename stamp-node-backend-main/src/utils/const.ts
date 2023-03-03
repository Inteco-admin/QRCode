import { TLoglType } from 'types'
import dotenv from 'dotenv'

dotenv.config()

export const IS_DEVELOPMENT = process.env.NODE_ENV === 'development'

export const LOGS_DIR = '../logs/console.log'

export const HUB_ID = 'b.899364b8-d74d-4c3f-9a5e-999741d40657'
export const ACCOUNT_ID = '899364b8-d74d-4c3f-9a5e-999741d40657'
export const AUTODESK_BASE_URL = 'https://developer.api.autodesk.com/'
export const AUTODESK_DOCS_URL = 'https://docs.b360.eu.autodesk.com/'
export const STAMP_SMINEX_URL = 'https://stamp.sminex.com/api/webhook'

export const URL_STAMP_PARAM_NAME = 'stamp'

export const HOSTNAME = process.env.HOSTNAME || 'http://localhost:3002'

export const ADMIN_BASE_URL = process.env.ADMIN_BASE_URL
export const ADMIN_API_URL = `${ADMIN_BASE_URL}/`
export const IMAGES_HOST = `${ADMIN_BASE_URL}/media`

export const EMAILS = process.env.EMAILS ? process.env.EMAILS.split(',') : []

export const FOLDERS = {
  projectFiles: 'Project Files',
  toBeApproved: '01. На согласование',
  approved: '02. Согласовано',
}

export const DOTS_PER_MM = 2.83446712

export const IMG_TYPE = {
  stamp: {
    name: 'stamp',
    x: 15 * DOTS_PER_MM,
    y: 105 * DOTS_PER_MM,
    width: 80 * DOTS_PER_MM,
    height: 35 * DOTS_PER_MM,
  },
  qrCode: {
    name: 'qrCode',
    x: 100 * DOTS_PER_MM,
    y: 105 * DOTS_PER_MM,
    width: 35 * DOTS_PER_MM,
    height: 35 * DOTS_PER_MM,
  },
}

export const DEFAULT_DB_PORT = 5432

export const LOG_TYPES: { [key: string]: TLoglType } = {
  qr: 'QRC',
  stamp: 'STA',
}

export const WEBHOOK_RESPONSES_MESSAGES = {
  ALREADY_ADDED: 'already added',
  SUCCESS: 'success',
}

export const TO_BE_APPROVED_FOLDERS_NAME = {
  stageK: '01. Концепция',
  stageP: '02. Стадия П',
  stageTD: '03. Стадия ТД',
  stageR: '04. Стадия Р',
  stageID: '05. Стадия ИД',
}

export const STATUS_SUCCESS = 'success'

export const SMTP_CONFIG = {
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
}

export const EMAIL_TEMPLATE = {
  subject: 'Ошибка при проставлении штампа (stamp.sminex.com)',
  html: (error: string, hookData) => `
    <p>Ошибка: ${error}</p>
    <p>Данные запроса: <br> ${JSON.stringify(hookData, null, '&nbsp;').replace(/\n/g, '<br />')}</p>
  `,
  to: EMAILS,
}
