process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

const cp = require('child_process');
const WebSocket = require('ws')
const fetch = require('node-fetch')

let _connection

let handlers = []
const IS_WIN = process.platform === 'win32';
const IS_MAC = process.platform === 'darwin';

// console.log = log.log;

function getConnection() {
    if (_connection != undefined) return new Promise(resolve => resolve(_connection))
    return new Promise((resolve, reject) => {
        const INSTALL_REGEX_WIN = /"--install-directory=(.*?)"/;
        const INSTALL_REGEX_MAC = /--install-directory=(.*?)( --|\n|$)/;
        const INSTALL_REGEX = IS_WIN ? INSTALL_REGEX_WIN : INSTALL_REGEX_MAC;
        const command = IS_WIN ?
            `WMIC PROCESS WHERE name='LeagueClientUx.exe' GET commandline` :
            `ps x -o args | grep 'LeagueClientUx'`;

        cp.exec(command, (err, stdout, stderr) => {
            if (err) {
                reject(err);
                return;
            }

            if (!stdout) {
                reject(new Error("Invalid stdout: " + stdout));
                return;
            }
            try {
                let token = stdout.match(/--remoting-auth-token=([^ "]*)/)[1]
                let port = stdout.match(/--app-port=([^ "]*)/)[1]
                _connection = { token: token, port: port }
                resolve(_connection);
            } catch (TypeError) {
                reject(new Error("League is probably not on"));
                return;
            }
        })
    })
}


class LcuConnector {
    constructor() {

        let onPlayerStatusChange = () => { }
        let onFriendStatusChange = () => { }
        
        this.events = { onPlayerStatusChange, onFriendStatusChange }

        this.addHandler('/lol-chat/v1/me', '*', (uri, type, data) => { this.events.onPlayerStatusChange(data) })
        this.addHandler('/lol-chat/v1/friends/', '*', (uri, type, data) => { this.events.onFriendStatusChange(data.name, data) })
    }

    makeRequest(method, endpoint, data) {
        return new Promise(result => {

            getConnection().then(connection => {
                let body
                if (data && (method !== 'GET' && method !== 'DELETE')) body = data
                fetch(`https://127.0.0.1:${connection.port}${endpoint}`, {
                    body: body,
                    method: method,
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Basic ' + Buffer.from('riot:' + connection.token).toString('base64')
                    }
                }).then(res => {
                    return res.json()
                }).then(json => {
                    return result(json)
                })
            })

        })
    }

    listen() {
        getConnection().then(connection => {
            const ws = new WebSocket(`wss://riot:${connection.token}@127.0.0.1:${connection.port}`, 'wamp')
            ws.on('message', function incoming(msg) {
                if (msg.endsWith('RiotRemoting"]')) return
                const [, , data] = JSON.parse(msg)
                handlers.forEach(h => {
                    if ((data.uri.startsWith(h.uri) || h.uri === '*') && (data.eventType.toLowerCase() === h.type.toLowerCase() || h.type === '*')) {
                        h.action(data.uri, data.eventType, data.data)
                    }
                })
            })

            ws.on('open', () => { ws.send('[5,"OnJsonApiEvent"]') })
            ws.on('close', () => { 
                console.log("League closed. Restarting listener.");
                _connection = undefined; // Resetting connection.
                new Promise(r => setTimeout(r, 3000))
                .then(() => {
                    this.listen(); // Start all over again
                });
            })
            ws.on('error', (err) => {
                    console.log("Websocket error:", err);
                    ws.close();
            })
        })
        .catch(err => {
            console.log("Error:", err.message);
            new Promise(r => setTimeout(r, 3000))
            .then(() => {
                this.listen();
            });       
        });
    }

    addHandler(uri, type, action) {
        let newHandler = { uri, type, action }
        handlers.push(newHandler)
        return newHandler
    }

}

module.exports = LcuConnector