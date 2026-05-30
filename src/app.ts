import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import routes from './routes';
import { notFoundHandler } from './middlewares/notFound.middleware';
import { errorHandler } from './middlewares/error.middleware';

const app: Application = express();

app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

app.use(routes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
