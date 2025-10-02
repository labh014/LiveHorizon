import React from 'react'

function VideoGrid({ videos }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(264px, 1fr))', gap: 12 }}>
      {videos.map((video) => (
        <div key={video.socketId}>
          <video
            style={{ width: '100%', height: '199px', minWidth: '180px', borderRadius: '0.8rem' }}
            data-socket={video.socketId}
            ref={(ref) => {
              if (ref && video.stream) ref.srcObject = video.stream
            }}
            autoPlay
          />
        </div>
      ))}
    </div>
  )
}

export default VideoGrid
