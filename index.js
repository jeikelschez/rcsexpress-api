const express = require('express');
const cors = require('cors');
const routerApi = require('./routes');

const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');

const { logErrors, errorHandler, boomErrorHandler, ormErrorHandler } = require('./middlewares/error.handler');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.use(cors());

app.get('/', (req, res) => {
  res.send('Hola mi server en express');
});

app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocument)
);

routerApi(app);

app.use(logErrors);
app.use(ormErrorHandler);
app.use(boomErrorHandler);
app.use(errorHandler);

app.listen(port, () => {
  console.log('Mi port: ' +  port);
});
