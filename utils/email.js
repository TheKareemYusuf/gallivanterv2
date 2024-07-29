const nodemailer = require("nodemailer");
const CONFIG = require('./../config/config');
const pug = require('pug');
const { convert } = require('html-to-text');

// const htmlToText = require('html-to-text');


// const sendEmail = async (options) => {
//   const transporter = nodemailer.createTransport({
//     host: CONFIG.EMAIL_HOST,
//     port: 2525,
//     auth: {
//       user: CONFIG.EMAIL_USERNAME,
//       pass: CONFIG.EMAIL_PASSWORD,
//     },
//   }); 

//   const mailOptions = {
//     from: "Rose from Gallivanter  <hello@gallivanter.ng>",
//     to: options.email,
//     subject: options.subject,
//     text: options.message,
//     template: options.template,

//   };

//   await transporter.sendMail(mailOptions);
// };

// from: "Kareem Yusuf  <hello@gmail.com>",
class sendEmail {
  constructor(user, url, tour = {}, verificationToken) {
    this.to = user.email;
    this.firstName = user.firstName;
    this.url = url;
    this.verificationToken = verificationToken;
    this.tourTitle = tour.title;
    this.tourPrice = tour.price;
    this.currency = tour.currency;
    this.from = `Rose from Gallivanter  <hello@gallivanter.ng>`;
  }

  newTransport() {
    return nodemailer.createTransport({
      host: CONFIG.EMAIL_HOST,
      port: CONFIG.EMAIL_PORT,
      auth: {
        user: CONFIG.EMAIL_USERNAME,
        pass: CONFIG.EMAIL_PASSWORD,
      },
    });
  }

  // Send the actual email
  async send(template, subject) {
    // 1) Render HTML based on a pug template
    const templatePath = `${__dirname}/../views/emails/${template}.pug`;
    // const compiledFunction = pug.compileFile('template.pug');

    const html = pug.renderFile(templatePath, {
      firstName: this.firstName,
      url: this.url,
      verificationToken: this.verificationToken,
      subject,
      tourTitle: this.tourTitle,
      tourPrice: this.tourPrice,
      currency: this.currency,
    });

    // 2) Define email options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html: html,
      text: convert(html)
    };

    // 3) Create a transport and send email
    await this.newTransport().sendMail(mailOptions);
  }

  async sendEmailVerification() {
    await this.send('emailVerification', 'Your OTP for email verification');
  }

  async sendUserWelcome() {
    
    await this.send('userWelcome', 'Welcome to Gallivanter!');
  }

  async sendOperatorWelcome() {
    
    await this.send('operatorWelcome', 'Welcome to Gallivanter!');
  }

  async sendPasswordReset() {
    await this.send(
      'passwordReset',
      'Reset your password (valid for only 10 minutes)'
    );
  }

  async bookingConfirmation() {
    await this.send(
      'bookTour',
      'Tour Registration Confirmation'
    );
  }
};


module.exports = sendEmail