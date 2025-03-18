import dotenv from 'dotenv';
dotenv.config();

import express from 'express'
import { expressjwt } from 'express-jwt';
import cors from 'cors'
import  userRouter from './routes/user.routes';

import * as bodyParser from 'body-parser';

const port = process.env.APP_PORT || 3000;



const app = express()
app.use(bodyParser.json());
app.use(cors())

app.use(
  expressjwt({
      secret: process.env.JWT_SECRET || 'default_secret',
      algorithms: ['HS256'],
  }).unless({
      path: ['/users/login', '/users/signup', '/status'],
  })
);

console.log('JWT secret:', process.env.JWT_SECRET);
console.log('jwt expires hours:', process.env.JWT_EXPIRES_HOURS);

app.use('/users', userRouter);



app.get('/status', (req, res) => {
  res.json({ message: 'Back-end is running...' });
});

app.listen(3000, function () {
  console.log("Server listening on port 3000.");
})
