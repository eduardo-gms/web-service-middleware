// TOKEN FIXO PARA O EXERCÍCIO (Atende ao requisito 5.2 do PDF) [cite: 64]
const API_TOKEN = "token-123";

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token não fornecido ou formato inválido.' });
  }

  const token = authHeader.split(' ')[1];

  if (token !== API_TOKEN) {
    return res.status(403).json({ error: 'Token inválido.' });
  }

  next();
};

module.exports = { verifyToken };