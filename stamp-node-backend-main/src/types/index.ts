export interface IfileInfo {
  fileName: string
  itemId: string
  storageId: string
}

export interface IfileData {
  fileData: ArrayBuffer
  fileInfo: IfileInfo
}

export interface IApprovalState {
  id: string
  label: string
  iconValue: string
  buildIn: boolean
  approverUserId: string
  approverUserName: string
  reviewId: string
  reviewSequenceId: string
  value: string
}

export interface IObjectAny {
  [key: string]: any
}

export interface IAncesstor {
  name: string
  urn: string
}

export interface IUserData {
  fullName: string
  jobTitle: string
  email: string
  id: string
}

export interface IDocumentInfo {
  documentName: string
  documentLink: string
  documentVersion: string
  documentCreateTime: string
}

export interface IStatusPageData {
  approverUserId: string
  reviewId: string
  approvalDate: string
  resourceUrn: string
  projectId: string
}

export type TLoglType = 'QRC' | 'STA'

export interface ILogData {
  documentName: string
  lType: TLoglType
  added: boolean
  reviewId: string
  approvalDate: string
  resourceUrn: string
  approvedResourceUrn: string | null
  adsk_project: string
  adsk_user: string
}

export interface ILogDataWithDBIds extends ILogData {
  project: string
  approverUser: string
  id: string
}

export interface INotificationProps {
  type: string
  message: string
  description: string
  recievers: string[]
}

declare global {
  namespace Express {
    interface Request {
      notificationProps: INotificationProps
    }
  }
}
