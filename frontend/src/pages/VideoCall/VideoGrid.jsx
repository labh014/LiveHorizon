import React from 'react';

function VideoGrid({ videos }) {
  return (
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
      gap: '16px', 
      padding: '16px',
      width: '100%',
      height: '100%',
      minHeight: '260px'
    }}>
      {videos.map((video) => (
        <div 
          key={video.socketId}
          style={{
            position: 'relative',
            backgroundColor: '#202124',
            borderRadius: '12px',
            overflow: 'hidden',
            boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            aspectRatio: '16/9',
            border: '1px solid #3c4043'
          }}
        >
          <video
            style={{ 
              width: '100%', 
              height: '100%', 
              objectFit: 'cover',
              transform: 'scaleX(-1)' // Mirror peers or keep original
            }}
            data-socket={video.socketId}
            ref={(ref) => {
              if (ref && video.stream) ref.srcObject = video.stream;
            }}
            autoPlay
            playsInline
          />
          
          {/* Overlay Name Tag */}
          <div style={{
            position: 'absolute',
            bottom: '12px',
            left: '12px',
            backgroundColor: 'rgba(0, 0, 0, 0.55)',
            color: '#ffffff',
            padding: '4px 10px',
            borderRadius: '4px',
            fontSize: '12.5px',
            fontWeight: '500',
            backdropFilter: 'blur(4px)',
            zIndex: 10,
            fontFamily: 'Inter, sans-serif'
          }}>
            {video.socketId ? `Participant (${video.socketId.substring(0, 5)})` : 'Guest'}
          </div>
        </div>
      ))}
    </div>
  );
}

export default VideoGrid;
