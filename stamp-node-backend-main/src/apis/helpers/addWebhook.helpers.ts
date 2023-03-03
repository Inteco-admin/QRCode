import axios from 'axios'
import { IObjectAny } from 'types'
import {
  AUTODESK_BASE_URL,
  FOLDERS,
  TO_BE_APPROVED_FOLDERS_NAME,
  getFolderContents,
  ERRORS_MESSAGES,
  STAMP_SMINEX_URL,
  URL_STAMP_PARAM_NAME,
  getProjectFolder,
  getErrorMessage,
} from 'utils'

export const getFolderItems = async (accessToken: string, projectId: string) => {
  const projectFilesFolder = await getProjectFolder(projectId, accessToken)
  if (!projectFilesFolder) {
    throw new Error(ERRORS_MESSAGES.UPLOAD_DIRECTORY_ERROR)
  }
  const projectFilesFolderContent = await getFolderContents(projectId, projectFilesFolder.urn, accessToken)
  const toBeApprovedFolder = projectFilesFolderContent.data.find(
    (item: IObjectAny) => item.attributes.name === FOLDERS.toBeApproved
  )
  const { id: toBeApprovedFolderId } = toBeApprovedFolder
  return await getFolderContents(projectId, toBeApprovedFolderId, accessToken)
}

export const addWebhookToFolders = async (accessToken: string, folderItems: { data: any[] }, projectId: string) => {
  const url = new URL(`webhooks/v1/systems/data/events/dm.version.modified/hooks`, AUTODESK_BASE_URL)

  let intersection: { id: string; name: string }[] = []
  for (let key in TO_BE_APPROVED_FOLDERS_NAME) {
    const value = TO_BE_APPROVED_FOLDERS_NAME[key]
    const filteredItems = folderItems.data.find((item: IObjectAny) => item.attributes.name === value)
    if (filteredItems !== undefined) {
      intersection.push({ id: filteredItems.id, name: filteredItems.attributes.name })
    }
  }
  if (intersection.length !== 5) {
    throw new Error(getErrorMessage(ERRORS_MESSAGES.REQUIRED_FOLDERS_MISSING, { projectId }))
  } else {
    for (let i = 0; i < intersection.length; i++) {
      let callbackUrl = STAMP_SMINEX_URL
      const currnetFolderId = intersection[i].id
      const currnetFolderName = intersection[i].name

      if (currnetFolderName === TO_BE_APPROVED_FOLDERS_NAME.stageR) {
        callbackUrl = callbackUrl + '?' + URL_STAMP_PARAM_NAME
      }

      const params = {
        callbackUrl: callbackUrl,
        scope: {
          folder: currnetFolderId,
        },
        filter: "$[?(@.ext=='pdf')]",
      }

      await axios({
        method: 'post',
        url: url.href,
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'x-ads-region': 'EMEA',
        },
        data: JSON.stringify(params),
      })
    }
  }
}

export const getWebhooksList = async (
  accessToken: string,
  url: URL = new URL(`webhooks/v1/hooks`, AUTODESK_BASE_URL)
): Promise<IObjectAny> => {
  let webhookFullList = []

  const { data: webhookList } = await axios({
    method: 'get',
    url: url.href,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'x-ads-region': 'EMEA',
    },
  })

  const link = webhookList.links.next
  webhookFullList = webhookFullList.concat(webhookList.data)

  if (link !== null) {
    const url = new URL(`webhooks/v1${link}`, AUTODESK_BASE_URL)
    webhookFullList = webhookFullList.concat(webhookList.data)
    return await getWebhooksList(accessToken, url)
  }
  return webhookFullList
}

export const getWebhooksIds = async (folderItems, webhookList) => {
  let hooksId: string[] = []
  for (let i = 0; i < webhookList.length; i++) {
    const currentHook = webhookList[i]
    for (let j = 0; j < folderItems.data.length; j++) {
      const currentData = folderItems.data[j]
      if (currentHook.scope.folder === currentData.id) {
        hooksId.push(currentHook.hookId)
      }
    }
  }
  return hooksId
}

export const deleteWebhookFromFolder = async (accessToken: string, hooksId: string[]) => {
  for (let i = 0; i < hooksId.length; i++) {
    const currentHookId = hooksId[i]
    const url = new URL(`webhooks/v1/systems/data/events/dm.version.modified/hooks/${currentHookId}`, AUTODESK_BASE_URL)

    await axios({
      method: 'delete',
      url: url.href,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'x-ads-region': 'EMEA',
      },
    })
  }
}
