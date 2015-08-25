/*
 * Copyright (c) 2015 Alan Brown <alan.w.brown@me.com>
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

'use strict';

var nsdproxy = require('./nsd');

var executeNsdRpc = function (host, port, pem, key, checkcert, cmd, args, callback) {
    var proxy = new nsdproxy.NsdProxy({
        host: host,
        port: port,
        pem:  pem,
        key:  key,
        checkCert: checkcert
    });


    proxy.on('connected', function (socket) {
        var rx_data = '';

        proxy.on('error', function (err) {
            callback(err, null);
        });

        proxy.on('data', function (data) {
            rx_data += data;
        });

        proxy.on('end', function () {
            callback(null, rx_data);
        });


        proxy.runCmd(cmd, args);

    }).connect();
};

var parserFactory = function (splitCharacter, callback) {
    return (function (err, data) {
                    if (err) {
                        callback(err, null);
                        return;
                    }
                    var datalines = data.trim().split('\n'),
                              obj = [];
                    if (splitCharacter === 'ok') {
                        if (datalines.indexOf('ok') !== -1) {
                            callback(null, {status: 'ok'});
                            return;
                        } else {
                            var errormsg = data.trim();
                            callback(new Error(errormsg), null);
                            return;
                        }
                    }
                    datalines.forEach(function (l, idx) {
                        var elementbits = l.split(splitCharacter);
                        var element = {};
                        element[elementbits[0]] = elementbits[1];
                        obj.push(element);
                    });
                    callback(null, obj);
                });
};

var nsd = function (host, port, pem, key, checkcert) {
    return {
        reload: function (zone, callback) {
            var args;
            if (zone) {
                args = [zone];
            } else {
                args = null;
            }
            executeNsdRpc(host, port, pem, key, checkcert,
                'reload', args, parserFactory('ok', callback));
        },
        reconfig: function (callback) {
            executeNsdRpc(host, port, pem, key, checkcert,
                'reconfig', null, parserFactory('ok', callback));
        },
        log_reopen: this.reconfig,
        status: function (callback) {
            executeNsdRpc(host, port, pem, key, checkcert,
                'status', null, parserFactory(':', callback));
        },
        stats: function (callback) {
            executeNsdRpc(host, port, pem, key, checkcert,
                'stats', null, parserFactory('=', callback));
        },
        stats_noreset: function (callback) {
            executeNsdRpc(host, port, pem, key, checkcert,
                'stats_noreset', null, parserFactory('=', callback));
        },
        addzone: function (zone_name, pattern_name, callback) {
            var args = [zone_name, pattern_name];
            executeNsdRpc(host, port, pem, key, checkcert,
                'addzone', args, parserFactory('ok', callback));
        },
        delzone: function (zone_name, callback) {
            var args = [zone_name];
            executeNsdRpc(host, port, pem, key, checkcert,
                'addzone', args, parserFactory('ok', callback));
        },
        write: function (zone, callback) {
            var args = null;
            if (typeof(zone) === 'function') {
                callback = zone;
            } else {
                args = [zone];
            }
            executeNsdRpc(host, port, pem, key, checkcert,
                'write', args, parserFactory('ok', callback));
        },
        notify: function (zone, callback) {
            var args = null;
            if (typeof(zone) === 'function') {
                callback = zone;
            } else {
                args = [zone];
            }
            executeNsdRpc(host, port, pem, key, checkcert,
                'notify', args, parserFactory('ok', callback));
        },
        transfer: function (zone, callback) {
            var args = null;
            if (typeof(zone) === 'function') {
                callback = zone;
            } else {
                args = [zone];
            }
            executeNsdRpc(host, port, pem, key, checkcert,
                'transfer', args, parserFactory('ok', callback));
        },
        force_transfer: function (zone, callback) {
            var args = null;
            if (typeof(zone) === 'function') {
                callback = zone;
            } else {
                args = [zone];
            }
            executeNsdRpc(host, port, pem, key, checkcert,
                'force_transfer', args, parserFactory('ok', callback));
        },
        zonestatus: function (zone, callback) {
            var args = null;
            if (typeof(zone) === 'function') {
                callback = zone;
            } else {
                args = [zone];
            }
            executeNsdRpc(host, port, pem, key, checkcert,
                'zonestatus', args, parserFactory('ok', callback));
        }
    };
};

module.exports.nsd = nsd;

