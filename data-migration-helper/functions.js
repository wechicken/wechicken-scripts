const {
  go,
  pipe,
  curry,
  head,
  keys,
  values,
  map,
  filter,
  join,
  isString,
  isNull,
  replace,
  chunk,
} = require('fxjs')
const F = require('fxjs/Strict');
const {
  isDateForm,
  isIrregularDateForm,
  validateDate,
  subtractOneDay,
  isTimeStamp,
  handleTimeStamp,
} = require('./days.util')

const executeQuery = curry((conn, query) => {
  return go(conn.execute(query), ([rows]) => rows)
})

const truncateTable = curry((wechickenConn, tableName) => {
  const query = `
    TRUNCATE TABLE \`${tableName}\`
  `

  return executeQuery(wechickenConn, query)
})

const alterAutoIncrement = curry((wechickenConn, tableName) => {
  const query = `
    ALTER TABLE \`${tableName}\` AUTO_INCREMENT = 1
  `

  return executeQuery(wechickenConn, query)
})

const getRows = curry((conn, tableName) => {
  if (tableName === 'blogs') {
    const query = `
      SELECT 
        b.id,
        b.title,
        b.subtitle,
        b.link,
        b.thumbnail,
        d.date as written_date,
        b.user_id,
        b.created_at,
        b.updated_at,
        b.deleted_at	
      FROM blogs b
      JOIN dates d ON b.date_id = d.id;
    `

    return executeQuery(conn, query)
  }

  const query = `
    SELECT *
    FROM \`${tableName}\`
  `

  return executeQuery(conn, query)
})

const filterPipe = ([tableName, rows]) => {
  if (tableName === 'batch')
    return go(
      rows,
      filter(({ id }) => id),
      filter(({ is_page_opened }) => is_page_opened),
      filtered => [tableName, filtered]
    )

  if (tableName === 'blog')
    return go(
      rows,
      filter(({ user_id }) => user_id),
      filtered => [tableName, filtered]
    )

  return [tableName, rows]
}

const getChunksByPageSize = curry((pageSize, [tableName, rows]) =>
  go(
    rows,
    chunk(pageSize),
    map(chunks => [tableName, chunks])
  )
)

const handleDateform = pipe(
  validateDate,
  ([bool, date]) => (bool ? date : subtractOneDay(date)),
  date => `'${date}'`
)

const handleIrregularDateForm = pipe(
  replace(/\s/g, () => '0'),
  handleDateform
)

const DATABASE_QUERY_PARSE_ERROR_ESCAPE = /['(,)"\\]/g
const handleString = pipe(
  replace(DATABASE_QUERY_PARSE_ERROR_ESCAPE, match => `\\${match}`),
  s => `'${s}'`
)

const patternHandler = v => {
  if (Number.isInteger(v)) return v
  if (isNull(v)) return v
  if (isIrregularDateForm(v)) return handleIrregularDateForm(v)
  if (isDateForm(v)) return handleDateform(v)
  if (isTimeStamp(v)) return handleTimeStamp(v)
  if (isString(v)) return handleString(v)
}

const patternMatching = pipe(map(patternHandler))

const createInsertIntoQuery = ([tableName, rows]) => {
  const columns = go(rows, head, keys, join(', '))

  return go(
    rows,
    map(values),
    map(patternMatching),
    map(join(', ')),
    map(v => `(${v})`),
    join(', '),
    v => `
      INSERT INTO \`${tableName}\` (${columns})
      VALUES ${v};
    `
  )
}

module.exports = {
  executeQuery,
  truncateTable,
  alterAutoIncrement,
  getRows,
  filterPipe,
  getChunksByPageSize,
  createInsertIntoQuery,
}
