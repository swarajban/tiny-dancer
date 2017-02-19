const {pg, SHOWS} = require('./knex')
const moment = require('moment')

const DATE_FMT = 'YYYY-MM-DD'
const DAY_FMT = 'dddd'
const FUTURE_FMT = 'MMMM Do'

function getUpcomingShows () {
  return upcomingShowRows()
    .then(groupShowsByDate)
    .then(generateResponse)
}


function upcomingShowRows () {
  console.log('Fetching upcoming shows...')
  const today = moment().utcOffset(-8)
  const todayDateString = today.format(DATE_FMT)
  const nextWeek = moment(today).add(7, 'days')
  const nextWeekDateString = nextWeek.format(DATE_FMT)
  return pg(SHOWS)
    .where('show_date', '>=', todayDateString)
    .where('show_date', '<=', nextWeekDateString)
    .where('legitness', '>', 1)
    .orderBy('show_date', 'asc')
    .orderBy('legitness', 'desc')
    .tap((rows) => console.log(`...retrieved ${rows.length} shows`))
}

function groupShowsByDate (shows) {
  const dateStringShowMap = new Map()
  shows.forEach(
    ({artists, venue, show_date}) => {
      const dateString = moment(show_date).format(DATE_FMT)
      let dateShows = dateStringShowMap.get(dateString)
      if (dateShows === undefined) {
        dateShows = []
      }
      dateShows.push({artists, venue})
      dateStringShowMap.set(dateString, dateShows)
    }
  )
  console.log(`${shows.length} shows are on ${dateStringShowMap.size} days`)

  const dayStringShowMap = new Map()
  const today = moment().utcOffset(-8)
  const nextWeek = moment(today).add(7, 'days')
  for (const [dateString, shows] of dateStringShowMap) {
    const date = moment(dateString, DATE_FMT)
    let dayString = ''
    if (date.isSame(today, 'day')) {
      dayString = 'Today'
    } else if (date.isBefore(nextWeek)) {
      dayString = `On ${date.format(DAY_FMT)}`
    } else {
      dayString = `On ${date.format(FUTURE_FMT)}`
    }
    dayStringShowMap.set(dayString, shows)
  }

  return dayStringShowMap
}


function getShowString (shows) {
  let showString = ''
  if (shows.length === 1) {
    const {artists, venue} = shows[0]
    showString = `${artists} are playing at ${venue}`
  } else if (shows.length === 2) {
    const [{artists: artist1, venue: venue1}, {artists: artist2, venue: venue2}] = shows
    showString = `${artist1} are playing at ${venue1} and ${artist2} are playing at ${venue2}`
  } else {
    const lastIndex = shows.length - 1
    const firstShows = shows.slice(0, lastIndex)
    const lastShow = shows[lastIndex]
    firstShows.forEach(({artists, venue}) => {
      showString += `${artists} are playing at ${venue}, `
    })
    showString += `and ${lastShow.artists} are playing at ${lastShow.venue}`
  }
  return showString
}

function generateResponse (dayStringShowMap) {
  let response = ''
  for (const [dayString, shows] of dayStringShowMap) {
    const showString = getShowString(shows)
    response += `${dayString}, ${showString}. `
  }
  return response
}

module.exports = {
  getUpcomingShows,
  PG_DATE_FMT: DATE_FMT
}
