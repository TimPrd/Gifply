require('dotenv').config();
const Twit = require('twit')

class Bot {
    /**
     * Init the TWIT SDK
     */
    constructor() {
        this.T = new Twit({
            consumer_key: process.env.CONSUMER_KEY,
            consumer_secret: process.env.CONSUMER_SECRET,
            access_token: process.env.ACCESS_TOKEN,
            access_token_secret: process.env.ACCESS_TOKEN_SECRET,
            timeout_ms: 60 * 1000,  // optional HTTP request timeout to apply to all requests.
            strictSSL: true,     // optional - requires SSL certificates to be valid.
        })
    }

    /**
     * Set the expression in tweet to track 
     */
    set track(trackname) {
        const stream = T.stream('statuses/filter', { track: trackname });
        stream.on('tweet', this.handleStream);
    }

    /**
     * Event to trigger by stream
     * @param tweet the tweet concerned 
     */
    async handleStream(tweet) {
        const name = tweet.user.screen_name;
        const nameID = tweet.id_str;
        //get the word after the mention of the bot
        const key = tweet.text.toLowerCase().replace(/\B@\w+/g, "").trim();
        if (key) {
            try {
                // The check succeeded
                const pathToFile = `./assets/gifs/${key}.gif`
                await fs.promises.access(pathToFile);
                this.sendGif(pathToFile, name, nameID)
            } catch (error) {
                //sendDM()
                this.replyTo({ status: "@" + name, in_reply_to_status_id: nameID, })
            }
        } else {
            // Send cheh by default
            const chehGif = "./assets/gifs/cheh.gif"
            this.sendGif(chehGif, name, nameID)
        }
    }

    /**
     * Upload a gif to twitter before replying
     * @param {*} file_path the gif to upload
     * @param {*} name user name
     * @param {*} nameID tweet id
     */
    sendGif(file_path, name, nameID) {
        T.postMediaChunked({ file_path }, function (err, data, response) {
            const mediaIdStr = data.media_id_string
            const params = {
                status: "@" + name,
                in_reply_to_status_id: nameID,
                media_ids: mediaIdStr
            };
            this.replyTo(params);
        })
    }

    /**
     * Replying to a tweet
     * @param {*} params the object to send
     */
    replyTo(params) {
        T.post('statuses/update', params, function (err, data, response) {
            if (err !== undefined) {
                console.log(err);
            } else {
                console.log('Reply : ' + params.status);
            }
        })
    }

    /**
     * Post a new tweet 
     * @param status the status of the tweet
     */
    post(status) {
        this.T.post('statuses/update', { status }, function (err, data, response) {
            console.log(data)
        })
    }
}

/****** RUN *******/
const bot = new Bot();
bot.track = ['@BotDuCheh']
//bot.post("hello !!!")