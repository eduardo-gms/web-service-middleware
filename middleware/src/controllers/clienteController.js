const axios = require('axios');
const cryptoService = require('../services/cryptoService');
const xmlService = require('../services/xmlService');

// URL FIXA DO LEGADO
const LEGACY_API_URL = "http://localhost:4000/api/legado/rpc";

const createCliente = async (req, res) => {
  try {
    const { nome, email, cpf } = req.body;

    // 1. Validação básica [cite: 26]
    if (!nome || !email || !cpf) {
      return res.status(400).json({ error: 'Campos obrigatórios ausentes.' });
    }

    // 2. Criptografia [cite: 28, 53]
    const encryptedCpf = cryptoService.encrypt(cpf);

    // 3. Conversão para XML [cite: 27]
    const xmlRequest = xmlService.buildCreateClienteXml({
      nome,
      email,
      cpf: encryptedCpf 
    });

    // 4. Envio ao Legado
    const legacyResponse = await axios.post(LEGACY_API_URL, xmlRequest, {
      headers: { 'Content-Type': 'application/xml' },
    });

    // 5. Tratamento da Resposta
    const jsonResponse = await xmlService.parseXml(legacyResponse.data);
    
    res.status(201).json({
      mensagem: 'Sucesso',
      idConfirmacao: jsonResponse.respostaCadastro.id,
    });

  } catch (error) {
    console.error("Erro:", error.message);
    res.status(500).json({ error: 'Erro interno.' });
  }
};

const getCliente = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Requisição ao legado
    const xmlRequest = xmlService.buildGetClienteXml(id);
    const legacyResponse = await axios.post(LEGACY_API_URL, xmlRequest, {
      headers: { 'Content-Type': 'application/xml' },
    });

    const jsonResponse = await xmlService.parseXml(legacyResponse.data);

    if (jsonResponse.erro) {
        return res.status(404).json({ error: 'Cliente não encontrado.' });
    }

    // Descriptografia [cite: 39, 54]
    const encryptedCliente = jsonResponse.respostaConsulta.cliente;
    const decryptedCpf = cryptoService.decrypt(encryptedCliente.cpf);

    res.status(200).json({
      id: encryptedCliente.id,
      nome: encryptedCliente.nome,
      email: encryptedCliente.email,
      cpf: decryptedCpf // CPF volta legível aqui
    });

  } catch (error) {
    if (error.response && error.response.status === 404) {
        return res.status(404).json({ error: 'Cliente não encontrado.' });
    }
    res.status(500).json({ error: 'Erro interno.' });
  }
};

module.exports = { createCliente, getCliente };