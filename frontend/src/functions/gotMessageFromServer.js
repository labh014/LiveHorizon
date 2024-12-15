export let gotMessageFromServer = (fromId, message) => {
  var signal = JSON.parse(message)

  if (fromId !== socketIdRef.current) {
    if (signal.sdp) {
      connections[fromId].setRemoteDescription(new RTCSessionDescription(signal.sdp)).then(() => {
        if (signal.sdp.type === 'offer') {
          connections[fromId].createAnswer().then((description) => {
            connections[fromId].setLocalDescription(description).then(() => {
              socketRef.current.emit('signal', fromId, JSON.stringify({ 'sdp': connections[fromId].localDescription }))
            }).catch(e => console.log(e))
          }).catch(e => console.log(e))
        }
      }).catch(e => console.log(e))
    }

    if (signal.ice) {
      connections[fromId].addIceCandidate(new RTCIceCandidate(signal.ice)).catch(e => console.log(e))
    }
  }
}