import React, { useState, useRef, useEffect } from 'react'

import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import io from "socket.io-client";
import { backdropClasses, Badge } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import styles from '../style/videoCall.module.css'
import Auth from '../utils/Auth'

import VideocamIcon from '@mui/icons-material/VideocamOutlined';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
import CallEndIcon from '@mui/icons-material/CallEnd';
import MicIcon from '@mui/icons-material/Mic';
import MessageIcon from '@mui/icons-material/Message';
import ScreenShareIcon from '@mui/icons-material/ScreenShare';
import StopScreenShareIcon from '@mui/icons-material/StopScreenShare';
import MicOffIcon from '@mui/icons-material/MicOff';
import ChatIcon from '@mui/icons-material/Chat';
import { useNavigate } from 'react-router-dom';
import LobbyPage from './LobbyPage';
import server from '../../environment.js';



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
      if (videoPermission) setVideoAvailable(true);
      else setVideoAvailable(false);

      const audioPermission = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (audioPermission) setAudioAvailable(true);
      else setAudioAvailable(false);

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
  }, []);

  const getUserMediaSuccess = (stream) => {
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
    setMessages((prevMessages) => [...prevMessages, {data: data, sender: sender}])
    if(socketIdSender !== socketIdRef.current){
      setNewMessages((prevMessages) => prevMessages + 1)
    } 
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
    socketRef.current.emit("chat-message", message, username)
    setMessage("")
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
    try
    {
      let tracks = localVideoRef.current.srcObject.getTracks();
      tracks.forEach((track) => track.stop())
    }
    catch(error){
      console.log(`Something wrong in ending call ${error}`)
    }

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
        <LobbyPage username={username} setUsername={setUsername} connect={connect} localVideoRef={localVideoRef} />

        

        :
        <div className={styles.videoCallContainer}>

          <div className={styles.buttonContainer}>
            <IconButton style={{ color: "grey" }} onClick={handleVideo}>
              {(video === true) ? <VideocamIcon /> : <VideocamOffIcon />}
            </IconButton>


            <IconButton style={{ color: "grey" }} onClick={handleAudio}>
              {audio === true ? <MicIcon /> : <MicOffIcon />}
            </IconButton>

            {
              screenAvailable === true ? <IconButton onClick={handleScreen} style={{ color: "grey" }}>
                {screen === true ? <ScreenShareIcon /> : <StopScreenShareIcon />}
              </IconButton> : <></>
            }

            <Badge badgeContent={newMessages} max={500} color='primary'>
              <IconButton onClick={toggleChat} style={{ color: "grey" }}  >
                <ChatIcon />
              </IconButton>

            </Badge>
            <IconButton style={{ color: "red" }} onClick={handleEndCall}>
              <CallEndIcon />
            </IconButton>
          </div>
          <video className={styles.videoConfrenece} ref={localVideoRef} autoPlay muted></video>
          <div className={styles.VideoRoom}>
            {videos.map((video) => (
              <div key={video.socketId}>
                {/* <h1>{video.socketId}</h1> */}
                <video
                  style={{ width: '264px', height: '199px', minWidth: '80px', borderRadius: '0.8rem' }}
                  data-socket={video.socketId}
                  ref={ref => {
                    if (ref && video.stream) ref.srcObject = video.stream;
                  }}
                  autoPlay

                />
              </div>
            ))}


          </div>

          {isChatVisible && (
            <div className={styles.chatContainer}>
              <h2>Chat Container</h2>
              {messages.length}
              <div className={styles.chats}>
                {messages.map((item, index) => {
                  return (
                    <>
                      <p><b>{item.sender}</b>
                      </p>
                      <p>{item.data}</p>
                    </>
                  )
                  
                })}
              </div>
              <div className={styles.input}>
                <TextField id="standard-basic" label="Chat" variant="standard" value={message} onChange={(e) => { setMessage(e.target.value) }} />
              </div>
              <div className={styles.button}>
                <Button variant="contained" onClick={sendMesage}>Send</Button>
              </div>


              {/* Add more chat UI components as needed */}
            </div>
          )}




        </div>


      }


    </>
  )
}

export default Auth(VideoCall)
