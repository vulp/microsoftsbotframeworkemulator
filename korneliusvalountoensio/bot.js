const { ActivityHandler, MessageFactory } = require('botbuilder');
const nodeFetch  = require('node-fetch');
const fetch = nodeFetch.default;

class EchoBot extends ActivityHandler {
    constructor() {
        super();

        this.onMessage(async (context, next) => {
            const userMessage = context.activity.text;
            const userId = context.activity.from.id; // Get the user ID
            const backendApiUrl = 'http://localhost:8080/api/bot/receive-message';

            const response = await fetch('http://localhost:8080/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 'username':'korneliusvalountoensio', 'password':'changethisforproduction2' }),// change these and do not use for production
            });

            let jwtToken;
            if(response) {
                const data = await response.json();
                jwtToken = data.token;
            }

            try {
                const response = await fetch(backendApiUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${jwtToken}`,
                    },
                    body: JSON.stringify({ text: userMessage, userId: userId }),
                });

                if (response.ok) {
                    const responseData = await response.text();
                    console.log('Backend response:', responseData);
                    // Optionally send a confirmation to the user
                    // await context.sendActivity(MessageFactory.text(`Message sent to backend: ${userMessage}`));
                } else {
                    console.error('Failed to send message to backend:', response.status, response.statusText);
                    await context.sendActivity(MessageFactory.text('Failed to send message to the backend. Please try again later.'));
                }
            } catch (error) {
                console.error('Error sending message to backend:', error);
                await context.sendActivity(MessageFactory.text('An error occurred while sending the message to the backend.'));
            }

            //keep these for now to see that echo works
            const replyText = `Echo: ${ context.activity.text }`;
            await context.sendActivity(MessageFactory.text(replyText, replyText));
            // By calling next() you ensure that the next BotHandler is run.
            await next();
        });

        this.onMembersAdded(async (context, next) => {
            const membersAdded = context.activity.membersAdded;
            const welcomeText = 'Hello and welcome!';
            for (let cnt = 0; cnt < membersAdded.length; ++cnt) {
                if (membersAdded[cnt].id !== context.activity.recipient.id) {
                    await context.sendActivity(MessageFactory.text(welcomeText, welcomeText));
                }
            }
            // By calling next() you ensure that the next BotHandler is run.
            await next();
        });
    }
}

module.exports.EchoBot = EchoBot;
