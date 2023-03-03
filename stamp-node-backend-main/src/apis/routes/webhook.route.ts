import express, { Router } from 'express'
import { WebhookController, AddWebhooks, DeleteWebhooks } from 'apis/controllers'

const { webHook } = WebhookController
const { addWebhooks } = AddWebhooks
const { deleteWebhooks } = DeleteWebhooks

const webhookRouter: Router = express.Router()

webhookRouter.post('/webhook', webHook)
webhookRouter.post('/projects/:projectId/webhooks', addWebhooks)
webhookRouter.delete('/projects/:projectId/webhooks', deleteWebhooks)

export { webhookRouter }
