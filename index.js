require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const ActionsSdkAssistant = require('actions-on-google').ActionsSdkAssistant

const INTENT_MAIN = 'assistant.intent.action.MAIN'
const INTENT_GET_SHOWS = 'INTENT_GET_SHOWS'

function main () {
  const app = express()
  app.set('port', process.env.PORT)
  app.use(bodyParser.json({type: 'application/json'}));

  const actionMap = new Map()
  actionMap.set(INTENT_MAIN, mainIntent)
  actionMap.set(INTENT_GET_SHOWS, getShows)

  app.post('/', (req, res) => {
    console.log('POST /')
    const assistant = new ActionsSdkAssistant({request: req, response: res})
    assistant.handleRequest(actionMap)
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
  console.log('GET_SHOWS intent')
  assistant.tell('The upcoming shows are in your butt')
}

main()
