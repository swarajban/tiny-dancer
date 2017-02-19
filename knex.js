const knex = require('knex')

const pg = knex({
  client: 'pg',
  connection: process.env.DB_URI
})

const SHOWS = 'shows'

pg.on('query', ({sql, bindings}) => {
    console.log(`PG Query - SQL: ${sql} Bindings: ${bindings}`)
  })

module.exports = {
  pg,
  SHOWS
}
