const fs = require('fs');
const dbPath = './prisma/dev.db';
if (fs.existsSync(dbPath)) {
  fs.unlinkSync(dbPath);
  console.log('Deleted prisma/dev.db');
}
const mainDb = './dev.db';
if (fs.existsSync(mainDb)) {
  fs.copyFileSync(mainDb, dbPath);
  console.log('Copied dev.db to prisma/dev.db');
}
