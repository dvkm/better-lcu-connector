process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

const child_process = require('child_process')
const WebSocket = require('ws')
const fetch = require('node-fetch')


let _connection
let handlers = []

function getConnection() {
    if (_connection != undefined) return new Promise(resolve => resolve(_connection))
    return new Promise(resolve => {
        child_process.exec("WMIC PROCESS WHERE name='LeagueClientUx.exe' GET CommandLine", (error, stdout, stderr) => {
            let token = stdout.match(/--remoting-auth-token=(.*?)"/)[1]
            let port = stdout.match(/--app-port=(.*?)"/)[1]
            _connection = { token: token, port: port }
            resolve(_connection)
        })
    })
}


class LcuConnector {
    constructor() {
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
                let payload = JSON.parse(msg)
                let [, , data] = payload
                handlers.forEach(h => {
                    if ((data.uri.startsWith(h.uri) || h.uri === '*') && (data.eventType === h.type || h.type === '*')) {
                        h.action(data.uri, data.eventType, data.data)
                    }
                })
            })

            ws.on('open', () => { ws.send('[5,"OnJsonApiEvent"]') })
        })
    }

    addHandler(uri, type, action) {
        let newHandler = { uri, type, action }
        handlers.push(newHandler)
        return newHandler
    }
}

module.exports = LcuConnector