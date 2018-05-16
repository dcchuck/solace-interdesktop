async function main () {
	function messageHandler (message) {
		console.log('Received message: "' + message.getBinaryAttachment() + '", details:\n' +
			message.dump());
	};

	const solaceConnection = new SolaceWSConnection({ interDesktopCommunication: true });

	solaceConnection.connect();

    function removeAppFromRegisteredApps(uuid) {
        registeredApps.forEach((el, index) => {
            if (el.uuid === uuid) {
                registeredApps.splice(index, 1);
            }
        })
    }

    const registeredApps = [];
    const service = await fin.desktop.Service.register();

    service.onConnection((id) => {
        console.log(`New Connection From App: ${id.uuid}`);
        registeredApps.push(id);
        let appToRegister = fin.desktop.Application.wrap(id.uuid);
        appToRegister.addEventListener('closed', () => removeAppFromRegisteredApps(id.uuid));
        appToRegister.addEventListener('crashed', () => removeAppFromRegisteredApps(id.uuid));
    });
    
    service.register('inter-desktop-bus', (payload) => {
        solaceConnection.publish('inter-desktop-bus', payload);
    })
}

main().then(() => console.log(`Service successfully registered`));
