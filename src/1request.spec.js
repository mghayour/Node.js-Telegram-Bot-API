import "babel-polyfill";
import expect from 'expect.js';
import http from 'http';

import _1request from './1request';

function expectToBePromise (obj) {
  expect(obj).to.be.an('object');
  expect(obj).to.have.property('then');
  expect(obj.then).to.be.a('function');
};

const
host = '127.0.0.1',
port = 3010,
serverUrl = `http://${host}:${port}/`
;

var server = http.createServer((req, resp) => {
  try {
    if (req.url === '/') {
      resp.writeHead(200, {'Content-Type': 'text/plain'});
      resp.end('okay');
    }
    else {
      resp.writeHead(200, {'Content-Type': 'text/plain'});
      resp.end(req.url.substr(1));
    }
  }
  catch (err) {
    console.error(err);
  }
});

describe('_1request', () => {
  before ((done) => {
    console.log(`server listen on ${port}`);
    server.listen(port, host, null, done);
  });

  after ((done) => {
    console.log('server close');
    server.close(done);
  })

  it('shoud return promise', () => {
    expectToBePromise(_1request({}));
  });

  it('shoud rejected on failed', (done) => {
    let count = 0;
    _1request({
      url: 'junk'
    })
    .then((data) => {
      throw('_1request load success !!!');
    }, (err) => {
      done();
    });
  });

  it('shoud resolved on success', (done) => {
    _1request({
      url: serverUrl
    })
    .then((data) => {
      done(data.err);
    }, (err) => {
      console.log(err);
      throw(err);
    })
    .catch((err) => {
      throw(err);
    })
    ;
  });
});