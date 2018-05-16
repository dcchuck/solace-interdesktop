let serviceRunning = false;

async function connectToSerivce () {
	const serviceClient = await fin.desktop.Service.connect({uuid:'service'});
    serviceClient.onServiceDisconnect(service=>console.log('Service disconnected!', service));
    return serviceClient;
}

const serviceApp = new fin.desktop.Application({
	name: 'service',
	url: 'http://localhost:8080/service.html',
	uuid: 'service',
	mainWindowOptions: {
		autoShow: true
	}
}, () => {
	serviceApp.run(() => {
		console.log('service running');
		connectToSerivce().then(() => {
			serviceRunning = true;
		});
	});
});

function interDesktopPublish(topic, message) {
	fin.desktop.InterApplicationBus.publish(topic, message, 
		() => {
            if (serviceRunning) {
                fin.desktop.System.getDeviceId(deviceId => {
                    connectToSerivce().then(service => {
                        service.dispatch('inter-desktop-bus', { topic: topic, message: message, deviceId: deviceId });
                    })
                })
            }
		}, (e) => {
			console.log(`Error publishing to InterAppBus: ${e}`);
		}
	);
}

// This is an arbitrary string name
const demoTopic = 'inter-desktop-channel';

const messageToSendDiv = document.getElementById('message');
const publishButton = document.getElementById('publish')

publishButton.onclick = () => {
	interDesktopPublish(demoTopic, messageToSendDiv.value);
}

const messageReceivedDiv = document.getElementById('message-received');

fin.desktop.InterApplicationBus.subscribe('*', demoTopic, (m, u, n) => {
    const stringToAddToDom = `This App Received ${m} from the App with UUID ${u}`;
    messageReceivedDiv.innerText = stringToAddToDom;
})
