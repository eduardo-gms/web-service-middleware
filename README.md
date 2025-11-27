# Projeto: Middleware Web Service com Criptografia

## 1. Descrição do Projeto

Este projeto implementa um Web Service Middleware conforme especificado no exercício. O middleware atua como uma ponte segura entre clientes externos (que consomem REST/JSON) e um sistema legado interno (que entende apenas XML).

O middleware é responsável por:
* Expor endpoints RESTful (`/api/clientes`).
* Receber JSON, convertê-lo para XML e criptografar dados sensíveis (CPF).
* Enviar o XML seguro para o sistema legado.
* Receber XML de resposta do legado, descriptografar os dados e convertê-los para JSON.
* Retornar a resposta JSON ao cliente.

## 2. Tecnologias Utilizadas

* **Middleware:** Node.js, Express.js
* **Sistema Legado Simulado:** Node.js, Express.js
* **Cliente Externo:** Postman
* **Comunicação (Middleware -> Legado):** Axios
* **Manipulação de XML:** `xml2js`
* **Criptografia:** `crypto-js` (para AES)
* **Gerenciamento de Segredos:** `dotenv`

## 3. Passo a Passo para Executar o Projeto

Você precisará de dois terminais abertos para executar os dois servidores (Legado e Middleware).

### Terminal 1: Executar o Sistema Legado

1.  Navegue até a pasta `legacy-system`:
    ```bash
    cd legacy-system
    ```
2.  Instale as dependências:
    ```bash
    npm install
    ```
3.  Inicie o servidor legado:
    ```bash
    npm start
    ```
4.  O console deve exibir: `[Sistema Legado Simulado] ouvindo na porta 4000 (aceita XML)`

### Terminal 2: Executar o Middleware

1.  Navegue até a pasta `middleware`:
    ```bash
    cd middleware
    ```
2.  Instale as dependências:
    ```bash
    npm install
    ```
3.  (O arquivo `.env` já deve estar nesta pasta)
4.  Inicie o servidor do middleware:
    ```bash
    npm start
    ```
5.  O console deve exibir: `[Servidor Middleware] ouvindo na porta 3000 (aceita JSON)`

## 4. Exemplos de Chamadas (Postman)

Importe o arquivo `Colecao_Postman.json` no seu Postman ou use os exemplos abaixo.

**IMPORTANTE:** Todas as requisições ao Middleware precisam de autenticação. No Postman, vá na aba **Authorization**, selecione **Bearer Token** e cole o token do seu arquivo `.env`: `token_secreto_para_proteger_a_api_123`.

npx newman run Colecao_Postman.json

### 4.1. Cadastrar Cliente (POST)

* **Método:** `POST`
* **URL:** `http://localhost:3000/api/clientes`
* **Body (raw, JSON):**
    ```json
    {
      "nome": "Bruce Wayne",
      "email": "bruce@wayne.com",
      "cpf": "123.456.789-00"
    }
    ```
* **Resposta de Sucesso (JSON):**
    ```json
    {
      "mensagem": "Cliente cadastrado com sucesso!",
      "idConfirmacao": "1"
    }
    ```

### 4.2. Consultar Cliente (GET)

* **Método:** `GET`
* **URL:** `http://localhost:3000/api/clientes/1` (use o ID retornado no cadastro)
* **Resposta de Sucesso (JSON):**
    ```json
    {
      "id": "1",
      "nome": "Bruce Wayne",
      "email": "bruce@wayne.com",
      "cpf": "123.456.789-00"
    }
    ```

## 5. Relatório de Criptografia e Segurança

### 5.1. Criptografia de Dados

* **Algoritmo Usado:** **AES (Advanced Encryption Standard)**. É um algoritmo de criptografia simétrica robusto e amplamente utilizado no mercado. A implementação foi feita com a biblioteca `crypto-js`.
* **Armazenamento da Chave:** A chave simétrica (`CRYPTO_KEY`) está armazenada no arquivo `.env`. Em um ambiente de produção real, essa chave seria gerenciada por um serviço de "Secret Management" (como AWS Secrets Manager, Google Secret Manager ou HashiCorp Vault) e injetada no ambiente de execução, nunca sendo "commitada" no repositório de código.
* **Dados Criptografados:** O **CPF** do cliente é o dado sensível criptografado. Ele é criptografado antes de ser enviado ao sistema legado e permanece criptografado no banco de dados do legado. Ele só é descriptografado pelo middleware ao ser devolvido para o cliente externo.

### 5.2. Segurança da Comunicação

* **Autenticação:** Foi implementada autenticação via **Bearer Token** (API Key). O middleware valida o token em todas as requisições no cabeçalho `Authorization` antes de processá-las.
* **HTTPS (SSL/TLS):** Este ambiente de desenvolvimento roda em HTTP. Em **produção**, a configuração de HTTPS seria feita no "entrypoint" da aplicação (o balanceador de carga ou proxy reverso).
    * **Explicação da Configuração em Produção:** O servidor Node.js/Express não lidaria diretamente com o certificado SSL. Em vez disso, usaríamos um **Proxy Reverso** (como NGINX ou um Application Load Balancer na nuvem). O NGINX/Load Balancer receberia a requisição do cliente em HTTPS (porta 443), faria a terminação do SSL (descriptografaria a requisição usando o certificado) e, em seguida, encaminharia a requisição para o servidor Node.js localmente (na porta 3000) via HTTP. Isso é mais performático e seguro.