const email = require('nodemailer')
const q = require('q')

export function sendMail (to, subject, contenthtml) {
  let deferred = q.defer()

  let transporter = email.createTransport({
    name: 'AntrazStudios',
    host: 'cloud154.hostgator.com',
    port: 465,
    secure: true,
    auth: {
      user: 'squid@antrazstudios.com',
      pass: 'gata1125'
    }
  })

  transporter.verify((error, success) => {
    if (error) {
      console.log(error)
    } else {
      let mailOptions = {
        from: 'squid@antrazstudios.com',
        to: to,
        subject: subject,
        html: contenthtml
      }
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          deferred.reject(error)
        }
        deferred.resolve(info)
        console.log(email.getTestMessageUrl(info))
      })
    }
  })

  return deferred.promise
}
