import path from 'path';
import nodemailer from 'nodemailer';
import hbs from 'nodemailer-express-handlebars';

export async function sendEmail(
  to: string,
  subject: string,
  template: string,
  res?: any
) {
  const transport = nodemailer.createTransport({
    host: '',
    port: 2525,
    auth: {
      user: '',
      pass: '',
    },
  });

  transport.use(
    'compile',
    hbs({
      viewEngine: 'express-handlebars',
      viewPath: path.resolve(__dirname, '../../views/'),
    })
  );

  const msg = {
    from: 'no-reply@testemail.com.br',
    to: to,
    subject: subject,
    template: template,
    context: {
      code: res,
    },
    attachments: res.attachments ?? null,
  };

  await transport.sendMail(msg, function (err) {
    if (err) {
      console.log(err.message);
    } else {
      console.log('Email enviado');
    }
  });
}
