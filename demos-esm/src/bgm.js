import BGM from 'foliou/bgm/index.js';

const bgm = new BGM({
  file: "http://www.ztgame.com/act/30th/sound/bg.mp3",
  onpause: () => console.log("pause"),
  onplay: () => console.log("play")
});

window.bgm = bgm;