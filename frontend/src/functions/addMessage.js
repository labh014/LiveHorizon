export const addMessage = (data, sender, socketIdSender) => {
  setMessages((prevMessages) => [...prevMessages, {data: data, sender: sender}])
  if(socketIdSender !== socketIdRef.current){
    setNewMessages((prevMessages) => prevMessages + 1)
  } 
}