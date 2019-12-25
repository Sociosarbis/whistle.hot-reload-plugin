const { serverPort, sockPrefix, msgTypes } = require('./index') 

function generateHotLoadClientScript(strPattern) {
    const arrPattern = strPattern.split(',')
    return serverPort.get().then((port) => {
        return `(function () {
            const ws = new WebSocket('ws://127.0.0.1:${port}${sockPrefix}/websocket')
            ws.addEventListener('open', function () {
                ws.send(JSON.stringify({
                    type: "${msgTypes.addDep}",
                    payload: ${JSON.stringify(arrPattern)}
                }))
            })
            ws.addEventListener('message', function (e) {
                const { type } = JSON.parse(e.data)
                if (type === "${msgTypes.commandReload}") {
                    window.location.reload()
                }
            })
        })()`
    })
}

module.exports = {
    generateHotLoadClientScript
}