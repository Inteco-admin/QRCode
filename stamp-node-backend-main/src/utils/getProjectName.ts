import axios from 'axios'
import {
  AUTODESK_BASE_URL,
  ACCOUNT_ID,
} from 'utils'

export const getProjectName = async (accessToken: string, projectIdDataManagement) => {
  const url = new URL(`hq/v1/accounts/${ACCOUNT_ID}/projects/${projectIdDataManagement}`, AUTODESK_BASE_URL)

  const { data } = await axios({
    method: 'get',
    url: url.href,
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  return data.name
}
