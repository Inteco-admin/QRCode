import nodeHtmlToImage from 'node-html-to-image'
import fs from 'fs'
import path from 'path'
import puppeteer from 'puppeteer'

const pathToTemplate: string = path.join(__dirname, '../static/stamp.html')
const htmlString = fs.readFileSync(pathToTemplate, 'utf8')

const formatDate = date => {
  const dateArray = date.split('-').reverse()
  return dateArray.join('.')
}

export async function drawStamp(name: string, position: string, company: string, date: string, signature: ArrayBuffer) {
  const base64Image = Buffer.from(signature).toString('base64')
  const dataURI = 'data:image/jpeg;base64,' + base64Image
  const formattedDate = formatDate(date)
  return nodeHtmlToImage({
    puppeteer: puppeteer,
    puppeteerArgs: {
      args: ['--no-sandbox'],
    },
    //output: './image.png', // генерация картинки для отладки
    transparent: true,
    content: {
      name,
      position,
      company,
      date: formattedDate,
      signature: dataURI,
    },
    html: htmlString,
  })
}
