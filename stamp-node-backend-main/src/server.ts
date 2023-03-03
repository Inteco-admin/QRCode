import express from 'express'
import cors from 'cors'
import { engine } from 'express-handlebars'
import { logger } from 'logger'
import { errorHandlerMiddleware, requestLogger } from 'middlewares'
import { logsRouter, webhookRouter, statusPageRouter } from 'apis/routes'
import { ADMIN_BASE_URL } from 'utils'

process
  .on('unhandledRejection', (reason, p) => {
    console.error(reason, 'Unhandled Rejection at Promise', p)
  })
  .on('uncaughtException', err => {
    console.error(err, 'Uncaught Exception thrown')
    process.exit(1)
  })

const app = express()
const server = require('http').Server(app)

const port = process.env.PORT || 3002
app.use(express.static('public'))

const isDevelopment = process.env.NODE_ENV !== 'production'
if (isDevelopment) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
}

const corsOptions = {
  origin: ADMIN_BASE_URL,
}

app.use(cors(corsOptions))

app.use(express.json())
app.use(requestLogger)
app.use('/logs', logsRouter)
app.use('/', statusPageRouter)
app.use('/api', webhookRouter)

app.use(errorHandlerMiddleware)

app.set('port', port)

app.engine('handlebars', engine())
app.set('view engine', 'handlebars')
app.set('views', 'src/views')

server.listen(app.get('port'), function () {
  logger.info('Server listening on port ' + server.address().port)
})
