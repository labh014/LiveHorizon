import { connectToSocketServer } from "./connectToSocketServer";

export const getMedia = () => {
  setVideo(videoAvailable);
  setAudio(audioAvailable);
  connectToSocketServer();

}