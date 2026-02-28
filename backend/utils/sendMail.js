const nodemailer = require('nodemailer');

const sendMail = async (to, subject, html) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'rpmssvecw@gmail.com',
      pass: 'opdh fgkm seaa qsvy'
    }
  });

  await transporter.sendMail({
    from: 'Research Paper System <tanusreekollipara@gmail.com>',
    to,
    subject,
    html   // ✅ FIXED (was text)
  });
};

module.exports = sendMail;

// const nodemailer = require('nodemailer');

// const sendMail = async (to, subject, text) => {
//   const transporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//       user: 'tanusreekollipara@gmail.com',
//       pass: 'wtes romt gffu boib' // NOT normal gmail password
//     }
//   });

//   await transporter.sendMail({
//     from: 'Research Paper System <yourprojectmail@gmail.com>',
//     to,
//     subject,
//     text
//   });
// };

// module.exports = sendMail;
