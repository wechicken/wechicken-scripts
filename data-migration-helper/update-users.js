require('dotenv').config()

const { go, map, head, pipe } = require('fxjs')
const L = require('fxjs/Lazy')
const { executeQuery } = require('./functions')

const getBatches = wechickenConn => {
  const query = `
    SELECT
      id,
      manager_id
    FROM batch
  `

  return executeQuery(wechickenConn, query)
}

const getUsers = wechickenConn => {
  const query = `
    SELECT 
      id,
      blog_address
    FROM user
  `

  return executeQuery(wechickenConn, query)
}

const updateBlogTypeIdQuery = ({ id, blog_type_id }) => {
  const query = `
    UPDATE user
    SET blog_type_id = ${blog_type_id}
    WHERE id = ${id}
  `

  return query
}

const updateIsManagerQuery = manager_id => {
  const query = `
    UPDATE user
    SET is_manager = 1
    WHERE id= ${manager_id}
  `

  return query
}

const matchBlogAddress = blog_address => {
  const BLOG_MATCH_REGEXP =
    /velog|medium|tistory|github|netlify|wordpress|brunch|notion/gi
  return blog_address.match(BLOG_MATCH_REGEXP)
}

const BLOG_TYPE_ID_MAPPER = {
  velog: 1,
  medium: 2,
  tistory: 3,
  github: 4,
  netlify: 5,
  wordpress: 6,
  brunch: 7,
  notion: 8,
}

const updateUsersBlogTypeId = async wechickenConn => {
  const users = await getUsers(wechickenConn)

  const handleBlogAddress = pipe(
    L.map(({ blog_address }) => blog_address),
    L.map(matchBlogAddress),
    L.map(head),
    L.map(v => BLOG_TYPE_ID_MAPPER[v])
  )

  return go(
    handleBlogAddress(users),
    L.zip(users),
    L.map(([user, blog_type_id]) => ({ ...user, blog_type_id })),
    L.reject(({ blog_type_id }) => !blog_type_id),
    L.map(updateBlogTypeIdQuery),
    map(executeQuery(wechickenConn))
  )
}

const updateManagers = async wechickenConn =>
  go(
    getBatches(wechickenConn),
    L.map(({ manager_id }) => manager_id),
    L.map(updateIsManagerQuery),
    map(executeQuery(wechickenConn))
  )

module.exports = {
  updateUsersBlogTypeId,
  updateManagers,
}
