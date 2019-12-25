const { debounce } = require('../utils')

function ConnectionPool() {
    this._pool = Object.create(null)
}

ConnectionPool.prototype = {
    add(id, listener) {
        if (!(this.has(id))) {
            this._pool[id] = []
        }
        this._pool[id].push(debounce(listener))
    },
    notify(id) {
        if (this.has(id)) {
            this._pool[id].forEach(fn => fn())
            return true
        }
        return false
    },
    has(id) {
        return id in this._pool
    },
    remove(id) {
        delete this._pool[id]
    },
    clear() {
        this._pool = Object.create(null)
    }
}

module.exports = new ConnectionPool()