import dotenv from 'dotenv';
import cors from 'cors';
import express, { Express } from 'express';
import 'express-async-errors';
import { router } from './index.routes';

dotenv.config();
const app: Express = express();
const port = process.env.PORT;

app.use(
  cors({
    origin: '*',
    methods: 'GET,PUT,POST,DELETE,PATCH,OPTIONS',
    allowedHeaders: '*',
  })
);
app.use(router);

app.listen(port, () => {
  console.log('server running in port:', port);
});
