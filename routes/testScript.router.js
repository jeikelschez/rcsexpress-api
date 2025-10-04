const express = require('express');
const TestService = require('./../services/testScript.service');

const router = express.Router();
const service = new TestService();

// Ruta de prueba GET
router.get('/', async (req, res, next) => {
  try {
    const documentNumber = req.query.documentNumber;
    const result = await service.searchByDocumentNumber(documentNumber);
    res.json({ result });
  } catch (error) {
    next(error);
  }
});

module.exports = router;