export const getDisplayMediaSuccess = (stream) => {
  try {
    window.localStream.getTracks().forEach(track => track.stop())
  }
  catch (error) {
    console.log(error)
  }
  window.localStream = stream;
  localVideoRef.current.srcObject = stream;

  for (let id in connections) {
    if (id === socketIdRef.current) continue;
    connections[id].addStream(window.localStream);
    connections[id].createOffer().then((description) => {
      connections[id].setLocalDescription(description)
        .then(() => {
          socketRef.current.emit("signal", id, JSON.stringify({ "sdp": connections[id].localDescription }), (error) => {
            if (error) {
              console.log(error);
            }
          })
        })
      // .catch(error => console.log(error))
    })

  }

  stream.getTracks().forEach(track => track.onended = () => {
    setVideo(false)
    setAudio(false)

    try {
      let tracks = localVideoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop())
    }
    catch (error) {
      console.log(error)
    }

    let blackSilence = (...args) => new MediaStream([black(...args), silence()])
    window.localStream = blackSilence();
    localVideoRef.current.srcObject = window.localStream

    getUserMedia();
  })

}