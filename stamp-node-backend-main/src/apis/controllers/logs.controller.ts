import fs from 'fs'
import path from 'path'
import { logger } from 'logger'
import { LOGS_DIR } from 'utils'
import { NextFunction, Request, Response } from 'express'

const pathToLogs: string = path.join(__dirname, '../../' + LOGS_DIR)

export class LogsController {
  static async getLogs(req: Request, res: Response, next: NextFunction) {
    res.download(pathToLogs, function(err) {
      if (err) {
        logger.error(err)
      }
    })
  }

  static async eraseLogs(req: Request, res: Response, next: NextFunction) {
    fs.writeFile(pathToLogs, '', function(err) {
      if (err) {
        next(err)
      }
      res.status(200)
    })
  }
}
