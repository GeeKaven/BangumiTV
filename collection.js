import { dirname } from 'path'
import { existsSync, mkdirSync, writeFileSync } from 'fs'
import 'dotenv/config'
import axios from 'axios'

const bgmUser = process.env.BANGUMI_USER || 'geekaven'
const bgmUrl = 'https://api.bgm.tv'
const subjectType = {
  anime: 2,
}
const collectionType = {
  want: 1, //想看
  watched: 2, //看过
  watching: 3, //在看
}

const headers = {
  'User-Agent':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3809.132 Safari/537.36',
}

async function fetchCollection(limit, offset) {
  const url = `${bgmUrl}/v0/users/${bgmUser}/collections`

  try {
    const { data } = await axios.get(url, {
      params: {
        subject_type: subjectType['anime'],
        limit: limit,
        offset: offset,
      },
      headers: headers,
    })
    return data
  } catch (error) {
    console.log(`- [ERROR] Fetch ${url}. error: ${error}`)
  }
  return false
}

async function getCollectionMap() {
  const collection = []
  let limit = 100

  let { total } = await fetchCollection(1, 0)
  if (!total || total <= 0) {
    console.log(`- [ERROR] ${bgmUser} no collection.`)
    return false
  }

  // 总数不足 limit 时，需修改 limit
  if (total < limit) {
    limit = total
  }

  const totalPage = Math.ceil(total / limit)
  for (let page = 0; page < totalPage; page++) {
    console.log(
      `- [INFO] Fetch ${bgmUser} collection page ${page}/${totalPage}`
    )
    const { data } = await fetchCollection(limit, page * limit)
    if (data) {
      collection.push(...data)
    }
  }

  const collectionMap = {
    want: collection.filter((item) => item['type'] === collectionType['want']),
    watched: collection.filter(
      (item) => item['type'] === collectionType['watched']
    ),
    watching: collection.filter(
      (item) => item['type'] === collectionType['watching']
    ),
  }

  return collectionMap
}

async function buildSubject() {
  // 读取用户番剧收藏
  const collectionMap = await getCollectionMap()

  for (const key in collectionMap) {
    if (Object.hasOwnProperty.call(collectionMap, key)) {
      const data = collectionMap[key]
      const newData = []
      for (let i = 0; i < data.length; i++) {
        const item = data[i]
        const subjectId = parseInt(item['subject_id'])
        delete data[i].subject
        try {
          console.log(
            `- [INFO] Fetch ${key} - ${subjectId}. ${i}/${data.length}`
          )
          const { data: subject } = await axios.get(
            `https://cdn.jsdelivr.net/gh/geekaven/BangumiTV-Subject@latest/data/${Math.floor(
              subjectId / 100
            )}/${subjectId}.json`,
            { headers: headers }
          )
          item['date'] = subject['date']
          item['images'] = subject['images']
          item['name'] = subject['name']
          item['name_cn'] = subject['name_cn']
          item['summary'] = subject['summary']
          item['total_episodes'] = subject['total_episodes']
          item['eps'] = subject['eps']
          newData.push(item)
        } catch (error) {
          console.log(
            `- [Error] ${key} - ${subjectId}. ${i}/${data.length}. ${error}`
          )
        }
      }

      const filePath = `./data/${key}.json`
      const dirName = dirname(filePath)
      if (!existsSync(dirName)) {
        mkdirSync(dirName, { recursive: true })
      }
      console.log(`- [INFO] Write ${key} to ${filePath}`)
      writeFileSync(
        filePath,
        JSON.stringify({ data: newData, total: newData.length })
      )
    }
  }

  console.log('- [INFO] Build Subject done.')
}

// 每日放送
async function fetchCalendar() {
  const url = `${bgmUrl}/calendar`

  try {
    const { data } = await axios.get(url, {
      headers: headers,
    })

    return data
  } catch (error) {
    console.log(`- [ERROR] Fetch ${url}. error: ${error}`)
  }
  return false
}

async function buildCalendar() {
  const data = await fetchCalendar()

  data.map((d) => {
    return {
      weekday: d['weekday'],
      items: d['items'].map((item) => {
        delete item['collection']
        delete item['rating']
        delete item['rank']
        return item
      }),
    }
  })

  const filePath = `./data/calendar.json`
  const dirName = dirname(filePath)
  if (!existsSync(dirName)) {
    mkdirSync(dirName, { recursive: true })
  }
  console.log(`- [INFO] Write Calendar to ${filePath}`)
  writeFileSync(filePath, JSON.stringify(data))

  console.log('- [INFO] Build Calendar done.')
}

await buildCalendar()
await buildSubject()
