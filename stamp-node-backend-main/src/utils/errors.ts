import { IErrorResponseJson, TError } from 'types/errors'

export const ERRORS_TYPES: { [key: string]: TError } = {
  INVALID_REQUEST: 'INVALID_REQUEST',
  ACCESS_DENIED: 'ACCESS_DENIED',
  NOT_FOUND: 'NOT_FOUND',
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
  UNAUTHORIZED: 'UNAUTHORIZED',
  AJAX_ERROR: 'AJAX_ERROR',
}

export const ERRORS_MESSAGES: { [key: string]: string } = {
  DOWNLOAD_FILE_ERROR: 'Ошибка при загрузке файла: {{itemId}}',
  GET_STAMP_ERROR: 'Ошибка при получении штампа: {{path}}',
  ADD_STAMP_TO_PDF_ERROR: 'Ошибка при добавлении штампа к PDF',
  UPLOAD_DIRECTORY_ERROR: 'Ошибка при получении директории для загрузки: Проект {{projectId}} - {{data}}',
  INCORRECT_QUERY_PARAMS: 'Некорректные параметры запроса',
  LOG_NOT_FOUND: 'Записи с таким Urn в базе данных не существует: {{urn}}',
  LOG_DATA_ERROR: 'Ошибка при получении данных лога: {{urn}}',
  REQUIRED_FOLDERS_MISSING: 'Отсутствуют обязательные папки. Невозможно создать хуки для проекта {{projectId}}',
  JOB_TITLE_IS_MISSING: 'Не указана должность согласующего: {{email}}',
  USER_DATA_IS_MISSING:
    'Пользователь {{email}} не найден или отсутствуют подпись или наименование компании на проекте {{projectId}}',
}

export const ERRORS_RESPONSES: { [K in TError as string]: IErrorResponseJson } = {
  [ERRORS_TYPES.INVALID_REQUEST]: {
    errorStatus: 400,
    message: 'Неверный запрос',
  },
  [ERRORS_TYPES.UNAUTHORIZED]: {
    errorStatus: 401,
    message: 'Пользователь не авторизован',
  },
  [ERRORS_TYPES.ACCESS_DENIED]: {
    errorStatus: 403,
    message: 'Доступ запрещен',
  },
  [ERRORS_TYPES.NOT_FOUND]: {
    errorStatus: 404,
    message: 'Ресурс не найден',
  },
  [ERRORS_TYPES.INTERNAL_SERVER_ERROR]: {
    errorStatus: 500,
    message: 'Внутренняя ошибка сервера',
  },
  [ERRORS_TYPES.AJAX_ERROR]: {
    errorStatus: 500,
    message: 'Ошибка запроса',
  },
}

export const getErrorMessage = (error: string, params?: { [key: string]: string }): string => {
  let message = error
  if (params) {
    Object.keys(params).forEach(key => {
      message = message.replace(`{{${key}}}`, params[key])
    })
  }
  return message
}
