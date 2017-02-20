const jsdom = require('jsdom')
const Promise = require('bluebird')
const moment = require('moment')
const md5 = require('md5')

const { pg, SHOWS } = require('./knex')
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
      const show_date = moment(dateString, EDM_DATE_FMT).format(PG_DATE_FMT)
      const show_hash = md5(`${artists}${venue}${show_date}`)
      shows.push({
        artists,
        venue,
        show_date,
        show_hash
      })
    }
  )
  console.log(`Found ${shows.length} shows`)
  return shows
}

function saveShows (shows) {
  const show_hashes = shows.map((show) => show.show_hash)
  console.log('Fetching existing show hashes...')
  return pg(SHOWS)
    .whereIn('show_hash', show_hashes)
    .pluck('show_hash')
    .then(
      (existingHashList) => {
        console.log(`Found ${existingHashList.length}`)
        const existingHashSet = new Set(existingHashList)
        const newShows = shows
          .filter(
            (show) => {
              return ! existingHashSet.has(show.show_hash)
            }
          )
          .map(
            (show) => {
              delete show.show_hash
              show.legitness = 2
              return show
            }
          )

        const numNewShows = newShows.length
        if (numNewShows > 0) {
          console.log(`Saving ${newShows.length} shows`)
          return pg(SHOWS).insert(newShows)
        } else {
          console.log(`No new shows found!`)
          return { rowCount: 0}
        }

      }
    )
    .then(
      ({ rowCount }) => {
        console.log(`Successfully saved ${rowCount} shows!`)
      }
    )
    .catch(
      (err) => {
        console.log(`Error saving shows`, err)
        throw err
      }
    )
}

module.exports = {
  updateShows
}
