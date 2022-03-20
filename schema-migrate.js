require('dotenv').config()

const mysql = require('mysql2/promise')
const fs = require('fs')
const path = require('path')
const { executeQuery, dropTable } = require('./data-migration-helper/functions')
const F = require('fxjs')

const readSQL = F.curry((directory, file) =>
  fs.readFileSync(path.join(__dirname, `${directory}/${file}`)).toString()
)

const dropAllTables = async wechickenConn =>
  F.go(
    fs.readdirSync(path.join(__dirname, 'schemas')),
    F.map(F.replace("-", "_")),
    F.map(F.split(".")),
    F.map(F.head),
    F.map(dropTable(wechickenConn)),
  )

const syncSchema = async wechickenConn =>
  F.go(
    fs.readdirSync(path.join(__dirname, 'schemas')),
    F.map(readSQL('schemas')),
    F.map(executeQuery(wechickenConn))
  )

const seedData = async wechickenConn =>
  F.go(
    fs.readdirSync(path.join(__dirname, 'seeds')),
    F.map(readSQL('seeds')),
    F.map(executeQuery(wechickenConn))
  )

const main = async () => {
  let wechickenConn

  try {
    wechickenConn = await mysql.createConnection({
      host: process.env.WECHICKEN_HOST,
      user: process.env.WECHICKEN_USER,
      port: process.env.WECHICKEN_PORT,
      database: process.env.WECHICKEN_DATABASE,
      password: process.env.WECHICKEN_PASSWORD,
    })

    console.log(wechickenConn.config)

    await dropAllTables(wechickenConn)
    console.log('DATABASE TABLES ALL DROPED')

    await syncSchema(wechickenConn)
    console.log('DATABASE SCHEMAS SYNC DONE')

    await seedData(wechickenConn)
    console.log('DATABASE SEEDS SYNC DONE')
  } catch (e) {
    console.error(e)
  } finally {
    await wechickenConn.end()
  }
}

main()
