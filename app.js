const SPEEDS = [1, 1.25, 1.5, 2];

const player = document.getElementById('player');
const audio = document.getElementById('audio-el');
const playButton = document.getElementById('play');
const speedButton = document.getElementById('speed');
const seek = document.getElementById('seek');
const nowTitle = document.getElementById('now-title');
const elapsed = document.getElementById('elapsed');
const total = document.getElementById('total');
const tracks = [...document.querySelectorAll('.track')];

let currentTrack = null;
let isSeeking = false;

const formatTime = (seconds) => {
  if (!Number.isFinite(seconds)) return '0:00';
  const whole = Math.floor(seconds);
  const minutes = Math.floor(whole / 60);
  return `${minutes}:${String(whole % 60).padStart(2, '0')}`;
};

const titleOf = (track) => track.querySelector('.row-title').textContent;

const showPlayer = () => {
  player.hidden = false;
  document.documentElement.style.setProperty('--player-h', `${player.offsetHeight}px`);
};

const setCurrent = (track) => {
  tracks.forEach((item) => item.removeAttribute('aria-current'));
  track.setAttribute('aria-current', 'true');
  currentTrack = track;
};

const showError = () => {
  nowTitle.textContent = 'This track could not be played. Check your connection and try again.';
  nowTitle.classList.add('error');
  playButton.dataset.paused = 'true';
  playButton.setAttribute('aria-label', 'Play');
};

const play = () => audio.play().catch((error) => {
  if (error.name !== 'AbortError') showError();
});

const loadTrack = (track) => {
  setCurrent(track);
  nowTitle.classList.remove('error');
  nowTitle.textContent = titleOf(track);
  audio.src = track.getAttribute('href');
  audio.playbackRate = SPEEDS[Number(speedButton.dataset.index ?? 0)];
  seek.value = 0;
  elapsed.textContent = '0:00';
  showPlayer();
  play();
  if ('mediaSession' in navigator) {
    navigator.mediaSession.metadata = new MediaMetadata({ title: titleOf(track), artist: 'Strongmoney72' });
  }
};

tracks.forEach((track) => {
  track.addEventListener('click', (event) => {
    event.preventDefault();
    if (track !== currentTrack) loadTrack(track);
    else if (audio.paused) play();
    else audio.pause();
  });
});

playButton.addEventListener('click', () => (audio.paused ? play() : audio.pause()));

speedButton.addEventListener('click', () => {
  const index = (Number(speedButton.dataset.index ?? 0) + 1) % SPEEDS.length;
  speedButton.dataset.index = index;
  speedButton.textContent = `${SPEEDS[index]}×`;
  speedButton.setAttribute('aria-label', `Playback speed ${SPEEDS[index]}x`);
  audio.playbackRate = SPEEDS[index];
});

seek.addEventListener('input', () => {
  isSeeking = true;
  elapsed.textContent = formatTime(Number(seek.value));
});

seek.addEventListener('change', () => {
  audio.currentTime = Number(seek.value);
  isSeeking = false;
});

audio.addEventListener('loadedmetadata', () => {
  seek.max = Math.floor(audio.duration);
  total.textContent = formatTime(audio.duration);
});

audio.addEventListener('timeupdate', () => {
  if (isSeeking) return;
  seek.value = Math.floor(audio.currentTime);
  elapsed.textContent = formatTime(audio.currentTime);
});

const syncPlayState = () => {
  playButton.dataset.paused = String(audio.paused);
  playButton.setAttribute('aria-label', audio.paused ? 'Play' : 'Pause');
};

audio.addEventListener('play', syncPlayState);
audio.addEventListener('pause', syncPlayState);
audio.addEventListener('error', () => {
  if (audio.getAttribute('src')) showError();
});

audio.addEventListener('ended', () => {
  const next = tracks[tracks.indexOf(currentTrack) + 1];
  if (next) loadTrack(next);
});

const video = document.getElementById('video');

video.addEventListener('click', (event) => {
  event.preventDefault();
  const frame = document.createElement('iframe');
  frame.src = 'https://www.youtube-nocookie.com/embed/S6ahjNIXH8g?autoplay=1';
  frame.title = 'James Pan Value Talk at GW';
  frame.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
  frame.referrerPolicy = 'strict-origin-when-cross-origin';
  video.replaceChildren(frame);
  video.removeAttribute('href');
  audio.pause();
});

window.addEventListener('resize', () => {
  if (!player.hidden) showPlayer();
});
