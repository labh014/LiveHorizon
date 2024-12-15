export let black = ({ width = 600, height = 400 } = {}) => {
  let canvas = Object.assign(document.createElement("canvas"), { width, height })
  canvas.getContext("2d").fillRect(0, 0, width, height);
  let stream = canvas.captureStream();
  return Object.assign(stream.getVideoTracks()[0], { enabled: false })
}