export const getPermissions = async () => {
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