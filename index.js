const express = require('express');
const cors = require('cors');
const routerApi = require('./routes');
const fs = require('fs');

const { logErrors, errorHandler, boomErrorHandler, ormErrorHandler } = require('./middlewares/error.handler');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.use(cors());

app.get('/', (req, res) => {
  res.send('Hola mi server en express');
});

app.get('/reporte', (req, res) => {
    const filePath = `./services/reports/pdf/documento.pdf`;

    fs.readFile(filePath, (err, file) => {
        if (err) {
            console.log(err);
            return res.status(500).send('No se pudo descargar el archivo');
        }

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'inline; filename="js.pdf"');
        res.send(file);
    });
});

routerApi(app);

app.use(logErrors);
app.use(ormErrorHandler);
app.use(boomErrorHandler);
app.use(errorHandler);

app.listen(port, () => {
  console.log('Mi port: ' +  port);
});
