const JWT_TABLE_NAMES = ['wecode', 'users', 'blogs', 'bookmarks', 'likes']
const WECHICKEN_TABLE_NAMES = ['batch', 'user', 'blog', 'bookmark', 'like']

const WECODE_TO_BATCH = ({
  nth,
  title,
  penalty,
  count,
  status,
  user_id,
  created_at,
  updated_at,
  deleted_at,
}) => ({
  id: nth,
  nth,
  title,
  penalty,
  count_per_week: count,
  is_page_opened: status,
  manager_id: user_id,
  batch_type_id: 1, // 오프라인 부트캠프
  created_at,
  updated_at,
  deleted_at,
})

const USERS_TO_USER = ({
  id,
  gmail_id,
  gmail,
  blog_address,
  user_thumbnail,
  admin,
  is_group_joined,
  user_name,
  wecode_nth,
  created_at,
  updated_at,
  deleted_at,
}) => ({
  id,
  gmail_id,
  gmail,
  blog_address,
  thumbnail: user_thumbnail,
  is_manager: admin,
  is_group_joined,
  name: user_name,
  batch_id: wecode_nth,
  // blog_type_id: (1, 2, 3, 4, 5, ..), // TODO: 블로그 타입 추려서 string matching 한 다음에..
  created_at,
  updated_at,
  deleted_at,
})

const BLOGS_TO_BLOG = ({
  id,
  title,
  subtitle,
  link,
  thumbnail,
  written_date,
  user_id,
  created_at,
  updated_at,
  deleted_at,
}) => ({
  id,
  title,
  subtitle,
  link,
  thumbnail,
  written_date, // TODO: dates 테이블 JOIN 해서 written_date 칼럼 뽑아내기
  user_id,
  created_at,
  updated_at,
  deleted_at,
})

const LIKES_TO_LIKE = ({ user_id, blog_id, status }) => ({
  user_id,
  blog_id,
  status,
})

const BOOKMARKS_TO_BOOKMARK = ({ user_id, blog_id, status }) => ({
  user_id,
  blog_id,
  status,
})

const TRANSFORM = [
  WECODE_TO_BATCH,
  USERS_TO_USER,
  BLOGS_TO_BLOG,
  LIKES_TO_LIKE,
  BOOKMARKS_TO_BOOKMARK,
]

const PAGE_SIZE = 1000

module.exports = {
  JWT_TABLE_NAMES,
  WECHICKEN_TABLE_NAMES,
  TRANSFORM,
  PAGE_SIZE,
}
