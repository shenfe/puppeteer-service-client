require('isomorphic-fetch');

const ObjectStringify = require('./stringify');

const io = require('socket.io-client')();

const Url = require('url-parse');

io.on('connection', function (socket) {
    console.log('connection');
    socket.on('disconnect', function () {
        console.log('disconnect');
    });
    socket.on('server:echo', function (data) {
        console.log('server:echo', data);
    });
});

const generateSessionId = () => {
    return String(+new Date()) + '_' + String(Math.random()).substr(2, 4);
};

const PSC = function (url, data = {}, options = {}) {
    if (!(this instanceof PSC)) return new PSC(...arguments);

    const apiUrl = new Url(url);
    const domain = `${apiUrl.protocol}//${apiUrl.host}`;

    const sessId = generateSessionId();

    const sockOpt = data.socket || options.socket;
    if (data.hasOwnProperty('socket')) delete data.socket;
    const ifUseSocket = !!sockOpt;
    let socket = ifUseSocket && io.connect(domain + '/' + sessId);
    this.socket = socket;
    socket && (typeof sockOpt === 'function') && socket.on('server:echo', sockOpt);

    const re = fetch(url, {
        method: 'POST',
        mode: 'cors',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
        },
        ...options,
        body: JSON.stringify({
            sessId,
            socket: ifUseSocket && socket.id,
            data: ObjectStringify(data)
        })
    }).then(res => {
        if (res.ok) return res.json();
        throw new Error('Response is not ok');
    });

    return re;
};

module.exports = PSC;
