# DB_Report
A simple Node.js application that will execute a SQL query on an Oracle database, write the information to a file, and then email the file to the specified receipients.

### Pre-requistes
1. Install node. (https://nodejs.org/)
2. Set up node-oracledb. (https://www.npmjs.com/package/oracledb)
3. Need to create a **`dbconfig.conf`** file, that holds the connection string to the Oracle database.
   - This file will allow you to connect to the proper database.
   - There is an example file in this repository.

### Steps
1. Replace the necessary placeholders, e.g. '\<sql_statement\>', with the proper values.
2. Create a service file, in order to run the application in the background.
   - For example, on SLES 12 you can create a service file in `/etc/systemd/system/<service_name>.service`.
