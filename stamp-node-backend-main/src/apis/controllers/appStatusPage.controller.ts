import { NextFunction, Request, Response } from 'express'

const appStatusPage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    res.json({
      status: 'ok',
    })
  } catch (error) {
    next(error)
  }
}

export default {
  appStatusPage,
}
