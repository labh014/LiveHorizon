import React, { useState, useRef, useEffect } from 'react'

import io from "socket.io-client";
import styles from '../style/videoCall.module.css'
import { useNavigate } from 'react-router-dom';
import LobbyPage from './LobbyPage';
import server from '../../environment.js';
import Controls from './VideoCall/Controls';
import VideoGrid from './VideoCall/VideoGrid';
import ChatPanel from './VideoCall/ChatPanel';



const serverUrl = server;


var connections = {};
const peerConfigConnections = {
  "iceServers": [
    { "urls": "stun:stun.l.google.com:19302" }
  ]
}

function VideoCall() {
  var socketRef = useRef();
  var socketIdRef = useRef();
  let localVideoRef = useRef();

  let [videoAvailable, setVideoAvailable] = useState(true);
  let [audioAvailable, setAudioAvailable] = useState(true);
  let [video, setVideo] = useState();
  let [audio, setAudio] = useState();
  let [screen, setScreen] = useState();
  let [model, setModel] = useState(true);
  let [screenAvailable, setScreenAvailable] = useState();
  let [message, setMessage] = useState("");
  let [messages, setMessages] = useState([]);
  let [newMessages, setNewMessages] = useState(0);
  let [askForUsername, setAskForUsername] = useState(true);
  let [username, setUsername] = useState("");
  let [videos, setVideos] = useState([]);
  const videoRef = useRef([]);
  const [isChatVisible, setIsChatVisible] = useState(false);

  const getPermissions = async () => {
    try {
      const videoPermission = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoPermission) {
        setVideoAvailable(true);
        // stop temp tracks used only for permission check
        videoPermission.getTracks().forEach(track => track.stop());
      } else {
        setVideoAvailable(false);
      }

      const audioPermission = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (audioPermission) {
        setAudioAvailable(true);
        // stop temp tracks used only for permission check
        audioPermission.getTracks().forEach(track => track.stop());
      } else {
        setAudioAvailable(false);
      }

      if (navigator.mediaDevices.getDisplayMedia) setScreenAvailable(true);
      else setScreenAvailable(false);

      if (videoAvailable || audioAvailable) {
        const userMediaStream = await navigator.mediaDevices.getUserMedia({ video: videoAvailable, audio: audioAvailable });
        if (userMediaStream) {
          window.localStream = userMediaStream;
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = userMediaStream;
          }
        }
      }

    }
    catch (err) {
      console.log(err)
    }
  }

  useEffect(() => {
    getPermissions();
    return () => {
      // cleanup on unmount
      cleanupMediaAndConnections();
    }
  }, []);

  // Ensure self preview binds when entering the call view
  useEffect(() => {
    if (!askForUsername && window.localStream && localVideoRef.current) {
      localVideoRef.current.srcObject = window.localStream;
    }
  }, [askForUsername]);

  const getUserMediaSuccess = (stream) => {
    try {
      if (window.localStream) {
        window.localStream.getTracks().forEach(track => track.stop())
      }
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
        const src = localVideoRef.current && localVideoRef.current.srcObject
        if (src && src.getTracks) {
          let tracks = src.getTracks();
          tracks.forEach(track => track.stop())
        }
      } catch (error) {
        console.log(error)
      }

      let blackSilence = (...args) => new MediaStream([black(...args), silence()])
      window.localStream = blackSilence();
      localVideoRef.current.srcObject = window.localStream

      for (let id in connections) {
        connections[id].addStream(window.localStream)
        connections[id].createOffer().then((description) => {
          connections[id].setLocalDescription(description)
            .then(() => {
              socketRef.current.emit("signal", id, JSON.stringify({ "sdp": connections[id].localDescription }))
            })
            .catch(error => console.log(error))
        })
      }
    })
  }

  let silence = () => {
    let ctx = new AudioContext();
    let oscillator = ctx.createOscillator();

    let dst = oscillator.connect(ctx.createMediaStreamDestination());

    oscillator.start();
    ctx.resume();
    return Object.assign(dst.stream.getAudioTracks()[0], { enabled: false })
  }

  let black = ({ width = 600, height = 400 } = {}) => {
    let canvas = Object.assign(document.createElement("canvas"), { width, height })
    canvas.getContext("2d").fillRect(0, 0, width, height);
    let stream = canvas.captureStream();
    return Object.assign(stream.getVideoTracks()[0], { enabled: false })
  }

  const getUserMedia = () => {
    if (video && videoAvailable || audio && audioAvailable) {
      navigator.mediaDevices.getUserMedia({ video: video, audio: audio })
        .then(getUserMediaSuccess)
        .then((stream) => { })
        .catch((error) => console.log(error))
    }
    else {
      try {
        let tracks = localVideoRef.current.srcObject.getTracks();
        tracks.forEach(track => track.stop());
      }
      catch (error) {
        console.log(error);
      }
    }
  }

  

  useEffect(() => {
    if (video !== undefined && audio !== undefined) getUserMedia();
  }, [audio, video]);

  useEffect(() => {
    console.log("Updated videos:", videos);
  }, [videos]);


  const addMessage = (data, sender, socketIdSender) => {
    // Skip duplicate echo of my own message (we already add it optimistically)
    if (socketIdSender === socketIdRef.current) {
      return;
    }
    setMessages((prevMessages) => [...prevMessages, { data, sender }])
    if (socketIdSender !== socketIdRef.current) {
      setNewMessages((prevMessages) => prevMessages + 1)
    }
    if (!isChatVisible) setIsChatVisible(true);
  }
  

  let gotMessageFromServer = (fromId, message) => {
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
  let connectToSocketServer = () => {
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

  const getMedia = () => {
    setVideo(videoAvailable);
    setAudio(audioAvailable);
    connectToSocketServer();

  }

  // const connect = () => {
  //   setAskForUsername(false);
  //   getMedia();
  // }

  const handleVideo = () => {
    setVideo(!video)
  }

  const handleAudio = () => {
    setAudio(!audio)
  }

  const getDisplayMedia = () => {
    if (screen) {
      if (navigator.mediaDevices.getDisplayMedia) {
        navigator.mediaDevices.getDisplayMedia({ video: true })
          .then(getDisplayMediaSuccess)
          .then(() => { })
          .catch((error) => console.log(error))
      }
    }
  }

  const getDisplayMediaSuccess = (stream) => {
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
  const handleScreen = () => {
    setScreen(!screen)
  }
  useEffect(() => {
    if (screen !== undefined) {
      getDisplayMedia()
    }
  }, [screen])

  const toggleChat = () => {
    setIsChatVisible(!isChatVisible);
  };
  // Send Message
  const sendMesage = () => {
    if (!message || message.trim() === '') return;
    // Optimistically add the message so the sender sees it immediately
    setMessages((prev) => [...prev, { data: message, sender: username || 'You' }]);
    socketRef.current.emit("chat-message", message, username);
    setMessage("");
    if (!isChatVisible) setIsChatVisible(true);
  }

  const cleanupMediaAndConnections = () => {
    try {
      // stop local media tracks
      if (localVideoRef.current && localVideoRef.current.srcObject) {
        const tracks = localVideoRef.current.srcObject.getTracks();
        tracks.forEach(track => track.stop());
        localVideoRef.current.srcObject = null;
      }
      if (window.localStream) {
        try {
          window.localStream.getTracks().forEach(track => track.stop());
        } catch (_) {}
        window.localStream = null;
      }

      // close all peer connections
      for (let id in connections) {
        try {
          const pc = connections[id];
          if (pc.getSenders) {
            pc.getSenders().forEach(sender => {
              try { sender.track && sender.track.stop(); } catch (_) {}
            });
          }
          pc.close && pc.close();
        } catch (_) {}
        delete connections[id];
      }

      // disconnect socket
      if (socketRef.current) {
        try {
          socketRef.current.removeAllListeners && socketRef.current.removeAllListeners();
        } catch (_) {}
        try { socketRef.current.disconnect && socketRef.current.disconnect(); } catch (_) {}
      }

      setScreen(false);
      setVideo(false);
      setAudio(false);
      setIsChatVisible(false);
    } catch (e) {
      console.log('Cleanup error', e)
    }
  }
  const connect = () => {
    if (username.trim() !== "") {
      setAskForUsername(false);
      getMedia();
    } else {
      console.error("Username is required to connect.");
    }
  };
  let route = useNavigate();
  const handleEndCall = () => {
    cleanupMediaAndConnections();
    route('/home')
  }
  return (
    <>
      {/* video meet {window.location.href} */}
      {askForUsername === true ?
        // <div>
        //   <TextField id="outlined-basic" label="username" value={username} onChange={(e) => { setUsername(e.target.value) }} variant="outlined" />
        //   <Button variant="contained" onClick={connect} >Connect</Button>
        //   <div>
        //     <video ref={localVideoRef} autoPlay muted>
        //     </video>
        //   </div>
        // </div>
        <LobbyPage
          username={username}
          setUsername={setUsername}
          connect={connect}
          localVideoRef={localVideoRef}
          video={video}
          setVideo={setVideo}
          audio={audio}
          setAudio={setAudio}
        />

        

        :
        <div className={styles.videoCallContainer}>

          <Controls
            video={video}
            audio={audio}
            screenAvailable={screenAvailable === true}
            screen={screen}
            onToggleVideo={handleVideo}
            onToggleAudio={handleAudio}
            onToggleScreen={handleScreen}
            onToggleChat={toggleChat}
            newMessages={newMessages}
            onEnd={handleEndCall}
          />
          <div style={{ display: 'flex', gap: 12, alignItems: 'stretch', position: 'relative' }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <VideoGrid videos={videos} />
              <video
                ref={localVideoRef}
                autoPlay
                muted
                playsInline
                style={{
                  position: 'fixed',
                  right: isChatVisible ? (360 + 16) : 16,
                  bottom: 16,
                  width: 220,
                  height: 124,
                  borderRadius: 12,
                  boxShadow: '0 8px 20px rgba(0,0,0,0.25)',
                  background: '#000',
                  zIndex: 5
                }}
              />
            </div>
            {isChatVisible && (
              <ChatPanel
                messages={messages}
                message={message}
                setMessage={setMessage}
                onSend={sendMesage}
                currentUser={username || 'You'}
              />
            )}
          </div>




        </div>


      }


    </>
  )
}

export default VideoCall
