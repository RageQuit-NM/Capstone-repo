const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);

console.log('Waiting for parent process to send message')
process.on("message", function (message) {
    console.log(`Message from main.js: ${message}`);

    var cellNum = message["cellNum"];
    var body = message["body"];

    client.messages.create({
     body: body,
     from: '+13069850604',
     to: '+1' + cellNum
   })
    .then(message => console.log(message.sid));

    console.log('SMS done sending.')
});
