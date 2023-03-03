import axios from 'axios'
import { AUTODESK_BASE_URL } from './const'

export const getFolderContents = async (projectId: string, folderId: string, accessToken: string) => {
  const url = new URL(`data/v1/projects/${projectId}/folders/${folderId}/contents`, AUTODESK_BASE_URL)

  const { data } = await axios({
    method: 'get',
    url: url.href,
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })
  return data
}
