import * as Foliou from '../libs/foliou/index.js';

window.Foliou = Foliou;

window.loadDevice = function() {
  const d = window.Foliou.Device;
  document.getElementById('demo-title').textContent = 'Device 检测';
  document.getElementById('demo-content').innerHTML = `
    <pre style="background:#1a1a2e;padding:16px;border-radius:8px;overflow:auto;">
isMobile: ${d.isMobile}
isiOS: ${d.isiOS}
isAndroid: ${d.isAndroid}
isWeixin: ${d.isWeixin}
isPc: ${d.isPc}
    </pre>
  `;
  document.getElementById('demo').style.display = 'block';
};

window.loadBgm = function() {
  const bgm = new Foliou.Bgm({
    file: "http://www.ztgame.com/act/30th/sound/bg.mp3",
    onplay: () => console.log('BGM playing'),
    onpause: () => console.log('BGM paused')
  });
  window.bgm = bgm;
  document.getElementById('demo-title').textContent = 'BGM 播放器';
  document.getElementById('demo-content').innerHTML = `
    <p style="margin-bottom:16px;">背景音乐播放器演示</p>
    <button onclick="bgm.play()" style="padding:10px 20px;margin-right:10px;cursor:pointer;">播放</button>
    <button onclick="bgm.pause()" style="padding:10px 20px;cursor:pointer;">暂停</button>
  `;
  document.getElementById('demo').style.display = 'block';
};

window.loadPrefix = function() {
  const p = window.Foliou.Prefix;
  document.getElementById('demo-title').textContent = 'CSS 前缀检测';
  document.getElementById('demo-content').innerHTML = `
    <pre style="background:#1a1a2e;padding:16px;border-radius:8px;overflow:auto;">
CSS前缀: ${p.css}
JS前缀: ${p.js}
DOM前缀: ${p.dom}
    </pre>
  `;
  document.getElementById('demo').style.display = 'block';
};

window.loadTrace = function() {
  const t = window.Foliou.Trace;
  document.getElementById('demo-title').textContent = 'Trace 追踪';
  document.getElementById('demo-content').innerHTML = `
    <p style="margin-bottom:16px;">数据埋点追踪演示</p>
    <button onclick="t.send('click', {button: 'test'})" style="padding:10px 20px;cursor:pointer;">发送埋点</button>
  `;
  document.getElementById('demo').style.display = 'block';
};

window.loadAnimate = function() {
  document.getElementById('demo-title').textContent = 'Animate 动画';
  document.getElementById('demo-content').innerHTML = `
    <div id="animate-box" style="width:100px;height:100px;background:#e94560;border-radius:8px;margin:20px 0;"></div>
    <button onclick="Foliou.Animate.to('#animate-box', {x: 200, duration: 1})" style="padding:10px 20px;cursor:pointer;">移动动画</button>
  `;
  document.getElementById('demo').style.display = 'block';
};

window.loadPopup = function() {
  document.getElementById('demo-title').textContent = 'Popup 弹窗';
  document.getElementById('demo-content').innerHTML = `
    <button onclick="new Foliou.Popup({content: 'Hello Foliou!'}).open()" style="padding:10px 20px;cursor:pointer;">打开弹窗</button>
  `;
  document.getElementById('demo').style.display = 'block';
};

window.loadSwiper = function() {
  document.getElementById('demo-title').textContent = 'Swiper 轮播';
  document.getElementById('demo-content').innerHTML = `
    <div style="background:#000;padding:20px;color:#888;text-align:center;">
      Swiper 组件演示<br/>需要在 DOM 中初始化使用
    </div>
  `;
  document.getElementById('demo').style.display = 'block';
};

window.loadTouch = function() {
  document.getElementById('demo-title').textContent = 'Touch 手势';
  document.getElementById('demo-content').innerHTML = `
    <div id="touch-area" style="width:100%;height:150px;background:rgba(233,69,96,0.2);border-radius:8px;display:flex;align-items:center;justify-content:center;color:#e94560;">
      在此区域触摸滑动
    </div>
  `;
  document.getElementById('demo').style.display = 'block';
};

window.loadVisualizer = function() {
  document.getElementById('demo-title').textContent = 'Visualizer 可视化';
  document.getElementById('demo-content').innerHTML = `
    <div style="background:#000;padding:20px;color:#888;text-align:center;">
      音频可视化组件<br/>需要音频输入
    </div>
  `;
  document.getElementById('demo').style.display = 'block';
};

window.loadPlayer = function() {
  document.getElementById('demo-title').textContent = 'Player 播放器';
  document.getElementById('demo-content').innerHTML = `
    <div style="background:#000;padding:20px;color:#888;text-align:center;">
      视频播放器组件<br/>需要视频 URL
    </div>
  `;
  document.getElementById('demo').style.display = 'block';
};