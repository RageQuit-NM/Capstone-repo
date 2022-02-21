const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);

console.log('Twilio test message is running...')


client.messages
  .create({
     body: 'Hi this is a test message from twilio, sent by yours truly.',
     from: '+13069850604',
     to: '+13066202479'
   })
    .then(message => console.log(message.sid));

console.log('Twilio test message done sending.')
