import { NextFunction, Request, Response } from 'express'
import {
  get2LeggedAuthAccessToken,
  getFolderItems,
  addWebhookToFolders,
  getWebhooksList,
  getWebhooksIds,
  deleteWebhookFromFolder,
} from 'apis/helpers'
import { STATUS_SUCCESS } from 'utils'

const addWebhooks = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { projectId } = req.params

  try {
    const accessToken = await get2LeggedAuthAccessToken()
    const folderItems = await getFolderItems(accessToken, projectId)
    await addWebhookToFolders(accessToken, folderItems, projectId)

    res.json({ status: STATUS_SUCCESS })
  } catch (e) {
    next(e)
  }
}

const deleteWebhooks = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { projectId } = req.params

  try {
    const accessToken = await get2LeggedAuthAccessToken()
    const folderItems = await getFolderItems(accessToken, projectId)
    const webhookList = await getWebhooksList(accessToken)
    const hooksId = await getWebhooksIds(folderItems, webhookList)
    await deleteWebhookFromFolder(accessToken, hooksId)

    res.json({ status: STATUS_SUCCESS })
  } catch (e) {
    next(e)
  }
}

export default {
  addWebhooks,
  deleteWebhooks,
}
