import dotenv from 'dotenv';
dotenv.config();

import express from 'express'
import cors from 'cors'
import  userRouter from '../src/routes/user.routes';

import * as bodyParser from 'body-parser';

const port = process.env.APP_PORT || 3000;



const app = express()
app.use(bodyParser.json());
app.use(cors())

app.use('/users', userRouter);



app.get('/status', (req, res) => {
  res.json({ message: 'Back-end is running...' });
});

app.listen(3000, function () {
  console.log("Server listening on port 3000.");
})
