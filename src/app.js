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
var emailsToSend = [];

myFirebaseRef.child('users').once("value", function(snapshot) {
    users.push(snapshot.val());
    users = users[0];
});

myFirebaseRef.child('events').once("value", function(snapshot) {
    //console.log('today is ' + today);
  snapshot.forEach(function(childSnapshot){
    //console.log(childSnapshot.key());
    var key = childSnapshot.val();
    var notifyDate = new Date(key.notificationTime);
    var itemCreatedBy = key.createdBy;
    var itemNotifyState = key.notification;
    //console.log(key.eventDate);
    if (notifyDate <= today && itemNotifyState == 'pending') {
            console.log('match');
            var user = users[itemCreatedBy];
            mailOptions = {
                from: 'Giftable <do-not-reply@mail.com>',
                to: user.email,
                subject: 'Giftable Event Approaching',
                html: '<h3>Hey <b>' + user.name + '</b>!</h3><p>Looks like <b>' + key.eventTitle + '</b> is coming up!'
            };
            //console.log(mailOptions);
            updateNotificationStatus(childSnapshot.key());
            emailsToSend = emailsToSend.push[1];
            sendEmail(mailOptions);

    } else {
        console.log('false');
    }

  });
}, function (errorObject) {
  console.log("The read failed: " + errorObject.code);
});

function updateNotificationStatus(firebaseItem) {
    myFirebaseRef.child('events/' + firebaseItem).update({
        "notification":"sent"
    });
}

function sendEmail(mailOptions) {
    transporter.sendMail(mailOptions, function(error, info) {
        if(error) {
            return console.log(error);
        }
        emailsToSend = emailsToSend.pop();
        console.log('Message sent to ' + info.accepted);
    });
}

//this is the only way to exit the process once we use firebase's Ref.
//Ref opens a persistent connection that keeps the process alive
//(http://stackoverflow.com/questions/27641764/how-to-destroy-firebase-ref-in-node).
//   ...definitely open to a better way!  For now, I'll check when emails are all sent
setInterval(function() {
  if (emailsToSend.length > 1 || !emailsToSend) {
      console.log('process still busy emailing, waiting another 2 seconds...');
  } else {
      process.exit();
  }
}, 2000);
