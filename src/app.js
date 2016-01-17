var Firebase = require('firebase');
var myFirebaseRef = new Firebase("https://giftable.firebaseio.com/");
//Setting up nodemailer
var nodemailer = require('nodemailer');
var moment = require('moment');

var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'giftablemail@gmail.com',
        pass: 'ThisIsStupid1!'
    }
});

var today = new Date();
var users = [];
var emailsToSend = [];
var intervalTime = 7000;

//this is the only way to exit the process once we use firebase's Ref.
//Ref opens a persistent connection that keeps the process alive
//(http://stackoverflow.com/questions/27641764/how-to-destroy-firebase-ref-in-node).
//   ...definitely open to a better way!  For now, I'll check when emails are all sent
setInterval(function() {
  if (emailsToSend.length > 0) {
      console.log('process still busy emailing, waiting another ' + (intervalTime / 1000) + ' seconds...');
  } else {
      process.exit();
  }
}, intervalTime);

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
    if (notifyDate <= today && itemNotifyState == 'pending') {
            emailsToSend.push(1);
            var user = users[itemCreatedBy];
            var eventDay = moment(key.eventDate).format("MMM, D");
            var remainingDays = calculateEventDayDistance(key.eventDate);
            mailOptions = {
                from: 'Giftable <do-not-reply@mail.com>',
                to: user.email,
                subject: 'Giftable Event Approaching',
                //html: '<h3>Hey <b>' + user.name + '</b>!</h3><p>Looks like <b>' + key.eventTitle + '</b> is coming up!'
                html: constructEmailBody(user.name, key.eventTitle, eventDay, remainingDays)
            };
            //console.log(mailOptions);
            updateNotificationStatus(childSnapshot.key());
            sendEmail(mailOptions);

    } else {
        console.log('false');
    }

  });
}, function (errorObject) {
  console.log("The read failed: " + errorObject.code);
});

function calculateEventDayDistance(eventDay) {
    var momentEventDay = moment(eventDay);
    var momentToday = moment(today);
    var difference = momentEventDay.diff(momentToday, 'days');
    console.log(difference);
    return difference+1;
}

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
        console.log('Message sent to ' + info.accepted);
        emailsToSend.pop();
    });
}

function constructEmailBody(displayName, eventTitle, eventDay, remainingDays) {
    var emailContent="";
    emailContent += "<!DOCTYPE html PUBLIC \"-\/\/W3C\/\/DTD XHTML 1.0 Transitional\/\/EN\" \"http:\/\/www.w3.org\/TR\/xhtml1\/DTD\/xhtml1-transitional.dtd\">";
    emailContent += "<html xmlns=\"http:\/\/www.w3.org\/1999\/xhtml\" style=\"font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; box-sizing: border-box; font-size: 14px; margin: 0;\">";
    emailContent += "<head>";
    emailContent += "<meta name=\"viewport\" content=\"width=device-width\" \/>";
    emailContent += "<meta http-equiv=\"Content-Type\" content=\"text\/html; charset=UTF-8\" \/>";
    emailContent += "<title>Alerts e.g. approaching your limit<\/title>";
    emailContent += "";
    emailContent += "";
    emailContent += "<style type=\"text\/css\">";
    emailContent += "img {";
    emailContent += "max-width: 100%;";
    emailContent += "}";
    emailContent += "body {";
    emailContent += "-webkit-font-smoothing: antialiased; -webkit-text-size-adjust: none; width: 100% !important; height: 100%; line-height: 1.6em;";
    emailContent += "}";
    emailContent += "body {";
    emailContent += "background-color: #f6f6f6;";
    emailContent += "}";
    emailContent += "@media only screen and (max-width: 640px) {";
    emailContent += "  body {";
    emailContent += "    padding: 0 !important;";
    emailContent += "  }";
    emailContent += "  h1 {";
    emailContent += "    font-weight: 800 !important; margin: 20px 0 5px !important;";
    emailContent += "  }";
    emailContent += "  h2 {";
    emailContent += "    font-weight: 800 !important; margin: 20px 0 5px !important;";
    emailContent += "  }";
    emailContent += "  h3 {";
    emailContent += "    font-weight: 800 !important; margin: 20px 0 5px !important;";
    emailContent += "  }";
    emailContent += "  h4 {";
    emailContent += "    font-weight: 800 !important; margin: 20px 0 5px !important;";
    emailContent += "  }";
    emailContent += "  h1 {";
    emailContent += "    font-size: 22px !important;";
    emailContent += "  }";
    emailContent += "  h2 {";
    emailContent += "    font-size: 18px !important;";
    emailContent += "  }";
    emailContent += "  h3 {";
    emailContent += "    font-size: 16px !important;";
    emailContent += "  }";
    emailContent += "  .container {";
    emailContent += "    padding: 0 !important; width: 100% !important;";
    emailContent += "  }";
    emailContent += "  .content {";
    emailContent += "    padding: 0 !important;";
    emailContent += "  }";
    emailContent += "  .content-wrap {";
    emailContent += "    padding: 10px !important;";
    emailContent += "  }";
    emailContent += "  .invoice {";
    emailContent += "    width: 100% !important;";
    emailContent += "  }";
    emailContent += "}";
    emailContent += "<\/style>";
    emailContent += "<\/head>";
    emailContent += "";
    emailContent += "<body itemscope itemtype=\"http:\/\/schema.org\/EmailMessage\" style=\"font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; -webkit-font-smoothing: antialiased; -webkit-text-size-adjust: none; width: 100% !important; height: 100%; line-height: 1.6em; background-color: #f6f6f6; margin: 0;\" bgcolor=\"#f6f6f6\">";
    emailContent += "";
    emailContent += "<table class=\"body-wrap\" style=\"font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; width: 100%; background-color: #f6f6f6; margin: 0;\" bgcolor=\"#f6f6f6\"><tr style=\"font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; margin: 0;\"><td style=\"font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; vertical-align: top; margin: 0;\" valign=\"top\"><\/td>";
    emailContent += "		<td class=\"container\" width=\"600\" style=\"font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; vertical-align: top; display: block !important; max-width: 600px !important; clear: both !important; margin: 0 auto;\" valign=\"top\">";
    emailContent += "			<div class=\"content\" style=\"font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; max-width: 600px; display: block; margin: 0 auto; padding: 20px;\">";
    emailContent += "				<table class=\"main\" width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" style=\"font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; border-radius: 3px; background-color: #fff; margin: 0; border: 1px solid #e9e9e9;\" bgcolor=\"#fff\"><tr style=\"font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; margin: 0;\"><td class=\"alert alert-warning\" style=\"font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 16px; vertical-align: top; color: #fafafa; font-weight: 500; text-align: center; border-radius: 3px 3px 0 0; background-color: #6ABB92; margin: 0; padding: 20px;\" align=\"center\" bgcolor=\"#FF9F00\" valign=\"top\">";
    emailContent += "							Heads Up!: " + remainingDays + " days until your Giftable event!";
    emailContent += "						<\/td>";
    emailContent += "					<\/tr><tr style=\"font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; margin: 0;\"><td class=\"content-wrap\" style=\"font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; vertical-align: top; margin: 0; padding: 20px;\" valign=\"top\">";
    emailContent += "							<table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" style=\"font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; margin: 0;\"><tr style=\"font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; margin: 0;\"><td class=\"content-block\" style=\"font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; vertical-align: top; margin: 0; padding: 0 0 20px;\" valign=\"top\">";
    emailContent += "										Hey " + displayName + ",";
    emailContent += "									<\/td>";
    emailContent += "								<\/tr><tr style=\"font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; margin: 0;\"><td class=\"content-block\" style=\"font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; vertical-align: top; margin: 0; padding: 0 0 20px;\" valign=\"top\">";
    emailContent += "										 You have an upcoming Giftable event.";
    emailContent += "									<\/td>";
    emailContent += "								<\/tr><tr style=\"font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; margin: 0;\"><td class=\"content-block\" style=\"font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; vertical-align: top; margin: 0; padding: 0 0 20px;\" valign=\"top\">";
    emailContent += "										<strong style=\"font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; margin: 0;\">" + eventTitle + "<\/strong> is on " + eventDay + ". You have " + remainingDays + " days to buy your gifts!";
    emailContent += "									<\/td>";
    emailContent += "								<\/tr><tr style=\"font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; margin: 0;\"><td class=\"content-block\" style=\"font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; vertical-align: top; margin: 0; padding: 0 0 20px;\" valign=\"top\">";
    emailContent += "										<a href=\"https:\/\/giftable.firebaseapp.com\" class=\"btn-primary\" style=\"font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; color: #FFF; text-decoration: none; line-height: 2em; font-weight: bold; text-align: center; cursor: pointer; display: inline-block; border-radius: 5px; text-transform: capitalize; background-color: #348eda; margin: 0; border-color: #348eda; border-style: solid; border-width: 10px 20px;\">Check it Out<\/a>";
    emailContent += "									<\/td>";
    emailContent += "								<\/tr><tr style=\"font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; margin: 0;\"><td class=\"content-block\" style=\"font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; vertical-align: top; margin: 0; padding: 0 0 20px;\" valign=\"top\">";
    emailContent += "										Thanks for using Giftable";
    emailContent += "									<\/td>";
    emailContent += "								<\/tr><\/table><\/td>";
    emailContent += "					<\/tr><\/table><div class=\"footer\" style=\"font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; width: 100%; clear: both; color: #999; margin: 0; padding: 20px;\">";
    emailContent += "					<table width=\"100%\" style=\"font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; margin: 0;\"><tr style=\"font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; margin: 0;\"><td class=\"aligncenter content-block\" style=\"font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 12px; vertical-align: top; color: #999; text-align: center; margin: 0; padding: 0 0 20px;\" align=\"center\" valign=\"top\"><a href=\"http:\/\/www.mailgun.com\" style=\"font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 12px; color: #999; text-decoration: underline; margin: 0;\">Unsubscribe<\/a> from these alerts.<\/td>";
    emailContent += "						<\/tr><\/table><\/div><\/div>";
    emailContent += "		<\/td>";
    emailContent += "		<td style=\"font-family: 'Helvetica Neue',Helvetica,Arial,sans-serif; box-sizing: border-box; font-size: 14px; vertical-align: top; margin: 0;\" valign=\"top\"><\/td>";
    emailContent += "	<\/tr><\/table><\/body>";
    emailContent += "<\/html>";
    return emailContent;
}
