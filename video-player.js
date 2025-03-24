// src/components/content/VideoPlayer.js

import React, { useRef, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Hls from 'hls.js';
import deviceAdapterService from '../../services/deviceAdapterService';

const VideoPlayer = ({ 
  videoUrl, 
  quality, 
  captions, 
  onComplete 
}) => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCaptions, setShowCaptions] = useState(true);
  const [selectedCaptions, setSelectedCaptions] = useState(null);
  const [qualityLevel, setQualityLevel] = useState(null);
  const [availableQualities, setAvailableQualities] = useState([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [progress, setProgress] = useState(0);
  const [bufferProgress, setBufferProgress] = useState(0);
  const [isHlsSupported, setIsHlsSupported] = useState(false);
  const [hls, setHls] = useState(null);

  // Initialize video player
  useEffect(() => {
    const initializeVideo = async () => {
      try {
        setLoading(true);
        
        // Check if HLS is supported
        const hlsSupported = Hls.isSupported();
        setIsHlsSupported(hlsSupported);
        
        if (hlsSupported && videoUrl.includes('.m3u8')) {
          const hls = new Hls({
            capLevelToPlayerSize: true,
            startLevel: qualityToHlsLevel(quality)
          });
          
          hls.loadSource(videoUrl);
          hls.attachMedia(videoRef.current);
          
          hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
            // Extract available quality levels
            const qualities = data.levels.map((level, index) => ({
              index,
              height: level.height,
              bitrate: level.bitrate
            }));
            setAvailableQualities(qualities);
            
            // Set initial quality level
            const initialLevel = qualityToHlsLevel(quality);
            if (initialLevel !== -1) {
              hls.currentLevel = initialLevel;
              setQualityLevel(initialLevel);
            }
            
            setLoading(false);
          });
          
          hls.on(Hls.Events.ERROR, (event, data) => {
            if (data.fatal) {
              switch (data.type) {
                case Hls.ErrorTypes.NETWORK_ERROR:
                  hls.startLoad();
                  break;
                case Hls.ErrorTypes.MEDIA_ERROR:
                  hls.recoverMediaError();
                  break;
                default:
                  setError('Fatal video loading error');
                  break;
              }
            }
          });
          
          setHls(hls);
        } else {
          // For non-HLS videos, use regular video element
          videoRef.current.src = videoUrl;
          setLoading(false);
        }
        
        // Setup captions
        if (captions && captions.length > 0) {
          setSelectedCaptions(captions[0]);
        }
      } catch (err) {
        console.error('Video initialization error:', err);
        setError(err.message);
        setLoading(false);
      }
    };
    
    initializeVideo();
    
    // Cleanup function
    return () => {
      if (hls) {
        hls.destroy();
      }
    };
  }, [videoUrl, quality]);

  // Convert quality string to HLS level
  const qualityToHlsLevel = (quality) => {
    switch (quality) {
      case deviceAdapterService.CONTENT_QUALITY.ULTRA:
        return 0; // Highest quality
      case deviceAdapterService.CONTENT_QUALITY.HIGH:
        return 1;
      case deviceAdapterService.CONTENT_QUALITY.MEDIUM:
        return 2;
      case deviceAdapterService.CONTENT_QUALITY.LOW:
        return 3;
      case deviceAdapterService.CONTENT_QUALITY.MINIMAL:
        return -1; // Auto (lowest possible based on network)
      default:
        return -1; // Auto
    }
  };

  // Handle playback events
  useEffect(() => {
    const video = videoRef.current;
    
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      setProgress((video.currentTime / video.duration) * 100);
    };
    const handleDurationChange = () => setDuration(video.duration);
    const handleVolumeChange = () => setVolume(video.volume);
    const handleProgress = () => {
      if (video.buffered.length > 0) {
        setBufferProgress((video.buffered.end(video.buffered.length - 1) / video.duration) * 100);
      }
    };
    const handleEnded = () => {
      if (onComplete) onComplete();
    };
    
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('durationchange', handleDurationChange);
    video.addEventListener('volumechange', handleVolumeChange);
    video.addEventListener('progress', handleProgress);
    video.addEventListener('ended', handleEnded);
    
    return () => {
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('durationchange', handleDurationChange);
      video.removeEventListener('volumechange', handleVolumeChange);
      video.removeEventListener('progress', handleProgress);
      video.removeEventListener('ended', handleEnded);
    };
  }, [onComplete]);

  // Handle play/pause
  const togglePlay = () => {
    if (videoRef.current.paused) {
      videoRef.current.play();
    } else {
      videoRef.current.pause();
    }
  };

  // Handle quality change
  const changeQuality = (level) => {
    if (hls) {
      hls.currentLevel = level;
      setQualityLevel(level);
    }
  };

  // Handle seeking
  const handleSeek = (e) => {
    const seekTime = (e.nativeEvent.offsetX / e.target.clientWidth) * duration;
    videoRef.current.currentTime = seekTime;
  };

  // Handle volume change
  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    videoRef.current.volume = newVolume;
    setVolume(newVolume);
  };

  // Handle captions toggle
  const toggleCaptions = () => {
    setShowCaptions(!showCaptions);
  };

  // Handle fullscreen toggle
  const toggleFullscreen = () => {
    const videoContainer = videoRef.current.parentElement;
    
    if (!isFullscreen) {
      if (videoContainer.requestFullscreen) {
        videoContainer.requestFullscreen();
      } else if (videoContainer.webkitRequestFullscreen) {
        videoContainer.webkitRequestFullscreen();
      } else if (videoContainer.msRequestFullscreen) {
        videoContainer.msRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
    }
    
    setIsFullscreen(!isFullscreen);
  };

  // Listen for fullscreen change
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, []);

  // Format time (seconds to MM:SS)
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return <div className="video-loading">Loading video...</div>;
  }

  if (error) {
    return <div className="video-error">Error loading video: {error}</div>;
  }

  return (
    <div className="video-player">
      <div className="video-container">
        <video
          ref={videoRef}
          className="video-element"
          playsInline
          onClick={togglePlay}
        >
          {/* Add tracks for captions if available */}
          {captions && captions.map((caption, index) => (
            <track
              key={index}
              kind="subtitles"
              src={caption.url}
              srcLang={caption.lang}
              label={caption.label}
              default={index === 0}
            />
          ))}
        </video>
        
        {/* Video controls */}
        <div className="video-controls">
          <button onClick={togglePlay} className="control-button">
            {isPlaying ? 'Pause' : 'Play'}
          </button>
          
          <div className="progress-bar" onClick={handleSeek}>
            <div className="buffer-progress" style={{ width: `${bufferProgress}%` }}></div>
            <div className="play-progress" style={{ width: `${progress}%` }}></div>
          </div>
          
          <div className="time-display">
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>
          
          <div className="volume-control">
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={handleVolumeChange}
            />
          </div>
          
          {captions && captions.length > 0 && (
            <button onClick={toggleCaptions} className="caption-button">
              {showCaptions ? 'CC' : 'cc'}
            </button>
          )}
          
          {isHlsSupported && availableQualities.length > 0 && (
            <select 
              value={qualityLevel} 
              onChange={(e) => changeQuality(parseInt(e.target.value))}
              className="quality-selector"
            >
              <option value="-1">Auto</option>
              {availableQualities.map((quality) => (
                <option key={quality.index} value={quality.index}>
                  {quality.height}p
                </option>
              ))}
            </select>
          )}
          
          <button onClick={toggleFullscreen} className="fullscreen-button">
            {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          </button>
        </div>
      </div>
    </div>
  );
};

VideoPlayer.propTypes = {
  videoUrl: PropTypes.string.isRequired,
  quality: PropTypes.string,
  captions: PropTypes.arrayOf(PropTypes.shape({
    url: PropTypes.string.isRequired,
    lang: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired
  })),
  onComplete: PropTypes.func
};

export default VideoPlayer;
