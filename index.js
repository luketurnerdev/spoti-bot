const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = 1337;
const request = require('request');

const PAGE_ACCESS_TOKEN = "EAAITubGZCN4UBADc9ZAoZCLNF0nQeSZC4qmgMyOzwS6Q48N97LMJuGeu9PguOle2nXmZCdeJDlUZAnTDn6TCRS3FSZCTyBQ2jWVtBhEBN5TZBy10qcu6JX25mp5CNkK7RxWGMemCSlAmrYkfrDmhjx1vYYokTAOOYS3n3d51ki89ZAQZDZD";

app.get('/webhook', (req, res) => {
  
    const VERIFY_TOKEN = "EAAITubGZCN4UBADc9ZAoZCLNF0nQeSZC4qmgMyOzwS6Q48N97LMJuGeu9PguOle2nXmZCdeJDlUZAnTDn6TCRS3FSZCTyBQ2jWVtBhEBN5TZBy10qcu6JX25mp5CNkK7RxWGMemCSlAmrYkfrDmhjx1vYYokTAOOYS3n3d51ki89ZAQZDZD";
    let mode = req.query['hub.mode'];
    let token = req.query['hub.verify_token'];
    let challenge = req.query['hub.challenge'];

    if (mode && token) {
        if (mode === 'subscribe' && token === VERIFY_TOKEN) {
            console.log('WEBHOOK_VERIFIED');
            res.status(200).send(challenge);
        } else {
            res.sendStatus(403);
        }
    }
    
    res.sendStatus(200);
  });

app.use(bodyParser.json());
app.use(bodyParser({extended: true}));

app.get('/verification', require('./controllers/verification'));

app.listen(port, () => console.log(`Server is running on port ${port}! Congrats.`));

app.post ('/webhook', (req,res) => {
    let body = req.body;

    //checks this comes from a page subscription
    if (body.object === 'page') {
        body.entry.forEach(function(entry) {
            //Get the body of the webhook event (the message itself)
            let webhook_event = entry.messaging[0];
            console.log(webhook_event);

            //Get the sender PSID for unique verification
            let sender_psid = webhook_event.sender.id;
            console.log('Sender PSID: ' + sender_psid);

            //Check for the type of event - message or postback
            //pass the event to the appropriate handler below

            if (webhook_event.message) {
                handleMessage(sender_psid, webhook_event.message);
            } else if (webhook_event.postback){
                handlePostback(sender_psid, webhook_event.postback);
            }

        });

        res.status(200).send('EVENT_RECEIVED');
    } else {
        res.sendStatus(404);
    }
});

//Handle message events

function handleMessage(sender_psid, received_message) {
    let response;

    //Check if the message contains text.
    if (received_message.text) {

        //Create the payload for a basic text message
        response = {
            "text": `You sent the message: ${received_message}. Now send me an image!`
        }
    }

    callSendAPI(sender_psid, response);

}

//Handle message postback (reply?) events
function handlePostback(sender_psid, received, postback) {

}

//Send responses via the send API
function callSendAPI(sender_psid, response) {
    // Construct the message body
    let request_body = {
      "recipient": {
        "id": sender_psid
      },
      "message": response
    }
  
    // Send the HTTP request to the Messenger Platform
    request({
      "uri": "https://graph.facebook.com/v2.6/me/messages",
      "qs": { "access_token": PAGE_ACCESS_TOKEN },
      "method": "POST",
      "json": request_body
    }, (err, res, body) => {
      if (!err) {
        console.log('message sent!')
      } else {
        console.error("Unable to send message:" + err);
      }
    }); 
  }





//GET request test command

// curl -X GET "localhost:1337/webhook?hub.verify_token=EAAITubGZCN4UBADc9ZAoZCLNF0nQeSZC4qmgMyOzwS6Q48N97LMJuGeu9PguOle2nXmZCdeJDlUZAnTDn6TCRS3FSZCTyBQ2jWVtBhEBN5TZBy10qcu6JX25mp5CNkK7RxWGMemCSlAmrYkfrDmhjx1vYYokTAOOYS3n3d51ki89ZAQZDZD&hub.challenge=CHALLENGE_ACCEPTED&hub.mode=subscribe"