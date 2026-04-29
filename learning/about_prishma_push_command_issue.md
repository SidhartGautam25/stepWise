-> when we change something in schema file , and do db:push command , it
   directly create the updated tables according to the new schema ,
   without making any history or migration . 

-> now if we run pnpm --filter @repo/db db:migrate:deploy , then it will 
   give us  error , or if you run pnpm --filter @repo/db db:dev , still
   it will give us error 

-> to understand the error cause , first lets understand the these migrate:dev
   and migrate:deploy command , dev command reads our schema , and if it has 
   changes then it create a migration file and list down those chnages in 
   such that when we now run migrate:deploy command , prisma can read this
   migration file and update the table in the remote db to update or 
   create new tables in db according to the migration file .

-> one missing point is , when we run migrate:dev , it not only create 
   the migration file  , it tries to be helpful and run the sql commands
   also to create table in remote db according to the migration file ,
   and migrate:deploy only run the command written in migration file
   into remote db.

-> one more thing about these two command , when we run migrate:dev or 
   migrate:deploy , prisma not only update the table in db , it 
   also maintain a table named _prisma_migrations . so when  prisma 
   update the table in the remote db , it add a row in that _prisma_migrations
   which has the name of the migration file and the table it updated or 
   added according to that migration file 
   
-> but when we run migrate:dev command after the push command , it sees 
   the schema has updated , and it makes a migration file which has 
   listing of those chnages . now after creating that file , it tries
   to applies that migration files command into remote db , but since 
   we have already created or updated the tables according to new 
   schema using push command , , prisma will say that new table 
   already exist . 

-> now lets discuss how we will resolve this issue
-> 
-> now we will run this command => pnpm --filter @repo/db exec prisma      migrate resolve --<migration-file-name> --schema=prisma/schema.prisma

-> this command adds a row to the _prisma_migrations table in your Neon 
   DB. It does not run any SQL. It just marks it as "Finished."
-> now if we run migrate command , prisma will not give any error ,
   as migration file is there , according to it , table is there in 
   remote db , and the hidden table which prisma maintain also has a row
   which has listing of the migration file and the updated table name ,
   so it will just say everything is up to date .

-> always run pnpm --filter @repo/db db:generate command after migration
   so that client and types in node_modules is updated to our latest schema 
-> now to check those types has been updated , run this command 
   pnpm --filter @repo/db exec tsc --noEmit , if no error ,then things
   are fine .
-> to check things are fine , after db:generate command , we can also run 
   pnpm --filter @repo/db exec prisma migrate status this command to know 
   migration and db are in sync or not 
-> now run the seed command to put data in the updated table in remote db