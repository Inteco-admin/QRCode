import QRCode from 'qrcode'
import { HOSTNAME } from 'utils/const'

export const getDataForQRCode = (resourceUrn: string) => {
  return `${HOSTNAME}/status?urn=${resourceUrn}`
}

export const generateQRCode = async (link: string) => {
  const options = {
    errorCorrectionLevel: 'H',
    margin: -5,
    width: 150,
    height: 150,
    color: {
      dark: '#000',
      light: '#fff',
    },
  }
  return QRCode.toDataURL(link, options)
}
