const knex = require('knex')

const pg = knex({
  client: 'pg',
  connection: process.env.DB_URI
})

const SHOWS = 'shows'

module.exports = {
  pg,
  SHOWS
}
