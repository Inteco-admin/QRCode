import express, { Router } from 'express'
import { LogsController } from 'apis/controllers'

const { getLogs, eraseLogs } = LogsController
const logsRouter: Router = express.Router()

logsRouter.get('/', getLogs)
logsRouter.delete('/', eraseLogs)

export { logsRouter }
