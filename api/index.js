const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');

const app = express();
app.use(cors());
app.use(morgan('dev'));

const SERVER_PORT = 3000;
const NGINX_INTERNAL_LOCATION = '/protected-images';

async function checkAuth(request, response, next) {
  const token = request.headers.token || request.query.token;
  if (!token) {
    response
      .status(401)
      .send('You are not authenticated');
    return;
  }
  if (token === 'valid-token') {
    next();
    return;
  }

  response
    .status(403)
    .send('You are not allowed');
}

app.get('/nginx-check-auth/*', checkAuth, async (request, response) => {
  const fileRelativePath = request.params['0'];
  const fileAbsolutePath = path.join(NGINX_INTERNAL_LOCATION, fileRelativePath);
  response
    .header('X-Accel-Redirect', fileAbsolutePath)
    .end('');
});

app.listen(SERVER_PORT, () => {
  console.log('Server started at http://localhost:3000');
});