import Fastify from 'fastify';
import fastifyStatic from '@fastify/static';
import fastifyMultipart from '@fastify/multipart';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const fastify = Fastify({ logger: true });
const PORT = 2929;
ffmpeg.setFfmpegPath(ffmpegInstaller.path);
fastify.register(fastifyStatic, {
  root: path.join(__dirname, 'public'),
  prefix: '/',
});
fastify.register(fastifyMultipart);
const uploadDir = path.join(__dirname, 'uploads');
const outputDir = path.join(__dirname, 'converted');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);
fastify.get('/', (req, reply) => {
  return reply.sendFile('index.html');
});
fastify.post('/convert', async (req, reply) => {
  const data = await req.file();
  if (!data) return reply.code(400).send({ error: 'No file uploaded' });
  const fields = await req.parts();
  const format = req.body?.format || 'mp3';

  const inputPath = path.join(uploadDir, data.filename);
  const outputFilename = `${path.parse(data.filename).name}.${format}`;
  const outputPath = path.join(outputDir, outputFilename);
  await fs.promises.writeFile(inputPath, await data.toBuffer());
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .toFormat(format)
      .on('end', async () => {
        await fs.promises.unlink(inputPath).catch(() => {});
        reply.header('Content-Disposition', `attachment; filename="${outputFilename}"`);
        reply.send(fs.createReadStream(outputPath));
        setTimeout(() => fs.unlink(outputPath, () => {}), 10000);
        resolve();
      })
      .on('error', (err) => {
        console.error('Conversion Error:', err);
        reply.code(500).send({ error: 'Conversion failed' });
        reject(err);
      })
      .save(outputPath);
  });
});

const start = async () => {
  try {
    await fastify.listen({ port: PORT });
    fastify.log.info(`Server running at http://localhost:${PORT}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
