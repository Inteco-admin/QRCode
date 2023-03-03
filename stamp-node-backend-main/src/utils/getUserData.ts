import { IUserData } from 'types'
import axios from 'axios'
import { AUTODESK_BASE_URL } from 'utils'

export const getUserData = async (
  accessToken: string,
  projectId: string,
  approverUserId: string
): Promise<IUserData> => {
  const url = new URL(`bim360/admin/v1/projects/${projectId}/users/${approverUserId}`, AUTODESK_BASE_URL)

  const { data: userData } = await axios({
    method: 'get',
    url: url.href,
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  return {
    fullName: userData.name,
    jobTitle: userData.jobTitle,
    email: userData.email,
    id: userData.id,
  }
}
