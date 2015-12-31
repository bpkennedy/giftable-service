var Client = require('node-rest-client').Client;
client = new Client();

//Setting up nodemailer
var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'bpkennedy@gmail.com',
        pass: 'Mallorie1!'
    }
});

//example sending email with nodemailer
var mailOptions = {
    from: 'JimmehBoy ✔ <do-not-reply@gmailRekt.com>',
    to: 'brian.kennedy@wwt.com',
    subject: 'Rekt!',
    html: '<ul><li><b>Figured out how to send emails with html from nodemailer via the scriptz, woot!  But it looks like they reccomend using node-smtp-pool for nodemailer if you want to do bulk emailing.  And then they suggest RabbitMQ to queue it up!  It never ends, Le Byron!!</b></li></ul>'
};

transporter.sendMail(mailOptions, function(error, info) {
    if(error) {
        return console.log(error);
    }
    console.log('Message sent to ' + info.accepted);
});

/*
*
*   making up REST call to get events
*/

client.get("https://giftable.firebaseio.com/events.json", function(data, response){
    var dataString = data.toString('utf8');
    console.log(dataString);
});
