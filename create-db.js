require('dotenv').config()
const { pg, SHOWS }= require('./knex')

pg.schema.createTable(SHOWS, (table) => {
  table.increments()
  table.string('artists')
  table.string('venue')
  table.date('show_date')
  table.integer('legitness')
  table.string('show_hash')
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


/*
Triggers

 CREATE OR REPLACE FUNCTION calc_show_hash() RETURNS TRIGGER AS'
 BEGIN
 NEW.show_hash=md5(concat(NEW.artists, NEW.venue, NEW.show_date));
 return NEW;
 END
 'language plpgsql;

 CREATE TRIGGER calc_show_trigger
 BEFORE INSERT OR UPDATE
 ON shows FOR EACH ROW
 EXECUTE PROCEDURE calc_show_hash();

 DROP TRIGGER calc_show_trigger on shows;
 DROP TABLE public.shows;
 */