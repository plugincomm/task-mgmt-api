const express = require("express");
const app = express();
const bodyParser = require('body-parser');
const morgan = require('morgan');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv/config');
const errorHandler = require('./helper/error-handler');

app.use(cors());
app.options('*', cors);

// Middleware
app.use(bodyParser.json());
app.use(express.json({ limit: '100mb',extended : true }));
app.use(bodyParser.urlencoded({limit: '100mb', extended: true, parameterLimit:100000 })); 
app.use('/public/uploads/videoimg', express.static(__dirname + '/public/uploads/videoimg')); 
app.use('/public/uploads/video', express.static(__dirname + '/public/uploads/video')); 
 
app.use(morgan('tiny'));  

// Use authJwt middleware, excluding certain routes
/*app.use(authJwt().unless({ path: [
    { url: /\/api\/v1\/users\/login/, methods: ['POST'] },
    { url: /\/api\/v1\/users\/register/, methods: ['POST'] }
]}));*/

// Error handling middleware
app.use(errorHandler);

const api = process.env.API_URL;

const catvideoRouter = require('./routers/catvideos');
const uploadvideoRouter = require('./routers/uploadvideos');
const usersRouter = require('./routers/users');
const permissionsRouter = require('./routers/permissions');
const roleRouter = require('./routers/roles')
const userPermissionsRouter = require('./routers/userpermissions');

app.use(`${api}/catvideos`, catvideoRouter);
app.use(`${api}/uploadvideos`,uploadvideoRouter) 
app.use(`${api}/users`, usersRouter);
app.use(`${api}/admin/permissions`, permissionsRouter);  
app.use(`${api}/admin/roles`, roleRouter);
app.use(`${api}/admin/userpermissions`, userPermissionsRouter);


mongoose.set('debug', true);

mongoose.connect(process.env.CONNECTION_STRING)
    .then(() => {
        console.log("Database connection is ready for work...");
    })
    .catch((error) => {
        console.log(error);
    });

app.listen(4001, () => {
    console.log('Server is running at http://localhost:4001');  
});
  