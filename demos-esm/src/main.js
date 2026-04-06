import BGM from 'foliou/bgm/index.js';

const bgm = new BGM({
  file: "http://www.ztgame.com/act/30th/sound/bg.mp3",
  onplay: () => console.log('BGM playing'),
  onpause: () => console.log('BGM paused')
});

window.bgm = bgm;
document.getElementById('status').textContent = 'BGM loaded';