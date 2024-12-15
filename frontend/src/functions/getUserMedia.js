export const getUserMedia = () => {
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