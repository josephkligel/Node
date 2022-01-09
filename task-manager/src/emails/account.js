const sgMail = require('@sendgrid/mail')

const sendGridApiKey = process.env.SENDGRID_API_KEY

sgMail.setApiKey(sendGridApiKey);

const sendWelcomeEmail = (email, name) => {
  sgMail.send({
    to: email,
    from: 'jkligel@gmail.com',
    subject: 'Welcome to the app!',
    text: `Welcome to the app, ${name}. Please let me know how you get along with the app.`
  })
}

const sendGoodbyeEmail = (email, name) => {
  sgMail.send({
    to: email,
    from: 'jkligel@gmail.com',
    subject: 'Au revoir, my friend',
    text: `I am sorry to see you go, ${name}. Please let me know if I could have done anything to improve your experience.`
  })
}

module.exports = {
  sendWelcomeEmail,
  sendGoodbyeEmail
}
