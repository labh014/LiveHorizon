export let connectToSocketServer = () => {
  socketRef.current = io.connect(serverUrl, { secure: false })


  socketRef.current.on('signal', gotMessageFromServer)

  socketRef.current.on('connect', () => {
    socketRef.current.emit('join-call', window.location.href)
    socketIdRef.current = socketRef.current.id

    socketRef.current.on('chat-message', addMessage)

    socketRef.current.on('user-left', (id) => {
      setVideos((videos) => videos.filter((video) => video.socketId !== id))
    })

    socketRef.current.on('user-joined', (id, clients) => {
      clients.forEach((socketListId) => {

        connections[socketListId] = new RTCPeerConnection(peerConfigConnections)
        // Wait for their ice candidate       
        connections[socketListId].onicecandidate = function (event) {
          if (event.candidate != null) {
            socketRef.current.emit('signal', socketListId, JSON.stringify({ 'ice': event.candidate }))
          }
        }

        // Wait for their video stream
        connections[socketListId].onaddstream = (event) => {
          console.log("BEFORE:", videoRef.current);
          console.log("FINDING ID: ", socketListId);

          let videoExists = videoRef.current.find(video => video.socketId === socketListId);

          if (videoExists) {
            console.log("FOUND EXISTING");

            // Update the stream of the existing video
            setVideos(videos => {
              const updatedVideos = videos.map(video =>
                video.socketId === socketListId ? { ...video, stream: event.stream } : video
              );
              videoRef.current = updatedVideos;
              return updatedVideos;
            });
          } else {
            // Create a new video
            console.log("CREATING NEW");
            let newVideo = {
              socketId: socketListId,
              stream: event.stream,
              autoplay: true,
              playsinline: true
            };

            setVideos(videos => {
              const updatedVideos = [...videos, newVideo];
              videoRef.current = updatedVideos;
              return updatedVideos;
            });
          }
        };


        // Add the local video stream
        if (window.localStream !== undefined && window.localStream !== null) {
          connections[socketListId].addStream(window.localStream)
        } else {
          let blackSilence = (...args) => new MediaStream([black(...args), silence()])
          window.localStream = blackSilence()
          connections[socketListId].addStream(window.localStream)
        }
      })

      if (id === socketIdRef.current) {
        for (let id2 in connections) {
          if (id2 === socketIdRef.current) continue

          try {
            connections[id2].addStream(window.localStream)
          } catch (e) { }

          connections[id2].createOffer().then((description) => {
            connections[id2].setLocalDescription(description)
              .then(() => {
                socketRef.current.emit('signal', id2, JSON.stringify({ 'sdp': connections[id2].localDescription }))
              })
              .catch(e => console.log(e))
          })
        }
      }
    })
  })
}