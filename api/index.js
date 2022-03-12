import { dirname } from 'path'
import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'fs'
import Fastify from 'fastify'
import axios from 'axios'

const fastify = Fastify({
  logger: true
})

const bgmUser = process.env.BANGUMI_USER
const bgmUrl = 'https://api.bgm.tv'
const subjectType = {
  'anime': 2,
}
const collectionType = {
  'want':      1,       //想看
  'watched':   2,       //看过
  'watching':  3,       //在看
}

const headers = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3809.132 Safari/537.36'
}

fastify.get('/bangumi', (request, reply) => {
  const { type, offset, limit } = request.query
  const filePath = `./data/${type}.json`
  if (!existsSync(filePath)) {
    reply.send({ msg: `No file ${type}` }).statusCode(404)
  }
  const collection = JSON.parse(readFileSync(filePath))

  reply.send(collection.slice(offset, offset + limit))
})

fastify.get('/build_subject', async (request, reply) => {
  // 读取用户番剧收藏
  const collectionMap = {
    'want': await fetchCollection(collectionType['want']),
    'watched': await fetchCollection(collectionType['watched']),
    'watching': await fetchCollection(collectionType['watching'])
  }

  for (const key in collectionMap) {
    if (Object.hasOwnProperty.call(collectionMap, key)) {
      const collection = collectionMap[key];
      const data = collection['data']
      const newData = []
      for (let i = 0; i < data.length; i++) {
        const item = data[i];
        const subjectId = parseInt(item['subject_id'])
        try {
          console.log(`- [INFO] Fetch ${key} - ${subjectId}. ${i}/${data.length}`)
          const { data: subject } = await axios.get(`https://cdn.jsdelivr.net/gh/geekaven/BangumiTV-Subject@latest/data/${Math.floor(subjectId / 100)}/${subjectId}.json`)
          item['date'] = subject['date']
          item['images'] = subject['images']
          item['name'] = subject['name']
          item['name_cn'] = subject['name_cn']
          item['summary'] = subject['summary']
          item['total_episodes'] = subject['total_episodes']
          item['eps'] = subject['eps']
          newData.push(item)
        } catch (error) {
          console.log(`- [Error] ${key} - ${subjectId}. ${i}/${data.length}`)
        }
      }

      const filePath = `./data/${key}.json`
      const dirName = dirname(filePath)
      if (!existsSync(dirName)) {
        mkdirSync(dirName, { recursive: true })
      }
      console.log(`- [INFO] Write ${key} to ${filePath}`)
      writeFileSync(filePath, JSON.stringify(newData))
    }
  }

  reply.send({ msg: 'Done' })

})

// Run the server!
fastify.listen({ port: 3000 }, (err, address) => {
  if (err) throw err
  // Server is now listening on ${address}
})


async function fetchCollection(type) {
  const url = `${bgmUrl}/v0/users/${bgmUser}/collections`

  try {
    const { data } = await axios.get(url, {
      params: {
        subject_type: subjectType['anime'],
        type: type,
        limit: 0,
        offset: 0
      },
      headers: headers
    })
    return data
  } catch (error) {
    console.log(error)
    console.log(`[ERROR] Fetch ${url}. error: ${error}`)
  }
  return []
}