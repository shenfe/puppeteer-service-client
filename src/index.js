require('isomorphic-fetch');

const ObjectStringify = require('./stringify');

const io = require('socket.io-client');

const Url = require('url-parse');

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
    let socket = ifUseSocket && io(domain + '/' + sessId);
    this.socket = socket;

    const thenDo = sockId => fetch(url, {
        method: 'POST',
        mode: 'cors',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
        },
        ...options,
        body: JSON.stringify({
            sessId,
            sockId,
            data: ObjectStringify(data)
        })
    }).then(res => {
        if (res.ok) return res.json();
        throw new Error('Response is not ok');
    });
    
    if (socket) {
        return new Promise((resolve, reject) => {
            socket.on('connect', () => {
                console.log('connect', socket.id);
                resolve(socket.id);
            });
            socket.on('disconnect', () => {
                console.log('disconnect');
            });
            if (typeof sockOpt === 'function') {
                socket.on('server:echo', sockOpt);
            }

            const timeout = 2000;
            setTimeout(() => reject('timeout'), timeout);
        }).then(thenDo);
    } else {
        return thenDo();
    }
};

module.exports = PSC;
