const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const F = require('fxjs/Strict');
dayjs.extend(utc)

const DATE_FORM_REGEXP = new RegExp(/^20[0-9]{2}(\.|\s)[0-9]{1,2}(\.|\s)[0-9]{1,2}/)
const WRONG_DATE_FORM_REGEXP = new RegExp(/^20[0-9]{2}\.\s[0-9]{1}\.\s[0-9]{1}/)

const isDateForm = v => DATE_FORM_REGEXP.test(v)
const isIrregularDateForm = v => WRONG_DATE_FORM_REGEXP.test(v)

const validateDate = date => F.go(
  date,
  F.replace(/\s/g, ''),
  (date) => [
    dayjs(date, 'YYYY.MM.DD').format('YYYY.MM.DD') === date || dayjs(date, 'YYYYMMDD').format('YYYYMMDD') === date,
    date,
  ]
)


const subtractOneDay = date =>
  dayjs(date).subtract(1, 'day').format('YYYY.MM.DD')

const isTimeStamp = v => v instanceof Date
const handleTimeStamp = v => `'${dayjs(v).utc().format('YYYY-MM-DD HH:mm:ss')}'`

module.exports = {
  isDateForm,
  isIrregularDateForm,
  validateDate,
  subtractOneDay,
  isTimeStamp,
  handleTimeStamp,
}
