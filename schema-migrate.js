require('dotenv').config()

const mysql = require('mysql2/promise')
const fs = require('fs')
const path = require('path')
const { executeQuery } = require('./data-migration-helper/functions')
const { map, go, curry } = require('fxjs')

const loadSQL = curry((directory, file) =>
  fs.readFileSync(path.join(__dirname, `${directory}/${file}`)).toString()
)

const syncSchema = async wechickenConn =>
  go(
    fs.readdirSync(path.join(__dirname, 'schemas')),
    map(loadSQL('schemas')),
    map(executeQuery(wechickenConn))
  )

const seedData = async wechickenConn =>
  go(
    fs.readdirSync(path.join(__dirname, 'seeds')),
    map(loadSQL('seeds')),
    map(executeQuery(wechickenConn))
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
