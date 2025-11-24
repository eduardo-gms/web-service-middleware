const express = require('express');
const apiRoutes = require('./routes/apiRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para parsear JSON nas requisições
app.use(express.json());

// Define o prefixo /api para as rotas
app.use('/api', apiRoutes);

app.get('/', (req, res) => {
  res.send('Servidor Middleware está no ar.');
});

app.listen(PORT, () => {
  console.log(`[Servidor Middleware] ouvindo na porta ${PORT} (aceita JSON)`);
});