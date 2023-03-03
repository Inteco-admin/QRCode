import axios from 'axios'
import {
  AUTODESK_BASE_URL,
  drawStamp,
  ERRORS_MESSAGES,
  FOLDERS,
  IMAGES_HOST,
  getFolderContents,
  getErrorMessage,
} from 'utils'
import { logger } from 'logger'
import { IAncesstor, IfileData, IfileInfo, IObjectAny, IUserData } from 'types'

export const get2LeggedAuthAccessToken = async (): Promise<string> => {
  const authUrl = new URL('authentication/v1/authenticate', AUTODESK_BASE_URL)
  const params = new URLSearchParams()
  params.append('client_id', process.env.CLIENT_ID!)
  params.append('client_secret', process.env.CLIENT_SECRET!)
  params.append('grant_type', 'client_credentials')
  params.append('scope', 'data:read data:create data:write account:read')

  const { data } = await axios({
    method: 'post',
    url: authUrl.href,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'x-ads-region': 'EMEA',
    },
    data: params.toString(),
  })

  // Можно также получить из объекта token_type, expires_in, refresh_token
  return data.access_token
}

export const downloadFile = async (accessToken: string, projectId: string, itemId: string): Promise<IfileData> => {
  let fileData: ArrayBuffer
  let fileInfo: IfileInfo

  try {
    const getFileLocationUrl = new URL(`data/v1/projects/${projectId}/items/${itemId}`, AUTODESK_BASE_URL)
    const { data: itemData } = await axios({
      method: 'get',
      url: getFileLocationUrl.href,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    let latestVersionStorageLocation: string = itemData.included[0].relationships.storage.meta.link.href

    const fileResponse = await axios({
      method: 'get',
      url: latestVersionStorageLocation,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-type': 'application/x-www-form-urlencoded',
      },
      responseType: 'arraybuffer',
    })

    fileData = fileResponse.data
    fileInfo = {
      fileName: itemData.data.attributes.displayName,
      itemId: itemData.included[0].relationships.item.data.id,
      storageId: itemData.included[0].relationships.storage.data.id,
    }
  } catch (error) {
    logger.error(error)
    throw new Error(getErrorMessage(ERRORS_MESSAGES.DOWNLOAD_FILE_ERROR, { itemId: itemId }))
  }

  return {
    fileData,
    fileInfo,
  }
}

export const getUserSignature = async (signaturePath: string): Promise<ArrayBuffer> => {
  let stampData: ArrayBuffer
  try {
    const getStampUrl = new URL(signaturePath, IMAGES_HOST)
    const stampResponse = await axios({
      method: 'get',
      url: getStampUrl.href,
      responseType: 'arraybuffer',
    })

    stampData = stampResponse.data
  } catch (error) {
    logger.error(error)
    throw new Error(getErrorMessage(ERRORS_MESSAGES.GET_STAMP_ERROR, { path: signaturePath }))
  }

  return stampData
}

export const getStamp = async (userData: IUserData, signatureUrl: string, contactor: string, approvalDate: string) => {
  const { fullName, jobTitle } = userData
  const userSignature = await getUserSignature(signatureUrl)

  return await drawStamp(fullName, jobTitle, contactor, approvalDate, userSignature)
}

const getFolderUrnByPath = async (
  arr: string[],
  projectId: string,
  parentId: string,
  accessToken: string,
  index = 0
) => {
  if (!arr[index]) {
    return parentId
  }

  const folderContent = await getFolderContents(projectId, parentId, accessToken)
  const folder = folderContent.data.find((item: IObjectAny) => item.attributes.name === arr[index])
  if (!folder) {
    throw new Error(
      getErrorMessage(ERRORS_MESSAGES.UPLOAD_DIRECTORY_ERROR, {
        projectId,
        data: JSON.stringify(folderContent.data, null, 2),
      })
    )
  }
  const { id: newParentId } = folder
  return await getFolderUrnByPath(arr, projectId, newParentId, accessToken, ++index)
}

export const getUploadDirectory = async (hookInfo: IObjectAny, accessToken: string) => {
  const projectId = 'b.' + hookInfo.payload.project
  const ancestors: [IAncesstor] = hookInfo.payload.ancestors
  const parentFolder = ancestors.find(item => item.name === FOLDERS.projectFiles)
  if (!parentFolder) {
    throw new Error(
      getErrorMessage(ERRORS_MESSAGES.UPLOAD_DIRECTORY_ERROR, { projectId, data: JSON.stringify(ancestors, null, 2) })
    )
  }
  const parentFolderIndex = ancestors.findIndex(item => item.name === FOLDERS.projectFiles)
  const parentFolders = ancestors.slice(parentFolderIndex + 1).map(({ name }) => name)

  const toBeApprovedIndex = parentFolders.findIndex(folderName => folderName === FOLDERS.toBeApproved)
  if (toBeApprovedIndex !== -1) {
    parentFolders[toBeApprovedIndex] = FOLDERS.approved
  } else {
    throw new Error(
      getErrorMessage(ERRORS_MESSAGES.UPLOAD_DIRECTORY_ERROR, {
        projectId,
        data: JSON.stringify(parentFolders, null, 2),
      })
    )
  }

  return await getFolderUrnByPath(parentFolders, projectId, parentFolder.urn, accessToken)
}

const createStorage = async (projectId: string, accessToken: string, json: IObjectAny): Promise<IObjectAny> => {
  const url = new URL(`/data/v1/projects/${projectId}/storage`, AUTODESK_BASE_URL)
  const { data } = await axios({
    method: 'post',
    url: url.href,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/vnd.api+json',
    },
    data: json,
  })

  return data
}

const makeStorage = async (
  projectId: string,
  accessToken: string,
  json: IObjectAny,
  fileData: ArrayBuffer
): Promise<string> => {
  const storageData = await createStorage(projectId, accessToken, json)

  const objectId = storageData.data.id
  const bucketKey = objectId.split('/')[0].split(':')[3]
  const objectKey = objectId.split('/')[1]

  const signedS3Url = new URL(`/oss/v2/buckets/${bucketKey}/objects/${objectKey}/signeds3upload`, AUTODESK_BASE_URL)
  const { data: uploadData } = await axios({
    method: 'get',
    url: signedS3Url.href,
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  const uploadS3Url = uploadData.urls[0]
  const uploadKey = uploadData.uploadKey

  await axios({
    method: 'put',
    url: uploadS3Url,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    data: Buffer.from(fileData),
  })

  await axios({
    method: 'post',
    url: signedS3Url.href,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    data: { uploadKey },
  })

  return objectId
}

export const uploadFile = async (
  accessToken: string,
  fileData: ArrayBuffer,
  projectId: string,
  mirroredFolderId: string,
  rowFileInfo: IfileInfo
): Promise<string> => {
  const { fileName } = rowFileInfo

  const mirroredFolderContents = await getFolderContents(projectId, mirroredFolderId, accessToken)
  const originalFile = mirroredFolderContents.data.find(
    (item: IObjectAny) => item.type === 'items' && item.attributes.displayName === fileName
  )

  let approvedResourceUrn: string

  if (!originalFile) {
    const jsonForStorageCreation = {
      jsonapi: {
        version: '1.0',
      },
      data: {
        type: 'objects',
        attributes: {
          name: fileName,
        },
        relationships: {
          target: {
            data: {
              type: 'folders',
              id: mirroredFolderId,
            },
          },
        },
      },
    }
    const objectId = await makeStorage(projectId, accessToken, jsonForStorageCreation, fileData)
    const createFileVersionUrl = new URL(`/data/v1/projects/${projectId}/items`, AUTODESK_BASE_URL)
    const jsonForFileVersionCreation = {
      jsonapi: { version: '1.0' },
      data: {
        type: 'items',
        attributes: {
          extension: {
            type: 'items:autodesk.bim360:File',
            version: '1.0',
          },
        },
        relationships: {
          tip: {
            data: {
              type: 'versions',
              id: '1',
            },
          },
          parent: {
            data: {
              type: 'folders',
              id: mirroredFolderId,
            },
          },
        },
      },
      included: [
        {
          type: 'versions',
          id: '1',
          attributes: {
            name: fileName,
            extension: {
              type: 'versions:autodesk.bim360:File',
              version: '1.0',
            },
          },
          relationships: {
            storage: {
              data: {
                type: 'objects',
                id: objectId,
              },
            },
          },
        },
      ],
    }

    const { data } = await axios({
      method: 'post',
      url: createFileVersionUrl.href,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/vnd.api+json',
      },
      data: jsonForFileVersionCreation,
    })

    approvedResourceUrn = data.included[0].id
  } else {
    const jsonForStorageCreation = {
      jsonapi: {
        version: '1.0',
      },
      data: {
        type: 'objects',
        attributes: {
          name: fileName,
        },
        relationships: {
          target: {
            data: {
              type: 'items',
              id: originalFile.id,
            },
          },
        },
      },
    }
    const objectId = await makeStorage(projectId, accessToken, jsonForStorageCreation, fileData)
    const createVersionUrl = new URL(`data/v1/projects/${projectId}/versions`, AUTODESK_BASE_URL)
    const jsonVersionFile = {
      jsonapi: { version: '1.0' },
      data: {
        type: 'versions',
        attributes: {
          name: fileName,
          extension: {
            type: 'versions:autodesk.bim360:File',
            version: '1.0',
          },
        },
        relationships: {
          item: {
            data: {
              type: 'items',
              id: originalFile.id,
            },
          },
          storage: {
            data: {
              type: 'objects',
              id: objectId,
            },
          },
        },
      },
    }

    const { data } = await axios({
      method: 'post',
      url: createVersionUrl.href,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/vnd.api+json',
      },
      data: jsonVersionFile,
    })

    approvedResourceUrn = data.data.id
  }

  return approvedResourceUrn
}
