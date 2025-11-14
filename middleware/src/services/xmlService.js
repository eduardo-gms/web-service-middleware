const xml2js = require('xml2js');

/**
 * Constrói o XML de requisição de cadastro.
 * @param {object} data (ex: { nome, email, cpf: 'cpf-criptografado' })
 * @returns {string} String XML
 */
const buildCreateClienteXml = (data) => {
  const builder = new xml2js.Builder({ rootName: 'requisicaoCadastro' });
  return builder.buildObject({ cliente: data });
};

/**
 * Constrói o XML de requisição de consulta.
 * @param {string} id ID do cliente
 * @returns {string} String XML
 */
const buildGetClienteXml = (id) => {
  const builder = new xml2js.Builder({ rootName: 'requisicaoConsulta' });
  return builder.buildObject({ id: id });
};

/**
 * Converte uma string XML para um objeto JSON.
 * @param {string} xmlString 
 * @returns {object} Objeto JSON
 */
const parseXml = async (xmlString) => {
  // explicitArray: false simplifica o JSON de resposta
  return xml2js.parseStringPromise(xmlString, { explicitArray: false });
};

module.exports = {
  buildCreateClienteXml,
  buildGetClienteXml,
  parseXml,
};