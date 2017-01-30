const knex = require('knex')

const pg = knex({
  client: 'pg',
  connection: process.env.DB_URI
})

module.exports = pg
