const nodemailer = require('nodemailer');
const pug = require('pug');
const htmlToText = require('html-to-text')
const path = require('path');

// const sendEmail = async options => {

//     const transport = nodemailer.createTransport({
//         host: process.env.MAIL_HOST || 'sandbox.smtp.mailtrap.io',
//         port: process.env.MAIL_PORT || 2525,
//         auth: {
//             user: process.env.MAIL_USERNAME || "03b7fca6b1af5a",
//             pass: process.env.MAIL_PASSWORD || "7f5c3f521f8c9b"
//         }
//     });
    
//     const mailOptions = {
//         from: 'Admin <admin@gmail.com>',
//         to: options.email,
//         subject: options.subject,
//         text: options.message,
//         // html:
//     }

//     await transport.sendMail(mailOptions)
// }

// module.exports = sendEmail

module.exports = class Email {
    constructor(user, url) {
        this.to = user.email
        this.first_name = user.name.split(' ')[0]
        this.url = url
        this.from = `Admin <${process.env.MAIL_FROMEMAIL}>`
    }

    emailTransport() {
        if(process.env.NODE_ENV === 'production') {
            return 1
        }

        return nodemailer.createTransport({
            host: process.env.MAIL_HOST || 'sandbox.smtp.mailtrap.io',
            port: process.env.MAIL_PORT || 2525,
            auth: {
                user: process.env.MAIL_USERNAME || "03b7fca6b1af5a",
                pass: process.env.MAIL_PASSWORD || "7f5c3f521f8c9b"
            }
        })
    }

    // Send actual mail
    async send(template, subject) {
        // render pug file for email
        const html = pug.renderFile(path.join(__dirname, `../views/emails/${template}.pug`), {
            firstName: this.first_name,
            url: this.url,
            subject
        })

        const mailOptions = {
            from: this.from,
            to: this.to,
            subject,
            html,
            text: htmlToText.convert(html)
        }

        await this.emailTransport().sendMail(mailOptions)
    }

    async sendWelcome() {
        await this.send('welcome', 'Welcome to the Natours Family!')
    }
}