const express = require('express');
const bodyParser = require('body-parser');
const xml2js = require('xml2js');

const app = express();
const PORT = 4000;

// Simulação de um banco de dados interno
const db = {
  clientes: {},
  idCounter: 1,
};

// Middleware para receber XML como texto puro
app.use(bodyParser.text({ type: 'application/xml' }));

// Endpoint único que processa requisições XML
app.post('/api/legado/rpc', async (req, res) => {
  console.log('Sistema Legado recebeu XML:', req.body);

  try {
    const jsonRequest = await xml2js.parseStringPromise(req.body);
    const builder = new xml2js.Builder();
    let xmlResponse;

    // Processa Cadastro [cite: 43]
    if (jsonRequest.requisicaoCadastro) {
      const clienteData = jsonRequest.requisicaoCadastro.cliente[0];
      const newId = db.idCounter++;
      
      // Armazena os dados (incluindo o CPF já criptografado)
      db.clientes[newId] = {
        id: newId,
        nome: clienteData.nome[0],
        email: clienteData.email[0],
        cpf: clienteData.cpf[0], // O legado armazena o CPF criptografado
      };

      console.log('Cliente cadastrado no legado:', db.clientes[newId]);

      xmlResponse = builder.buildObject({
        respostaCadastro: {
          status: 'sucesso',
          id: newId,
        },
      });
      
      res.header('Content-Type', 'application/xml').status(201).send(xmlResponse);
    
    // Processa Consulta [cite: 44]
    } else if (jsonRequest.requisicaoConsulta) {
      const id = jsonRequest.requisicaoConsulta.id[0];
      const cliente = db.clientes[id];

      if (!cliente) {
        xmlResponse = builder.buildObject({ erro: 'Cliente não encontrado' });
        return res.status(404).header('Content-Type', 'application/xml').send(xmlResponse);
      }

      // Retorna a resposta XML com dados (CPF continua criptografado) [cite: 45]
      xmlResponse = builder.buildObject({
        respostaConsulta: {
          cliente: cliente,
        },
      });

      console.log('Cliente consultado no legado:', cliente);
      res.header('Content-Type', 'application/xml').status(200).send(xmlResponse);

    } else {
      xmlResponse = builder.buildObject({ erro: 'Requisição XML mal formatada' });
      res.status(400).header('Content-Type', 'application/xml').send(xmlResponse);
    }

  } catch (error) {
    console.error(error);
    res.status(500).header('Content-Type', 'application/xml').send('<erro>Erro interno no legado</erro>');
  }
});

app.listen(PORT, () => {
  console.log(`[Sistema Legado Simulado] ouvindo na porta ${PORT} (aceita XML)`);
});