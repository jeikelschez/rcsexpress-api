const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const base64 = require('js-base64');
const mailgen = require('mailgen');
const { models, Sequelize } = require('./../libs/sequelize');
const { config } = require('./../config/config');

const mailUser = config.mailUser;
const mailPass = config.mailPass;

const CusuariosService = require('./../services/clientesUsuarios.service');
const validatorHandler = require('./../middlewares/validator.handler');
const { createCusuariosSchema, updateCusuariosSchema, getCusuariosSchema } = require('./../schemas/clientesUsuarios.schema');
const authenticateJWT  = require('./../middlewares/authenticate.handler');

const service = new CusuariosService();

router.get('/login', async (req, res, next) => {
  try {
    const { email, password } = req.headers;
    const data = await service.login(email, password);
    res.json({data});
  } catch (error) {
    next(error);
  }
});

router.get('/verify', async (req, res, next) => {
  try {
    const { activo, cliente, email } = req.headers;
    const cUsuarios = await service.find(activo, cliente, email);
    res.json(cUsuarios.length);
  } catch (error) {
    next(error);
  }
});

router.post('/',
  validatorHandler(createCusuariosSchema, 'body'),
  async (req, res, next) => {
    try {
      const body = req.body;
      const newCusuario = await service.create(body);
      res.status(201).json(newCusuario);
    } catch (error) {
      next(error);
    }
  }
);

// Endpoint para la Invitacion
router.get('/send-invitation', async (req, res) => {
  const { address, client } = req.headers;

  let cliente = await models.Clientes.findByPk(client, {    
    raw: true,
  });

  //let url = 'http://localhost:8080/#/userConfirm?cliente=';
  let url = 'https://scen.rcsexpress.com/#/userConfirm?cliente=';

  let config = {
    host: "mail.rcsexpress.com",
    port: 465,
    secure: true,
    auth: {
      user: mailUser,
      pass: mailPass,
    },
  };
  let transporter = nodemailer.createTransport(config);

  let MailGenerator = new mailgen({
    theme: 'default',
    product: {
      name: 'R.C.S. EXPRESS, S.A',
      link: 'https://rcsexpress.com/',
      copyright: 'Copyright © 2024 RCS EXPRESS. Todos los derechos reservados.',
    },
  });

  let response = {
    body: {
      greeting: 'Hola',
      signature: 'Atentamente',
      name: cliente.nb_cliente,
      intro: ['Ha recibido este correo como parte de una invitación para acceder al sistema de consulta de las Guías asociadas a su Empresa.', 'Al acceder, se le pedirá que asocie una contraseña a su Usuario'],
      action: {
        instructions: 'Para confirmar su invitación, haga click debajo:',
        button: {
          color: '#193595',
          text: 'Confirma tu Suscripción',
          link: url + client + '&email=' + base64.encode(address),
        },
      },
    },
  };

  let mail = MailGenerator.generate(response);

  let message = {
    from: process.env.MAIL_APP_USER,
    to: address,
    subject: 'Confirma tu suscripción al Sistema de RCS Express!',
    html: mail,
  };

  transporter
    .sendMail(message)
    .then((info) => {
      return res.status(201).json({
        msg: 'Email sent',
        info: info.messageId,
        preview: nodemailer.getTestMessageUrl(info),
      });
    })
    .catch((err) => {
      return res.status(500).json({ msg: err });
    });
});

// Endpoint para la Confirmacion
router.get('/send-confirm', async(req, res) => {
  const { address, client, password } = req.headers;

  //let url = 'http://localhost:8080/#/userLogin';
  let url = 'https://scen.rcsexpress.com/#/userLogin';

  let cliente = await models.Clientes.findByPk(client, {    
    raw: true,
  });

  let config = {
    host: "mail.rcsexpress.com",
    port: 465,
    secure: true,
    auth: {
      user: mailUser,
      pass: mailPass,
    },
  };
  let transporter = nodemailer.createTransport(config);

  let MailGenerator = new mailgen({
    theme: 'default',
    product: {
      name: 'R.C.S. EXPRESS, S.A',
      link: 'https://rcsexpress.com/',
      copyright: 'Copyright © 2024 RCS EXPRESS. Todos los derechos reservados.',
    },
  });

  let response = {
    body: {
      greeting: 'Hola',
      signature: 'Atentamente',
      name: cliente.nb_cliente,
      intro: ['Su usuario fue ingresado con exito.', 'Usuario: ' + address, 'Contraseña: ' + password],
      action: {
        instructions: 'Para ingresar al sistema, haga click debajo:',
        button: {
          color: '#193595',
          text: 'Accede al Sistema',
          link: url,
        },
      },
    },
  };

  let mail = MailGenerator.generate(response);

  let message = {
    from: process.env.MAIL_APP_USER,
    to: address,
    subject: 'Bienvenido al sistema de consulta de Guías de RCS Express!',
    html: mail,
  };

  transporter
    .sendMail(message)
    .then((info) => {
      return res.status(201).json({
        msg: 'Email sent',
        info: info.messageId,
        preview: nodemailer.getTestMessageUrl(info),
      });
    })
    .catch((err) => {
      return res.status(500).json({ msg: err });
    });
});

router.get('/', authenticateJWT, async (req, res, next) => {
  try {
    const { activo, cliente } = req.headers;
    const cUsuarios = await service.find(activo, cliente);
    res.json(cUsuarios);
  } catch (error) {
    next(error);
  }
});

router.get('/:id',
  authenticateJWT,
  validatorHandler(getCusuariosSchema, 'params'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const cUsuario = await service.findOne(id);
      res.json(cUsuario);
    } catch (error) {
      next(error);
    }
  }
);

router.put('/:id',
  authenticateJWT,
  validatorHandler(getCusuariosSchema, 'params'),
  validatorHandler(updateCusuariosSchema, 'body'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const body = req.body;
      const cUsuario = await service.update(id, body);
      res.json(cUsuario);
    } catch (error) {
      next(error);
    }
  }
);

router.delete('/:id',
  authenticateJWT,
  validatorHandler(getCusuariosSchema, 'params'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      await service.delete(id);
      res.status(201).json({id});
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;
