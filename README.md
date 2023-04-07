## IMPORTANTE

Lembrar de dar os seguintes comandos:

`npx prisma migrate dev`

`npx prisma generate`

Abrir a pasta de scripts e rodá-los no banco.

Instalar dependências:
`yarn install`

Para rodar:
`yarn dev`

## BIBLIOTECAS

O projeto está configurado com as seguintes bibliotecas:

- express
- jsonwebtoken
- nodemailer
- pdfmake
- prisma

## ENDPOINTS

O projeto utiliza-se da estrutura Borse 2.0, buscando uma orientação modular, na qual pode-se encontrar as rotas, controller, useCases e as queries.

### Tratamento de erros

Fácil de ser utilizado, bastando o seguinte comando:<br/>
`throw new AppError('Mensagem', StatusCodes.<CÓDIGO DO ERRO>);`<br/>
Em caso de sucesso:<br/>
`response.status(StatusCodes.OK).json(res);`
