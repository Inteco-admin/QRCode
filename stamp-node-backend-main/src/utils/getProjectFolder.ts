import axios from 'axios'
import { AUTODESK_BASE_URL, FOLDERS, HUB_ID } from './const'
import { IObjectAny } from 'types'

export const getProjectFolder = async (projectId: string, accessToken: string) => {
  const url = new URL(`project/v1/hubs/${HUB_ID}/projects/${projectId}/topFolders`, AUTODESK_BASE_URL)

  const { data } = await axios({
    method: 'get',
    url: url.href,
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  const folder = data.data.find((item: IObjectAny) => item.attributes.name === FOLDERS.projectFiles)

  return {
    urn: folder.id,
    name: folder.attributes.name,
  }
}
