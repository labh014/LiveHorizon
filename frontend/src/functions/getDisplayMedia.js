export const getDisplayMedia = () => {
  if (screen) {
    if (navigator.mediaDevices.getDisplayMedia) {
      navigator.mediaDevices.getDisplayMedia({ video: true })
        .then(getDisplayMediaSuccess)
        .then(() => { })
        .catch((error) => console.log(error))
    }
  }
}