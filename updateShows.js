const jsdom = require('jsdom')
const Promise = require('bluebird')
const moment = require('moment')
const { PG_DATE_FMT } = require('./lib')

const EDM_DATE_FMT = 'MM.DD.YYYY'
const EDM_URL = 'http://westcoastedm.com/sanfrancisco/'

function updateShows () {
  return fetchShows()
    .then(saveShows)
}

function fetchShows () {
  console.log(`Fetching shows from ${EDM_URL}`)
  return new Promise((resolve, reject) => {
    jsdom.env(
      EDM_URL,
      ['https://cdnjs.cloudflare.com/ajax/libs/jquery/3.1.1/jquery.min.js'],
      (err, window) => {
        if (err) {
          console.log(`Error loading page: ${err}`)
          return reject(err)
        }
        console.log(`Successfully loaded page`)
        const shows = parseShows(window)
        resolve(shows)
      }
    )
  })
}

function parseShows (window) {
  const shows = []
  const $ = window.$
  $('div.sqs-block-content p strong').remove()
  const content = $('div.sqs-block-content p').html()
  const rawShowStrings = content.split('<br>')
  rawShowStrings.forEach(
    (showString) => {
      if (showString === '') {
        return
      }
      const [dateString, _, artists, venue] = showString.split('•').map((string) => string.trim())
      shows.push({
        date: moment(dateString, EDM_DATE_FMT).format(PG_DATE_FMT),
        artists,
        venue
      })
    }
  )
  console.log(`Found ${shows.length} shows`)
  return shows
}

function saveShows (shows) {
  console.log(shows)
}

module.exports = {
  updateShows
}
