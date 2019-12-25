const EventEmiter = require('events')
const path = require('path')
const util = require('util')
const chokidar = require('chokidar')
const glob = require('glob')
const connPool = require('./pool')

const BACK_SLASH_RE = /\\/g
const DOUBLE_SLASH_RE = /\/\//g

function FileWatcher(fsw) {
    EventEmiter.call(this)
    this._fsw = fsw
    this._refCount = Object.create(null)
    this._fsw.on('all', (type, path) => {
        this.onWatcherNotify(type, path)
    })
    this.ref = this.ref.bind(this)
    this.unref = this.unref.bind(this)
    this.handleAddDep = this.traversePatternFile(this.ref)
    this.handleRemoveDep = this.traversePatternFile(this.unref)
}

util.inherits(FileWatcher, EventEmiter)

FileWatcher.prototype = {
    traversePatternFile(callback) {
        return (patterns, connId) => {
            patterns.forEach((pattern) => {
                const normalizedPattern = this.normalizePattern(pattern)
                if (!normalizedPattern) return
                const files = glob.sync(normalizedPattern, { absolute: true })
                if (files.length) {
                    files.forEach((file) => {
                        callback(file, connId)
                    })
                }
            })
        }
    },
    normalizePattern(pattern) {
        return pattern.replace(DOUBLE_SLASH_RE, '/').replace(BACK_SLASH_RE, '/')
    },
    ref(file, connId) {
        if (!(file in this._refCount)) {
            this._refCount[file] = []
            this._fsw.add(file)
        }
        this._refCount[file].push(connId)
    
    },
    unref(file, connId) {
        if (file in this._refCount) {
            this._refCount[file].splice(this._refCount[file].indexOf(connId), 1)
            if (this._refCount[file].length === 0) {
                delete this._refCount[file]
                this._fsw.unwatch(file)
            }
        }
    },
    teardown() {
        this._refCount = Object.create(null)
        this._fsw.close()
    },
    onWatcherNotify(type, name) {
        if (type === 'add') {
            name = path.dirname(name)
        }
        let curPath = this.normalizePattern(path.isAbsolute(name) ? name : path.resolve(process.cwd(), name))
        let nextPath = curPath
        do {
            if (curPath in this._refCount) {
                this._refCount[curPath].forEach(connId => {
                    connPool.notify(connId)
                })
            }
            [curPath, nextPath] = [nextPath, path.dirname(curPath)]
        } while (nextPath !== curPath)
    }
}

module.exports = new FileWatcher(new chokidar.FSWatcher())