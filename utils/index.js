function debounce(fn, delay = 200) {
    let timerId = 0
    function tick() {
        fn()
        timerId = 0
    }
    return function () {
        if (timerId) {
            clearTimeout(timerId)
        }
        timerId = setTimeout(tick, delay)
    }
}

module.exports = {
    debounce
}