require('dotenv').config()
const pg = require('./knex')

pg.schema.createTable('shows', (table) => {
  table.increments()
  table.string('artist')
  table.string('venue')
  table.date('show_date')
  table.integer('legitness')
  table.timestamps()
})
  .then(
    () => {
      console.log(`Finished creating tables`)
      process.exit(0)
    }
  )
  .catch(
    (err) => {
      console.log(`Error creating tables: ${err}`)
      process.exit(1)
    }
  )
