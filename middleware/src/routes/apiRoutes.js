const express = require('express');
const router = express.Router();
const clienteController = require('../controllers/clienteController');
const { verifyToken } = require('../middleware/authMiddleware');

// Aplicar o middleware de autenticação em todas as rotas
router.use(verifyToken);

// Rotas da API [cite: 20]
router.post('/clientes', clienteController.createCliente); // POST /api/clientes [cite: 21]
router.get('/clientes/:id', clienteController.getCliente); // GET /api/clientes/{id} [cite: 33]

module.exports = router;