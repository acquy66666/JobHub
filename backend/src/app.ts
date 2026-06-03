import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { env } from './config/env';
import healthRouter from './routes/health';
import authRouter from './routes/auth';
import employerRouter from './routes/employer';
import jobRouter from './routes/job';
import candidateRouter from './routes/candidate';
import adminRouter from './routes/admin';
import reportRouter from './routes/report';
import notificationRouter from './routes/notification';
import publicRouter from './routes/public';
import { errorHandler } from './middlewares/errorHandler';

const app = express();

app.use(helmet());
app.use(cors({ origin: env.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.use('/api', healthRouter);
app.use('/api/auth', authRouter);
app.use('/api/employer', employerRouter);
app.use('/api/jobs', jobRouter);
app.use('/api/candidate', candidateRouter);
app.use('/api/admin', adminRouter);
app.use('/api/reports', reportRouter);
app.use('/api/notifications', notificationRouter);
app.use('/api/public', publicRouter);

app.use(errorHandler);

export default app;
