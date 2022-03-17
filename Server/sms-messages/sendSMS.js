const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);

console.log('Waiting for parent process to send cell# message')
process.on("message", function (message) {
    console.log(`Message from main.js: ${message}`);

    var cellNum = message["cellNum"];
    var body = message["body"];

    client.messages.create({
     body: body + " " + cellNum,
     from: '+13069850604',
     to: '+13066202479'
   })
    .then(message => console.log(message.sid));

    console.log('SMS done sending.')
});
