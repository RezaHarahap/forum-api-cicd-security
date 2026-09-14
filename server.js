import createServer from './src/Infrastructures/http/createServer.js';
import container from './src/Infrastructures/container.js';

const app = await createServer(container);

export default app;
