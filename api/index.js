import Fastify from 'fastify'
import axios from 'axios'

const fastify = Fastify({
  logger: true
})

const start = 0
const offset = 30

fastify.get('/', (request, reply) => {
  
  reply.send({ hello: 'hahaha' })
})

fastify.get('/build_subject', async (request, reply) => {
  
})

// Run the server!
fastify.listen({ port: 3000 }, (err, address) => {
  if (err) throw err
  // Server is now listening on ${address}
})