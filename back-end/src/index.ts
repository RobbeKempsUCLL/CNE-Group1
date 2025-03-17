import express from 'express'
import cors from 'cors'
//import { createLinkRoutes } from './routes/link-routes'
//import { LinkService } from './service/link-service'
//import { SimpleUser } from './domain/user';
//import { errorHandler } from './routes/route-factory';
//import { createUserRoutes } from './routes/user-routes';
import dotenv from 'dotenv';

import * as bodyParser from 'body-parser';
//import { UserService } from './service/user-service';

dotenv.config();


const port = process.env.APP_PORT || 3000;

// declare module "express-serve-static-core" {
//   interface Request {
//     user?: SimpleUser;
//   }
// }

const app = express()
app.use(cors())


// Init services
// const linkService = new LinkService();
// const userService = new UserService();

// Create routes
// createUserRoutes(app, userService);
// createLinkRoutes(app, linkService, {});

// Errorhandler needs to be registered last
//app.use(errorHandler);


app.use(bodyParser.json());

app.get('/status', (req, res) => {
  res.json({ message: 'Back-end is running...' });
});

app.listen(3000, function () {
  console.log("Server listening on port 3000.");
})
