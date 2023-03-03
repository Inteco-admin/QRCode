import { IUserData } from 'types'
import axios from 'axios'
import { AUTODESK_BASE_URL, ACCOUNT_ID } from 'utils'

export const getUserDataByEmail = async (accessToken: string, email: string): Promise<IUserData> => {
  const url = new URL(
    `hq/v1/regions/eu/accounts/${ACCOUNT_ID}/users/search?email=${encodeURIComponent(email)}&limit=1`,
    AUTODESK_BASE_URL
  )

  const { data } = await axios({
    method: 'get',
    url: url.href,
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  const userData = data[0]

  return {
    fullName: userData.name,
    jobTitle: userData.job_title,
    email: userData.email,
    id: userData.id,
  }
}
