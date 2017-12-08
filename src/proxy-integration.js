/* eslint-disable no-unused-expressions */

import io from 'socket.io-client'
import net from 'net'
import startProxy from './proxy'

describe('WebSocket Shim', () => {
  const buffer = Uint8Array.from([1, 2, 3]).buffer
  const proxyPort = 8888
  const echoPort = 8889
  let echoServer
  let proxy

  before(() => startProxy(proxyPort)
    .then(pxy => { proxy = pxy }))

  beforeEach((done) => {
    echoServer = net.createServer(socket => socket.pipe(socket))
    echoServer.listen(echoPort, done)
  })

  afterEach((done) => {
    echoServer.close(done)
  })

  after(done => {
    proxy.close(done)
  })

  it('should send and receive data from echo server', (done) => {
    const webSocket = io(`http://localhost:${proxyPort}/`)
    webSocket.on('data', data => {
      expect(nodeBuffertoArrayBuffer(data)).to.deep.equal(buffer)
      webSocket.disconnect()
    })
    webSocket.on('disconnect', () => {
      done()
    })
    webSocket.emit('open', { host: 'localhost', port: echoPort }, hostname => {
      expect(hostname).to.exist
      webSocket.emit('data', buffer)
    })
  })
})

const nodeBuffertoArrayBuffer = buf => Uint8Array.from(buf).buffer
