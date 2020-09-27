import Server from './Server';

const PORT = Number.parseInt(process.env.PORT ?? '', 10) || 3000

const server = new Server(PORT);

