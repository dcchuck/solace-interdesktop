/* global solace, sessionProperties */

// Initializing version 10 of their API

const factoryProps = new solace.SolclientFactoryProperties();
factoryProps.profile = solace.SolclientFactoryProfiles.version10;
solace.SolclientFactory.init(factoryProps);
solace.SolclientFactory.setLogLevel(solace.LogLevel.DEBUG);

// TODO make INTRA

class SolaceWSConnection {
	constructor(config) {
        this.session = null;
        this.interDesktopCommunication = config.interDesktopCommunication;
	}

	connect() {
		if (this.session !== null) {
			this.log('Already Connected');
			return
		}

		try {
			this.session = solace.SolclientFactory.createSession(sessionProperties);
		} catch (e) {
			this.log(e.toString());
		}

		this.session.on(solace.SessionEventCode.UP_NOTICE, e => {
            this.log('Successful Connection.');
            console.log(this.interDesktopCommunication)
            if (this.interDesktopCommunication) {
                this.connectToInterDesktopCommunication();
            }
		})

		this.session.on(solace.SessionEventCode.CONNECT_FAILED_ERROR, e => {
			this.log(`Connection Error: ${e.infoStr}`);
		})

		this.session.on(solace.SessionEventCode.CONNECT_FAILED_ERROR, e => {
			this.log('Disconnected');
			if (this.session !== null) {
				this.session.dispose();
				this.session = null;
			}
		});

        this.session.connect();
	}

	log (message) {
		console.log(message);
	}


	/**
	 * @param {string} topic
	 * @param {object} message
	 */

	publish(topic, message) {
		this.log('publishing');
		if (this.session === null) {
			this.log('No Connected, Connection is required to publish');
			return;
		}

		const messageString = JSON.stringify(message);

		const solaceMessage = solace.SolclientFactory.createMessage();
		solaceMessage.setDestination(solace.SolclientFactory.createTopicDestination(topic));
		solaceMessage.setBinaryAttachment(messageString);
		solaceMessage.setDeliveryMode(solace.MessageDeliveryModeType.DIRECT);
		this.log(`Sending ${messageString}`);
		try {
			this.session.send(solaceMessage);
			this.log(`Successfully Published ${messageString}`);
		} catch (e) {
			this.log(e.toString());
		}
    }
    
    /**
     * @param {string} topic
     * @param {function} messageHandler
     */

	subscribe(topic, messageHandler) {
		if (this.session === null) {
			this.log('Not Connected, Connection is required to subscribe');
			return;
        }

        this.session.on(solace.SessionEventCode.MESSAGE, messageHandler);

		this.log('subscribing');

		try {
			this.session.subscribe(
				solace.SolclientFactory.createTopicDestination(topic),
				true,
				10000
			)
		} catch (e) {
			this.log(e.toString());
		}
	}

	connectToInterDesktopCommunication() {
        console.log('Connected to InterDesktop Communication')
		function messageHandler(message) {
			const translatedMessage = JSON.parse(message.getBinaryAttachment());
            console.log(`Recieved Message: ${translatedMessage}`);
            fin.desktop.System.getDeviceId(deviceId => {
                if (translatedMessage.deviceId !== deviceId) {
                    fin.desktop.InterApplicationBus.publish(translatedMessage.topic, translatedMessage.message);
                }
            })
		}
		this.subscribe('inter-desktop-bus', messageHandler);
	}

}
