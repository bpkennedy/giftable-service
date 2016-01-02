var Firebase = require("firebase");
var myFirebaseRef = new Firebase("https://giftable.firebaseio.com/");

//Setting up nodemailer
var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'bpkennedy@gmail.com',
        pass: 'Mallorie1!'
    }
});


var today = new Date();
var users = [];

myFirebaseRef.child('users').on("value", function(snapshot) {
    users.push(snapshot.val());
    users = users[0];
});

myFirebaseRef.child('events').on("value", function(snapshot) {
    //console.log('today is ' + today);
  snapshot.forEach(function(childSnapshot){
    var key = childSnapshot.val();
    var notifyDate = new Date(key.notificationTime);
    var itemCreatedBy = key.created_by;
    var itemNotifyState = key.notification;
    //console.log(key.event_date);
    if (notifyDate <= today && itemNotifyState == 'pending') {
            console.log('match');
            var user = users[itemCreatedBy];
            mailOptions = {
                from: 'Giftable <do-not-reply@mail.com>',
                to: user.email,
                subject: 'Giftable Event Approaching',
                html: '<h3>Hey <b>' + user.displayName + '</b>!</h3><p>Looks like <b>' + key.event_title + '</b> is coming up!'
            };
            //console.log(mailOptions);
            sendEmail(mailOptions);
    } else {
        console.log('false');
    }

  });
}, function (errorObject) {
  console.log("The read failed: " + errorObject.code);
});

function sendEmail(mailOptions) {
    transporter.sendMail(mailOptions, function(error, info) {
        if(error) {
            return console.log(error);
        }
        console.log('Message sent to ' + info.accepted);
    });
}
