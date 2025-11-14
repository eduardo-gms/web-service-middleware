const API_TOKEN = process.env.API_TOKEN;

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token de autenticação não fornecido no formato Bearer.' });
  }

  const token = authHeader.split(' ')[1];

  if (token !== API_TOKEN) {
    return res.status(403).json({ error: 'Token inválido.' });
  }

  // Se o token for válido, continua para a rota
  next();
};

module.exports = { verifyToken };