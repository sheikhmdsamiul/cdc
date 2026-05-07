const pg = require('pg');
const client = new pg.Client(process.env.DATABASE_URL);

async function run() {
  await client.connect();
  console.log('Connected to DB');

  const users = await client.query('SELECT u.id, r.role_name FROM users u LEFT JOIN roles r ON u.role_id = r.id');
  
  for (const user of users.rows) {
    let workflowRole = null;
    if (user.role_name === 'Data Entry Operator') workflowRole = 'DEO';
    else if (user.role_name === 'Case Worker') workflowRole = 'CW';
    else if (user.role_name === 'Probation Officer') workflowRole = 'PO';
    else if (user.role_name === 'Superintendent') workflowRole = 'SUPT';

    if (workflowRole) {
      await client.query('UPDATE "users" SET "workflow_role" = $1 WHERE "id" = $2', [workflowRole, user.id]);
      console.log('Updated user', user.id, 'to', workflowRole);
    }
  }
  await client.end();
}

run().catch(console.error);
