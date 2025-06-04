const WebSocket = require('ws');
const fs = require('fs');

let client = null;

const server = new WebSocket.Server({
    host: 'localhost',
    port: 8080
});


server.on('connection', (socket) => {
    client = socket;

    socket.on('message', (mssg) => {
        console.log('ОРЕНДАР:', mssg.toString());
    })
})

process.stdin.on('data', (data) => {
    client.send(data.toString().trim());
})

function getProperty(id){
    return new Promise((resolve, reject) => {
        fs.readFile('accommodation.json', 'utf8', (err, data) => {
            if (err) {
                console.error('Error reading JSON file:', err);
                return;
            }
            const accom = JSON.parse(data);
            resolve(accom[id]);
        });
    });
}

setInterval(() => {
    if (client && client.readyState === WebSocket.OPEN) {
        let info = 'Пора оплатити оренду, виставлений рахунок за місяць! ';
        getProperty(0)
            .then((accom) => {
                const accom_m2 = accom.m2;
                const accom_price = accom.price;
                const accom_payment = accom_price*accom_m2;
                client.send(info+`${accom_payment} за ${accom_m2} м^2 (${accom_price} за 1 м^2)`)
            })
            .catch(console.error)
    }
}, 40000)