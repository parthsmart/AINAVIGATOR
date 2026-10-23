import { createServer as createViteServer } from 'vite';
import { app } from './src/index.js';

const PORT = 3000;
const HOST = '0.0.0.0';

async function startServer() {
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });

  app.use(vite.middlewares);

  app.listen(PORT, HOST, () => {
    console.log(`AI Career Navigator full-stack server running on http://${HOST}:${PORT}`);
  });
}

startServer();
