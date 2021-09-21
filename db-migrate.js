require('dotenv').config()

const mysql = require('mysql2/promise')
const { go, map } = require('fxjs')
const L = require('fxjs/Lazy')
const {
  JWT_TABLE_NAMES,
  TRANSFORM,
  WECHICKEN_TABLE_NAMES,
  PAGE_SIZE,
} = require('./db-migration-helper/constants')
const {
  getRows,
  createInsertIntoQuery,
  truncateTable,
  alterAutoIncrement,
  filterPipe,
  executeQuery,
  getChunksByPageSize,
} = require('./db-migration-helper/functions')

const init = async wechickenConn => {
  return go(
    WECHICKEN_TABLE_NAMES,
    map(truncateTable(wechickenConn)),
    () => WECHICKEN_TABLE_NAMES,
    map(alterAutoIncrement(wechickenConn))
  )
}

const etl = async (jwtConn, wechickenConn) => {
  return go(
    JWT_TABLE_NAMES,
    map(getRows(jwtConn)),
    L.zip(TRANSFORM),
    L.map(([f, rows]) => map(f, rows)),
    L.zip(WECHICKEN_TABLE_NAMES),
    L.map(filterPipe),
    L.map(getChunksByPageSize(PAGE_SIZE)),
    L.flat,
    L.map(createInsertIntoQuery),
    map(executeQuery(wechickenConn))
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
  } catch (e) {
    console.error(e)
  } finally {
    await jwtConn.end()
    await wechickenConn.end()
  }
}

main()
