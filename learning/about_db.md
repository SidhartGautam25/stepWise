i ran the command -> pnpm --filter @repo/db db:migrate
    -> but i got the error which says draft detected : your database schema is not in sync with your 
       migration history.
    -> now why this happened -> because we are already using db:push to build our tables in db
       and we doont have any migration file at this point of time , so prisma is confused ,
       how there are so many table with any migration files
    -> so prisma want to reset everything so it has a clean history
    -> but we dont want to lose our data 


-> so first we will run this command => pnpm --filter @repo/db exec prisma migrate dev --name initial_stable_schema --create-only
    -> this will create a migration file with the name initial_stable_schema
    -> --create-only: This command tells Prisma: "Compare my schema.prisma file to my migrations folder. 
       If they are different, write the SQL needed to bridge the gap into a new file, but do not touch the database."
    -> why it avoid the error => The "All data will be lost" error happens when Prisma tries to apply a migration to a 
       database that already has tables it doesn't recognize. By using --create-only, you are just generating a text 
       file (the SQL blueprint) in our system . Since it doesn't talk to Neon during the "write" phase,
       there is no conflict.
    -> the result => we get our initial_stable_schema folder and SQL file, but your Neon database remains exactly as it was.

-> now we run this command => pnpm --filter @repo/db exec prisma migrate resolve --applied initial_stable_schema
    -> It tells the Prisma metadata table: "I have already manually executed the SQL in the initial_stable_schema 
       file. Don't actually run it; just record that it's done.
    -> Prisma keeps a hidden table in our Neon database called _prisma_migrations. This table acts like a checklist.
    -> now when we run this command , in the checklist , it add a row with this content => initial_stable_schema: SUCCESS.
    -> so next time when we run the command db:migrate , prisma looks at the checklist , sees our migration is done , then
       looks our table which has data according to this migration file , and says great everything is up to date
    -> so so dont get the error because prisma is not not doing anything , first we create the migration table , and add 
       it to checklist and marked it done own our own . and so now we have migration file and data both up to date
    -> now you have a doubt like why we need to mark it manually , like now that we have migration file and data accordingly,
       why not let prisma check it and mark it , it is because prisma not only check the data accoridng to the migration
       file , it also check which migration file is responsible for creating that table , and since that table is not 
       created by that migration file , it will give us error , and so we have to mark it manually


-> now if we run => pnpm --filter @repo/db db:migrate
    -> this will says already in sync , no schema changed or pending migration was found
    

-> actually when you run the first command , we still get error , it is so because
   Prisma looks at our Neon database and asks: "Is there a migration history table?"
   -> It finds no history, but it finds existing tables. so it will give us error

-> instead of that migrate:dev command , we will run => pnpm --filter @repo/db exec prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script > initial_migration.sql
    -> This command compares an empty database to your current schema.prisma file and outputs the SQL needed to 
       create everything from scratch.
    -> now put that file created in packages/db/prisma/migrations/0_initial_stable_schema
       and rename the file migration.sql
    -> and now run the second command to tell the prisma everything is done
