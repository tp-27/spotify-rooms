import React, { useCallback } from 'react';
import { WebPlaybackSDK } from 'react-spotify-web-playback-sdk';


const SpotifyPlayer = ({ token }) => {
    const getOAuthToken = useCallback(callback => {
        // Pass the Spotify OAuth token to the callback
        callback(token);
      }, [token]);
    
      return (
        <WebPlaybackSDK
          deviceName="My Spotify Player"
          getOAuthToken={getOAuthToken}
          volume={0.5}
        >
          {/* Your player components like play, pause buttons, etc., go here */}
        </WebPlaybackSDK>
      );
}

export default SpotifyPlayer
