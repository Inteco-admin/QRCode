import { PDFDocument } from 'pdf-lib'
import { IMG_TYPE } from 'utils/const'
import { ERRORS_MESSAGES } from './errors'
import { logger } from 'logger'

const compensateRotation = (pageRotation, plusX, plusY, dimensions) => {
  let x = 0
  let y = 0

  switch (pageRotation) {
    case 90:
      x = dimensions.width - plusY
      y = dimensions.height - plusX
      break
    case 180:
      x += plusX
      y = dimensions.height - plusY
      break
    case 270:
      x += plusY
      y += plusX
      break
    default:
      //no rotation
      x = dimensions.width - plusX
      y += plusY
  }
  return { x, y }
}

export const addImgToPdf = async (fileData: ArrayBuffer, img: ArrayBuffer, imgType: string) => {
  let newPDF: PDFDocument

  if (!fileData || !img) {
    throw new Error(ERRORS_MESSAGES.ADD_STAMP_TO_PDF_ERROR)
  }

  try {
    newPDF = await PDFDocument.load(fileData)
    const pngImage = await newPDF.embedPng(img)
    const pages = newPDF.getPages()

    pages.map(page => {
      const rotation = page.getRotation()
      const correction = compensateRotation(
        rotation.angle,
        IMG_TYPE[imgType].width + IMG_TYPE[imgType].x,
        IMG_TYPE[imgType].y - IMG_TYPE[imgType].height,
        page.getSize(),
      )

      page.drawImage(pngImage, {
        x: correction.x,
        y: correction.y,
        rotate: rotation,
        width: IMG_TYPE[imgType].width,
        height: IMG_TYPE[imgType].height,
      })
    })
  } catch (error) {
    logger.error(error)
    throw new Error(ERRORS_MESSAGES.ADD_STAMP_TO_PDF_ERROR)
  }


  return await newPDF.save()
}
