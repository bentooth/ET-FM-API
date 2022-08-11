import * as express from 'express';
import SoundCloudService from './soundcloud-client';

const HTTP_PORT = 4000;

function startServer() {

  const app = express();

  const soundcloud = new SoundCloudService();

  app.use(soundcloud.checkTokens);

  app.get('/playlist', soundcloud.getPlaylist);

  app.get('/stream/:id', soundcloud.getStream);

  app.listen(HTTP_PORT, () => { console.log(`Express is listening at http://localhost:${HTTP_PORT}`); });

}

(() => {
  try {
    console.log("Starting HTTP Server ...");
    startServer();
    console.log("HTTP Server is ready");
  } catch (error) {
    console.log(`Server error ${error}`);
  }
})();