const fastify = require('fastify')({ logger: true });
const fastifyStatic = require('@fastify/static');
const PORT = 2929;

fastify.register(fastifyStatic, {
  root: __dirname + '/public',
  prefix: '/'
});

fastify.get('/', async (request, reply) => {
  return reply.sendFile('index.html');
});


const start = async () => {
  try {
    await fastify.listen({ port:  PORT});
    fastify.log.info(`Server listening on http://localhost:3000`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();