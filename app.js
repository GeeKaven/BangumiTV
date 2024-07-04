import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { readFileSync } from 'fs'
import Cors from '@fastify/cors'
import Static from '@fastify/static'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const collectionMap = {
  want: [],
  watched: [],
  watching: [],
}

const calendar = []

export default async function (fastify, opt) {
  fastify.register(Cors, {
    origin: true,
  })

  fastify.register(Static, {
    root: join(__dirname, 'public'),
  })

  fastify.get('/', (request, reply) => {
    reply.sendFile('index.html')
  })

  fastify.get('/bangumi', (request, reply) => {
    const { type, offset, limit } = request.query

    if (!collectionMap[type]) {
      reply.send({ msg: `No collection ${type}` }).statusCode(404)
    }

    const collection = collectionMap[type]
    reply.send({
      data: collection.data.slice(
        parseInt(offset),
        parseInt(offset) + parseInt(limit)
      ),
      total: collection.total,
    })
  })

  fastify.get('/v2/bangumi', (request, reply) => {
    const { type, page, size } = request.query
    if (!collectionMap[type]) {
      reply.send({ msg: `No collection ${type}` }).statusCode(404)
    }

    const collection = collectionMap[type]
    reply.send({
      data: collection.data.slice(
        (parseInt(page) - 1) * size,
        parseInt(page) * parseInt(size)
      ),
      total: collection.total,
    })
  })

  fastify.get('/bangumi_total', (request, reply) => {
    const res = {}
    for (const key in collectionMap) {
      if (Object.hasOwnProperty.call(collectionMap, key)) {
        const collection = collectionMap[key]
        res[key] = collection.total
      }
    }
    reply.send(res)
  })

  fastify.get('/calendar', (request, reply) => {
    reply.send(calendar)
  })

  fastify.addHook('onReady', async () => {
    for (const key in collectionMap) {
      if (Object.hasOwnProperty.call(collectionMap, key)) {
        collectionMap[key] = await JSON.parse(
          readFileSync(`${__dirname}/data/${key}.json`, 'utf8')
        )
      }
    }

    calendar.push(
      ...(await JSON.parse(
        readFileSync(`${__dirname}/data/calendar.json`, 'utf-8')
      ))
    )

    console.log(`- [INFO] collection loaded.`)
  })
}
