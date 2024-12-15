export let silence = () => {
  let ctx = new AudioContext();
  let oscillator = ctx.createOscillator();

  let dst = oscillator.connect(ctx.createMediaStreamDestination());

  oscillator.start();
  ctx.resume();
  return Object.assign(dst.stream.getAudioTracks()[0], { enabled: false })
}