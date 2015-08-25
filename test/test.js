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

var util =      require('util');

var nsd =       require('../lib/nsdcmd');

var nameserver = nsd.nsd('localhost', 8952,
    '/opt/local/etc/nsd/nsd_control.pem',
    '/opt/local/etc/nsd/nsd_control.key',
    false);

var resultProcess = function (err, resp) {
    if (err) {
        console.log(util.inspect(err));
        return;
    }
    console.log(util.inspect(resp));
};

nameserver.reload(null, resultProcess);

nameserver.reconfig(resultProcess);

nameserver.status(resultProcess);

nameserver.stats(resultProcess);

nameserver.stats_noreset(resultProcess);

nameserver.addzone('test.com', 'pdns', resultProcess);

nameserver.delzone('test.com', resultProcess);

nameserver.write('test.com', resultProcess);

nameserver.notify('test.com', resultProcess);

nameserver.transfer('test.com', resultProcess);

nameserver.force_transfer('test.com', resultProcess);

nameserver.zonestatus('test.com', resultProcess);

