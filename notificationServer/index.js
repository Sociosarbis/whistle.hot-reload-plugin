const { getServer } = require('hagent')
const sockjs = require('sockjs')
const fileWatcher = require('./fileWatcher')
const connPool = require('./pool')

const PREFIX = '/hot-reload-notify'
const msgTypes = {
    addDep: 'ADD_DEP',
    commandReload: 'COMMAND_RELOAD'
}

function ServerPort() {
    this._serverPort = 0
    this._pendingGetters = []
}

ServerPort.prototype = {
    get() {
        if (!this._serverPort) {
            return new Promise((res) => this._pendingGetters.push(res))
        } else {
            return Promise.resolve(this._serverPort)
        }
    },
    set(val) {
        this._serverPort = val
        this._pendingGetters.forEach(fn => fn(this._serverPort))
        this._pendingGetters.length = 0
    }
}

const serverPort = new ServerPort()

function createServer() {
    getServer(function (server, port) {
        const sockServer = sockjs.createServer({ prefix: PREFIX })
        sockServer.installHandlers(server)
        sockServer.on('connection', function (conn) {
            let deps = []
            conn.on('data', function (msg) {
                const { type, payload } = JSON.parse(msg)
                switch (type) {
                    case msgTypes.addDep:
                        deps.push(...payload)
                        fileWatcher.handleAddDep(payload, conn.id)
                }
            })
            connPool.add(conn.id, function () {
                conn.write(JSON.stringify({
                    type: msgTypes.commandReload
                }))
            })

        conn.on('close', function () {
            fileWatcher.handleRemoveDep(deps)
            connPool.remove(conn.id)
        })
    })


    server.on('close', function () {
        fileWatcher.teardown()
        connPool.clear()
    })
    serverPort.set(port)
    console.log(`sockjs server is listening on port: ${port}`)
})
}

module.exports = {
    sockPrefix: PREFIX,
    createServer,
    serverPort,
    msgTypes
}