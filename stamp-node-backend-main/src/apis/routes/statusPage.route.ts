import express, { Router } from 'express'
import { StatusPageController, AppStatusPageController } from 'apis/controllers'

const { statusPage } = StatusPageController
const { appStatusPage } = AppStatusPageController

const statusPageRouter: Router = express.Router()

statusPageRouter.get('/', appStatusPage)
statusPageRouter.get('/status', statusPage)

export { statusPageRouter }
