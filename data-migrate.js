require('dotenv').config()

const mysql = require('mysql2/promise');
const F = require('fxjs/Strict');
const L = require('fxjs/Lazy');
const {
  JWT_TABLE_NAMES,
  TRANSFORM,
  WECHICKEN_TABLE_NAMES,
  PAGE_SIZE,
} = require('./data-migration-helper/constants');
const {
  getRows,
  createInsertIntoQuery,
  truncateTable,
  alterAutoIncrement,
  filterPipe,
  executeQuery,
  getChunksByPageSize,
} = require('./data-migration-helper/functions');
const {
  updateUsersBlogTypeId,
  updateManagers,
} = require('./data-migration-helper/update-users');

const init = async wechickenConn => {
  return F.go(
    WECHICKEN_TABLE_NAMES,
    F.map(truncateTable(wechickenConn)),
    () => WECHICKEN_TABLE_NAMES,
    F.map(alterAutoIncrement(wechickenConn))
  );
}

const etl = async (jwtConn, wechickenConn) => {
  return F.go(
    JWT_TABLE_NAMES,
    F.map(getRows(jwtConn)),
    L.zip(TRANSFORM),
    F.map(([f, rows]) => F.map(f, rows)),
    L.zip(WECHICKEN_TABLE_NAMES),
    L.map(filterPipe),
    L.map(getChunksByPageSize(PAGE_SIZE)),
    L.flat,
    L.map(createInsertIntoQuery),
    F.map(executeQuery(wechickenConn))
  )
}

const main = async () => {
  let jwtConn
  let wechickenConn

  try {
    jwtConn = await mysql.createConnection({
      host: process.env.JWT_HOST,
      user: process.env.JWT_USER,
      port: process.env.JWT_PORT,
      database: process.env.JWT_DATABASE,
      password: process.env.JWT_PASSWORD,
    })

    wechickenConn = await mysql.createConnection({
      host: process.env.WECHICKEN_HOST,
      user: process.env.WECHICKEN_USER,
      port: process.env.WECHICKEN_PORT,
      database: process.env.WECHICKEN_DATABASE,
      password: process.env.WECHICKEN_PASSWORD,
    })

    await init(wechickenConn)
    console.log('ALL TABLE CLEANSING SUCCEED')

    await etl(jwtConn, wechickenConn)
    console.log('ALL DATA MIGRATION SUCCEED')

    await updateUsersBlogTypeId(wechickenConn)
    console.log('USERS BLOG TYPE ID UPDATED')

    await updateManagers(wechickenConn)
    console.log('USERS IS_MANAGER UPDATED')
  } catch (e) {
    console.error(e)
  } finally {
    await jwtConn.end()
    await wechickenConn.end()
  }
}

main()
