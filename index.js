require('dotenv').config();

const Twit = require('twit')
const fs = require('fs');

const T = new Twit({
    consumer_key: process.env.CONSUMER_KEY,
    consumer_secret: process.env.CONSUMER_SECRET,
    access_token: process.env.ACCESS_TOKEN,
    access_token_secret: process.env.ACCESS_TOKEN_SECRET,
    timeout_ms: 60 * 1000,  // optional HTTP request timeout to apply to all requests.
    strictSSL: true,     // optional - requires SSL certificates to be valid.
})

const stream = T.stream('statuses/filter', { track: ['@BotDuCheh'] });
stream.on('tweet', tweetEvent);


function sendGif(file_path, name, nameID) {
    T.postMediaChunked({ file_path }, function (err, data, response) {
        const mediaIdStr = data.media_id_string
        const params = {
            status: "@" + name,
            in_reply_to_status_id: nameID,
            media_ids: mediaIdStr
        };
        replyTo(params);
    })
}


function replyTo(params) {
    T.post('statuses/update', params, function (err, data, response) {
        if (err !== undefined) {
            console.log(err);
        } else {
            console.log('Reply : ' + params.status);
        }
    })
}


async function tweetEvent(tweet) {
    const name = tweet.user.screen_name;
    const nameID = tweet.id_str;
    const regex = /\B@\w+/g
    const found = tweet.text.match(regex)[0];

    const key = tweet.text.toLowerCase().replace(/\B@\w+/g, "").trim();
    if (key) {
        try {
            const pathToFile = `./assets/gifs/${key}.gif`
            await fs.promises.access(pathToFile);
            sendGif(pathToFile, name, nameID)
            // The check succeeded
        } catch (error) {
            //sendDM()
            const params = {
                status: "@" + name,
                in_reply_to_status_id: nameID,
            };
            replyTo(params)
        }
    } else {
        const chehGif = "./assets/gifs/cheh.gif"
        sendGif(chehGif, name, nameID)
    }
}

function sendDM() {
    T.post('direct_messages/events/new', {
        event: {
            type: "message_create",
            message_create: {
                target: {
                    recipient_id: name
                },
                message_data: {
                    text: "Ce gif n'existe pas.\n Voici les mots-clefs possibles : hamster, cheh..."
                }
            }
        }
    }, (error, event) => {
        if (error) {
            console.log(error)
        }
        else {
            console.log(event);
        }
    })
}


