import * as express from 'express';
import SoundCloudService from './soundcloud-client';
const { Readable } = require('stream');

const HTTP_PORT = 4000;
const app = express();

var soundcloud = new SoundCloudService();

app.get('/playlist', async (req, res) => {
  const playlist = await soundcloud.getPlaylist();
  res.status(200);
  return res.json(playlist);
});

app.get('/stream/:id', async (req, res) => {
  const trackId = req.params.id;
  const response = await soundcloud.getStream(trackId);
  response.data.pipe(res)
});

app.listen(HTTP_PORT, () => {
  return console.log(`Express is listening at http://localhost:${HTTP_PORT}`);
});