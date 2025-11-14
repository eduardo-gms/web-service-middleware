const axios = require('axios');
const cryptoService = require('../services/cryptoService');
const xmlService = require('../services/xmlService');

const LEGACY_API_URL = process.env.LEGACY_API_URL;

/**
 * Endpoint: POST /api/clientes [cite: 21]
 * Cadastra um novo cliente.
 */
const createCliente = async (req, res) => {
  try {
    const { nome, email, cpf } = req.body; // 1. Recebe JSON do cliente [cite: 15, 24]

    // 2. Validar dados [cite: 26]
    if (!nome || !email || !cpf) {
      return res.status(400).json({ error: 'Dados incompletos. Nome, email e cpf são obrigatórios.' });
    }

    // 3. Criptografar dados sensíveis (CPF) [cite: 28, 53]
    const encryptedCpf = cryptoService.encrypt(cpf);

    // 4. Montar o XML para o legado [cite: 16, 27]
    const xmlRequest = xmlService.buildCreateClienteXml({
      nome,
      email,
      cpf: encryptedCpf, // Envia o CPF criptografado
    });

    // 5. Enviar XML para o sistema legado [cite: 30]
    const legacyResponse = await axios.post(LEGACY_API_URL, xmlRequest, {
      headers: { 'Content-Type': 'application/xml' },
    });

    // 6. Tratar resposta do legado [cite: 17]
    const jsonResponse = await xmlService.parseXml(legacyResponse.data);

    // 7. Retornar JSON para o cliente externo [cite: 18, 32]
    res.status(201).json({
      mensagem: 'Cliente cadastrado com sucesso!',
      idConfirmacao: jsonResponse.respostaCadastro.id,
    });

  } catch (error) {
    console.error("Erro no middleware (createCliente):", error.message);
    res.status(500).json({ error: 'Erro interno no middleware.' });
  }
};

/**
 * Endpoint: GET /api/clientes/{id} [cite: 33]
 * Consulta dados de um cliente.
 */
const getCliente = async (req, res) => {
  try {
    const { id } = req.params; // 1. Receber o ID [cite: 36]

    // 2. Gerar XML de requisição ao legado [cite: 37]
    const xmlRequest = xmlService.buildGetClienteXml(id);

    // 3. Enviar requisição ao "sistema legado" [cite: 38]
    const legacyResponse = await axios.post(LEGACY_API_URL, xmlRequest, {
      headers: { 'Content-Type': 'application/xml' },
    });

    // 4. Receber XML de resposta criptografado [cite: 39]
    const jsonResponse = await xmlService.parseXml(legacyResponse.data);

    if (jsonResponse.erro) {
        return res.status(404).json({ error: 'Cliente não encontrado no sistema legado.' });
    }

    // 5. Descriptografar os dados [cite: 39, 54]
    const encryptedCliente = jsonResponse.respostaConsulta.cliente;
    const decryptedCpf = cryptoService.decrypt(encryptedCliente.cpf);

    // 6. Montar resposta JSON para o cliente
    const clienteData = {
      id: encryptedCliente.id,
      nome: encryptedCliente.nome,
      email: encryptedCliente.email,
      cpf: decryptedCpf, // Envia o CPF descriptografado
    };

    // 7. Converter para JSON e devolver ao cliente externo [cite: 40]
    res.status(200).json(clienteData);

  } catch (error) {
    console.error("Erro no middleware (getCliente):", error.message);
    if (error.response && error.response.status === 404) {
        return res.status(404).json({ error: 'Cliente não encontrado no sistema legado.' });
    }
    res.status(500).json({ error: 'Erro interno no middleware.' });
  }
};

module.exports = {
  createCliente,
  getCliente,
};