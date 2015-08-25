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

var util        =       require('util'),
    fs          =       require('fs'),
    tls         =       require('tls');

var kNsdControlVersion = 1;

function NsdProxy (options) {
    this.host = options.host || 'localhost';
    this.port = options.port || 8952;
    this.pemPath = options.pem;
    this.keyFile = options.key;
    if (!options.checkCert) this.checkCert = false;
    else this.checkCert = true;
}

util.inherits(NsdProxy, require('events').EventEmitter);

NsdProxy.prototype.connect = function () {
    var that = this;
    fs.readFile(that.pemPath, function (err, data) {
        if (err) {
            that.emit('error', err);
            return;
        }

        that.pem = data;

        fs.readFile(that.keyFile, function (err, data) {
            if (err) {
                that.emit('error', err);
            }

            that.key = data;

            that.socket = tls.connect(that.port, {
                host: that.host,
                port: that.port,
                key:  that.key,
                cert: that.pem,
                rejectUnauthorized: false
            }, function () {
                if (that.socket.authorized || !that.checkCert) {
                    that.socket.setEncoding('utf-8');
                    that.emit('connected', that.socket);
                } else {
                    that.emit('error', new Error('AuthorisationFailed'));
                }
            });
            that.socket.on('data', function (data) {
                that.emit('data', data);
            }).on('error', function (err) {
                console.error('An error occurred ' + err);
            }).on('end', function () {
                that.emit('end');
            }).on('close', function (did_err) {
            }).on('secureConnect', function () {
            });


        });
    });
};

NsdProxy.prototype.runCmd  = function (cmd, args) {
        if (!this.socket) {
        throw 'NsdProxyNotConnected';
    }

    var mkHeader = function () {
        var msg = "NSDCT" + kNsdControlVersion;
        return msg;
    };

    var mkMsg = function (cmd, args) {
        var msg = cmd;
        if (!args) return msg;
        args.forEach(function (a) {
            msg += ' ' + a;
        });
        return msg;
    };

    var mkTerminator = function () {
        var msg = '\n';
        return msg;
    };

    this.socket.write(mkHeader() + ' ');
    this.socket.write(mkMsg(cmd, args));
    this.socket.write(mkTerminator());
};

exports.NsdProxy = NsdProxy;

