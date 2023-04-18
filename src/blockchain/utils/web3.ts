import Web3 from 'web3'

export let provider = new Web3.providers.WebsocketProvider('http://127.0.0.1:8545', {
    reconnect: {
        auto: true,
        delay: 1000,
        onTimeout: false,
    },
    timeout: 45000,
    clientConfig: {
        maxReceivedFrameSize: 50000000000,
        maxReceivedMessageSize: 50000000000,
        keepalive: true,
        keepaliveInterval: 10000,
        dropConnectionOnKeepaliveTimeout: true,
        keepaliveGracePeriod: 30000,
    }
});
// provider.on("connect", () => {
//     console.log(`connected!`);
// });
// provider.on("reconnect", () => {
//     console.log(`reconnecting...`);
// });
// provider.on("close", () => {
//     console.log(`disconnected`);
// });
export let web3 = new Web3(provider);