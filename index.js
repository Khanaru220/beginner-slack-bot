// (!) ngrok will change public URL everytime we rerun node. --> require update on Slack App's request URL
require('dotenv').config();

const axios = require('axios').default;
const { App } = require('@slack/bolt'); // handle 'challenge' [hostname]/slack/events
const ngrok = require('ngrok');

const signingSecret = process.env['SLACK_SIGNING_SECRET'];
const botToken = process.env['SLACK_BOT_TOKEN'];
const app = new App({
	signingSecret: signingSecret,
	token: botToken,
});

const port = 8080 || process.env.PORT;

// ID of the channel you want to send the message to
const channelSpeakId = 'speak-room'; // C05GH9FHUKE

const sendMessage = async () => {
	try {
		// Call the chat.postMessage method using the WebClient
		const result = await app.client.chat.postMessage({
			channel: channelSpeakId,
			text: 'Hello world',
		});

		console.log(result);
	} catch (error) {
		console.error(error);
	}
};

(async () => {
	await app.start(port);
	const url = await ngrok.connect({
		addr: port,
		authtoken: process.env.NGROK_AUTH_TOKEN,
	});
	console.log(url + '/slack/events');

	app.message('quote', async ({ message, say }) => {
		let resp = await axios.get(`https://api.quotable.io/random`);
		console.log(message);
		const quote = resp.data.content;
		// @ts-ignore
		await say(`Hello, <@${message.user}>, ${quote}`);
	});

	console.log(`⚡️ Bolt app is running!`);
})();
