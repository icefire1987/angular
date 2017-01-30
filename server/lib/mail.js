/**
 * Created by Chris on 17.11.16.
 */
var mailer = require("nodemailer");
var templateEngine = require("email-templates").EmailTemplate;

var smtpConfig_main = {
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: 'christopher.jurthe@zuumeo.com',
        pass: 'ChJu2009'
    }
};
var smtpConfig_custom = {
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth:{user:"",pass:""}
};

var transporter = mailer.createTransport(smtpConfig_main);

module.exports = {
    sendMail : function(maildata){

        var templateURL = maildata.templateurl || {directory:'default',file:'html.handlebars'};

        var send = transporter.templateSender(
            new templateEngine('template/mail/'+templateURL.directory),
            {
               from: 'Luigi<luigi@zuumeo-studio.com>'
            });

        return send(maildata.body.mailHeader,maildata.body.mailBody);
    }
}