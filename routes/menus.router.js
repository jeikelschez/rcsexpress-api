const express = require('express');

const MenusService = require('../services/menus.service');
const validatorHandler = require('../middlewares/validator.handler');
const { getMenusSchema } = require('../schemas/menus.schema');
const authenticateJWT  = require('../middlewares/authenticate.handler');

const router = express.Router();
const service = new MenusService();

router.get('/',
  async (req, res, next) => {
  try {
    const { direct, rol, read }= req.headers;
    const menus = await service.find(direct, rol, read);
    res.json(menus);
  } catch (error) {
    next(error);
  }
});

router.get('/:id',
  authenticateJWT,
  validatorHandler(getMenusSchema, 'params'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const menu = await service.findOne(id);
      res.json(menu);
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;