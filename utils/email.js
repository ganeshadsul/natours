const nodemailer = require('nodemailer');

const sendEmail = async options => {

    const transport = nodemailer.createTransport({
        host: process.env.MAIL_HOST || 'sandbox.smtp.mailtrap.io',
        port: process.env.MAIL_PORT || 2525,
        auth: {
            user: process.env.MAIL_USERNAME || "03b7fca6b1af5a",
            pass: process.env.MAIL_PASSWORD || "7f5c3f521f8c9b"
        }
    });
    
    const mailOptions = {
        from: 'Admin <admin@gmail.com>',
        to: options.email,
        subject: options.subject,
        text: options.message,
        // html:
    }

    await transport.sendMail(mailOptions)
}

module.exports = sendEmail
