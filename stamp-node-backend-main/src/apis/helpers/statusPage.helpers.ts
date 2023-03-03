import axios from 'axios'
import { AUTODESK_BASE_URL, encode } from 'utils'
import { IDocumentInfo } from 'types'

export const getDocumentInfo = async (
  accessToken: string,
  projectId: string,
  resourceUrn: string
): Promise<IDocumentInfo> => {
  const encodeResourceUrn = encode(resourceUrn)
  const url = new URL(`data/v1/projects/${projectId}/versions/${encodeResourceUrn}`, AUTODESK_BASE_URL)

  const { data: documentInfo } = await axios({
    method: 'get',
    url: url.href,
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  return {
    documentName: documentInfo.data.attributes.name,
    documentLink: documentInfo.data.links.webView.href,
    documentVersion: documentInfo.data.attributes.versionNumber,
    documentCreateTime: documentInfo.data.attributes.createTime,
  }
}

export const isVersionRelevant = async (
  accessToken: string,
  projectId: string,
  resourceUrn: string
): Promise<boolean> => {
  const encodeResourceUrn = encode(resourceUrn)
  const url = new URL(`data/v1/projects/${projectId}/versions/${encodeResourceUrn}/item`, AUTODESK_BASE_URL)

  const { data: versionInfo } = await axios({
    method: 'get',
    url: url.href,
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  const currentVersionUrn = versionInfo.included[0].id

  return resourceUrn === currentVersionUrn
}
