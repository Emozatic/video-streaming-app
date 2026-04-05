// Custom Video Player Controller
document.addEventListener('DOMContentLoaded', function() {
    const video = document.getElementById('videoPlayer');
    if (!video) return;

    const playBtn = document.querySelector('.play-btn');
    const volumeBtn = document.querySelector('.volume-btn');
    const volumeSlider = document.querySelector('.volume-slider');
    const progressContainer = document.querySelector('.progress-bar-container');
    const progressBar = document.querySelector('.progress-bar');
    const progressFill = document.querySelector('.progress-fill');
    const progressHandle = document.querySelector('.progress-handle');
    const currentTimeEl = document.querySelector('.current-time');
    const durationEl = document.querySelector('.duration');
    const fullscreenBtn = document.querySelector('.fullscreen-btn');
    const videoWrapper = document.querySelector('.video-wrapper');

    // Format time helper
    function formatTime(seconds) {
        if (isNaN(seconds)) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    // Play/Pause functionality
    function togglePlay() {
        if (video.paused) {
            video.play();
            playBtn.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/></svg>';
        } else {
            video.pause();
            playBtn.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>';
        }
    }

    playBtn.addEventListener('click', togglePlay);
    video.addEventListener('click', togglePlay);

    // Update play button state
    video.addEventListener('play', function() {
        playBtn.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/></svg>';
    });

    video.addEventListener('pause', function() {
        playBtn.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>';
    });

    // Duration
    video.addEventListener('loadedmetadata', function() {
        durationEl.textContent = formatTime(video.duration);
    });

    // Update time display
    video.addEventListener('timeupdate', function() {
        currentTimeEl.textContent = formatTime(video.currentTime);
        const percent = (video.currentTime / video.duration) * 100;
        progressFill.style.width = percent + '%';
        progressHandle.style.left = percent + '%';
    });

    // Progress bar click
    progressContainer.addEventListener('click', function(e) {
        const rect = progressBar.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        video.currentTime = percent * video.duration;
    });

    // Volume control
    volumeSlider.addEventListener('input', function() {
        video.volume = this.value / 100;
        updateVolumeBtnIcon();
    });

    volumeBtn.addEventListener('click', function() {
        if (video.volume > 0) {
            video.volume = 0;
            volumeSlider.value = 0;
        } else {
            video.volume = 0.5;
            volumeSlider.value = 50;
        }
        updateVolumeBtnIcon();
    });

    function updateVolumeBtnIcon() {
        if (video.volume === 0) {
            volumeBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M16.6915026,12.4744748 L3.50612381,13.2599618 C3.19218622,13.2599618 3.03521743,13.4170592 3.03521743,13.5741566 L1.15159189,20.0151496 C0.8376543,20.8006365 0.99,21.89 1.77946707,22.52 C2.41,22.99 3.50612381,23.1 4.13399899,22.8429026 L21.714504,14.0454487 C22.6563168,13.5741566 23.1272231,12.6315722 22.9702544,11.6889879 L4.13399899,1.16151496 C3.34915502,0.9 2.40734225,0.9 1.77946707,1.4429026 C0.994623095,2.06267145 0.837654326,3.0051558 1.15159189,3.99714159 L3.03521743,10.4381346 C3.03521743,10.5952319 3.19218622,10.7523293 3.50612381,10.7523293 L16.6915026,11.5378161 C16.6915026,11.5378161 17.1624089,11.5378161 17.1624089,12.0006925 C17.1624089,12.4635689 17.1624089,12.4744748 16.6915026,12.4744748 Z"/></svg>';
        } else if (video.volume < 0.5) {
            volumeBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.26 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>';
        } else {
            volumeBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.26 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>';
        }
    }

    // Fullscreen
    fullscreenBtn.addEventListener('click', function() {
        if (!document.fullscreenElement) {
            if (videoWrapper.requestFullscreen) {
                videoWrapper.requestFullscreen();
            } else if (videoWrapper.webkitRequestFullscreen) {
                videoWrapper.webkitRequestFullscreen();
            } else if (videoWrapper.mozRequestFullScreen) {
                videoWrapper.mozRequestFullScreen();
            } else if (videoWrapper.msRequestFullscreen) {
                videoWrapper.msRequestFullscreen();
            }
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            } else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            }
        }
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        if (e.target === document.body) {
            switch(e.code) {
                case 'Space':
                    e.preventDefault();
                    togglePlay();
                    break;
                case 'KeyF':
                    e.preventDefault();
                    fullscreenBtn.click();
                    break;
                case 'ArrowRight':
                    video.currentTime = Math.min(video.currentTime + 5, video.duration);
                    break;
                case 'ArrowLeft':
                    video.currentTime = Math.max(video.currentTime - 5, 0);
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    video.volume = Math.min(video.volume + 0.1, 1);
                    volumeSlider.value = video.volume * 100;
                    updateVolumeBtnIcon();
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    video.volume = Math.max(video.volume - 0.1, 0);
                    volumeSlider.value = video.volume * 100;
                    updateVolumeBtnIcon();
                    break;
            }
        }
    });

    updateVolumeBtnIcon();
});
