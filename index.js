require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const ActionsSdkAssistant = require('actions-on-google').ActionsSdkAssistant
const { getUpcomingShows } = require('./lib')
const { updateShows } = require('./updateShows')

const INTENT_MAIN = 'assistant.intent.action.MAIN'
const INTENT_GET_SHOWS = 'INTENT_GET_SHOWS'

function main () {
  scheduleUpdateShows()

  const app = express()
  app.set('port', process.env.PORT)
  app.use(bodyParser.json({type: 'application/json'}));

  const actionMap = new Map()
  actionMap.set(INTENT_MAIN, mainIntent)
  actionMap.set(INTENT_GET_SHOWS, getShows)

  app.get('/health', (req, res) => {
    console.log('GET /health')
    console.log('tiny-dancer healthy')
    res.json({healthy: true})
  })

  app.post('/', (req, res) => {
    console.log('POST /')
    const assistant = new ActionsSdkAssistant({request: req, response: res})
    assistant.handleRequest(actionMap)
  })

  app.post('/update-shows', (req, res) => {
    console.log('POST /update-shows')
    updateShows()
    res.json({started: true})
  })

  const server = app.listen(
    app.get('port'),
    () => {
      console.log(`Tiny dancer listening on port ${server.address().port}`)
    }
  )
}

function mainIntent (assistant) {
  console.log('Main intent')
  assistant.tell('I can tell you upcoming shows')
}

function getShows (assistant) {
  console.log('getShows intent')
  getUpcomingShows()
    .then(
      (response) => {
        assistant.tell(response)
      }
    )
    .catch(
      (err) => {
        console.log(err)
        assistant.tell('Something went wrong, sorry about that!')
      }
    )
}

const SHOW_UPDATE_INTERVAL_MS = parseInt(process.env.SHOW_UPDATE_INTERVAL_MS || 30000, 10)
function scheduleUpdateShows () {
  console.log('Updating shows...')
  updateShows()
    .finally(
      () => {
        console.log(`...finished. Scheduling next update in ${SHOW_UPDATE_INTERVAL_MS / 1000} seconds`)
        setTimeout(scheduleUpdateShows, SHOW_UPDATE_INTERVAL_MS)
      }
    )
}


main()
