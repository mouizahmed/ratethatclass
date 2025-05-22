import express, { Request, Response, Application } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
require('dotenv').config();

const app: Application = express();
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: ['https://www.ratethatclass.com', 'https://ratethatclass.com', 'http://localhost:3000'],
    credentials: true,
    // optionSuccessStatus: 200,
  })
);
app.use(bodyParser.json());

app.get('/health', (req: Request, res: Response) => {
  res.json({ message: 'Success' });
});

import universityRouter from './routes/university';
app.use('/university', universityRouter);

import departmentRouter from './routes/department';
app.use('/department', departmentRouter);

import courseRouter from './routes/course';
app.use('/course', courseRouter);

import reviewRouter from './routes/review';
app.use('/review', reviewRouter);

import professorRouter from './routes/professor';
app.use('/professor', professorRouter);

import userRouter from './routes/user';
app.use('/user', userRouter);

import reportRouter from './routes/report';
app.use('/report', reportRouter);

app.listen(3001, () => {
  console.log('Server running on port 3001');
});

// app.use((req, res, next) => {
//     // if (dbConnectionError) {
//     //     res.status(500).send({ error: dbConnectionError });
//     // } else {
//     //     next();
//     // }
//     console.log('MIDDLE');
//     next();
// });
