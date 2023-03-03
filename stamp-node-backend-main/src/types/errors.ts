export type TError =
  | 'INVALID_REQUEST'
  | 'ACCESS_DENIED'
  | 'NOT_FOUND'
  | 'INTERNAL_SERVER_ERROR'
  | 'UNAUTHORIZED'
  | 'AJAX_ERROR'

export interface IErrorResponseJson {
  errorStatus: number
  message: string
}
