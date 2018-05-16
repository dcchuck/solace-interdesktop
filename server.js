const express = require('express');
const app = express();
const path = require('path');
const openfinLauncher = require('openfin-launcher');

const publicDirectory = path.join(__dirname, 'public');

const configPath = path.resolve('public/app.json');

app.use(express.static(publicDirectory));

const port = process.env.PORT || 8080;

app.listen(port, () => {
    console.log(`Serving ${publicDirectory} on ${port}`);
    openfinLauncher.launchOpenFin({ configPath }).then(() => {
        process.exit()
    });
});
