// 空のアニメーション
const skyTypes = {
  blueSky: [
    {
      top: {hue: 233, saturation: 98, lightness: 21},
      bottom: {hue: 221, saturation: 73, lightness: 63}
      // 群青
    },
    {
      top: {hue: 197, saturation: 66, lightness: 73},
      bottom: {hue: 214, saturation: 50, lightness: 88}
      // 朝の空気
    },
    {
      top: {hue: 206, saturation: 97, lightness: 24},
      bottom: {hue: 186, saturation: 34, lightness: 73}
      // 天の原
    }
  ],
  sunset: [
    {
      top: {hue: 227, saturation: 43, lightness: 45},
      bottom: {hue: 339, saturation: 62, lightness: 72}
      // マジックアワー
    },
    {
      top: {hue: 309, saturation: 17, lightness: 54},
      bottom: {hue: 58, saturation: 68, lightness: 84}
      // 暁光
    },
    {
      top: {hue: 211, saturation: 29, lightness: 31},
      bottom: {hue: 39, saturation: 58, lightness: 71}
      // 夕焼け
    }
  ],
  nightSky: [
    {
      top: {hue: 227, saturation: 33, lightness: 8},
      bottom: {hue: 219, saturation: 43, lightness: 44}
      // 宵
    },
    {
      top: {hue: 220, saturation: 88, lightness: 10},
      bottom: {hue: 209, saturation: 61, lightness: 38}
      // 午前4時
    },
    {
      top: {hue: 250, saturation: 70, lightness: 0},
      bottom: {hue: 250, saturation: 70, lightness: 10}
      // 薄暮れ
    }
  ]
};

// ランダムな空のパレットを選択
function getRandomSkyPalette(skyType) {
  const palettes = skyTypes[skyType];
  const randomIndex = Math.floor(Math.random() * palettes.length);
  return palettes[randomIndex];
}

// HSLカラーをCSS文字列に変換
function hslToCss(hsl) {
  return `hsl(${hsl.hue}, ${hsl.saturation}%, ${hsl.lightness}%)`;
}

// 2つのHSLカラー間を補間
function interpolateHSL(hsl1, hsl2, t) {
  const hueDifference = hsl2.hue - hsl1.hue;
  let deltaHue = hueDifference;
  if (deltaHue > 180) {
    deltaHue -= 360;
  } else if (deltaHue < -180) {
    deltaHue += 360;
  }

  const hue = (hsl1.hue + deltaHue * t + 360) % 360;
  const saturation = hsl1.saturation + (hsl2.saturation - hsl1.saturation) * t;
  const lightness = hsl1.lightness + (hsl2.lightness - hsl1.lightness) * t;
  return {hue, saturation, lightness};
}

// 各空のタイプのランダムなパレットを取得
let skyColors = {
  blueSky: getRandomSkyPalette('blueSky'),
  sunset: getRandomSkyPalette('sunset'),
  nightSky: getRandomSkyPalette('nightSky')
};

// 空の遷移シーケンスを定義
let skySequence = [
  {type: 'blueSky', duration: 1/3}, // 全体の1/3の時間
  {type: 'sunset', duration: 1/3},
  {type: 'nightSky', duration: 1/3}
];

// アニメーションの制御用変数
let animationStartTime = null;
let animationPausedTime = null;
let animationRequestId = null;
let animationDuration = null; // ミリ秒単位で設定
let isAnimationPaused = false;

// DOM読み込み完了まで待機
document.addEventListener('DOMContentLoaded', function() {
  // CSSで初期表示が完了しているため、この処理は不要
});

// フィルムグレインの生成（既存のコード）
(function addFilmGrain() {
  const canvas = document.getElementById('grainCanvas');
  const ctx = canvas.getContext('2d');

  // Canvasのサイズをウィンドウサイズに設定
  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    generateGrain();
  }

  // フィルムグレインを生成
  function generateGrain() {
    const imageData = ctx.createImageData(canvas.width, canvas.height);
    const buffer = new Uint32Array(imageData.data.buffer);
    const len = buffer.length;
    for (let i = 0; i < len; i++) {
      // グレインの強度を調整（ここでは0〜255のグレースケール）
      const value = Math.random() < 0.5 ? 0xFFFFFF : 0x000000;
      buffer[i] = (255 << 24) | // alpha
                  ((Math.random() * 255) << 16) | // red
                  ((Math.random() * 255) << 8) |  // green
                  (Math.random() * 255);          // blue
    }
    ctx.putImageData(imageData, 0, 0);
  }

  // ウィンドウリサイズ時にCanvasを再生成
  window.addEventListener('resize', resizeCanvas);

  // 初期化
  resizeCanvas();
})();

// タイマー機能

// タイマー変数
let countdownTime = 0; // ミリ秒単位
let timerInterval = null;
let isPaused = false;
let timerStartTime = null; // タイマー開始時刻
let pausedTime = 0; // 一時停止した時刻

// タイマー要素の取得
const timerTitle = document.getElementById('timerTitle');
const timerDisplay = document.getElementById('timerDisplay');
const start25Button = document.getElementById('start25Button');
const startRandomButton = document.getElementById('startRandomButton');
const pauseButton = document.getElementById('pauseButton');
const resumeButton = document.getElementById('resumeButton');
const resetButton = document.getElementById('resetButton');

start25Button.addEventListener('click', () => {
  startTimer(25 * 60 * 1000); // 25分をミリ秒に変換
});

startRandomButton.addEventListener('click', () => {
  const randomMinutes = 5; // 5分に固定
  startTimer(randomMinutes * 60 * 1000);
});

pauseButton.addEventListener('click', () => {
  pauseTimer();
  pauseBackgroundAnimation();
});

resumeButton.addEventListener('click', () => {
  resumeTimer();
  resumeBackgroundAnimation();
});

resetButton.addEventListener('click', () => {
  resetTimer();
  resetBackgroundAnimation();
});

function startTimer(duration) {
  countdownTime = duration;
  timerStartTime = Date.now();
  updateTimerDisplay(countdownTime);
  timerInterval = setInterval(updateTimer, 1000); // 毎秒更新
  // スタートボタンを非表示、ポーズとリセットボタンを表示
  start25Button.style.display = 'none';
  startRandomButton.style.display = 'none';
  pauseButton.style.display = 'inline';
  resetButton.style.display = 'inline';
  isPaused = false;

  // 背景アニメーションを開始
  startBackgroundAnimation(duration);
}

function updateTimer() {
  if (!isPaused) {
    const elapsedTime = Date.now() - timerStartTime;
    const remainingTime = countdownTime - elapsedTime;
    if (remainingTime <= 0) {
      // タイマー終了
      clearInterval(timerInterval);
      timerDisplay.textContent = '00:00';
      // タイマー終了時のアクションをのちのちここに追加？
      // 背景アニメーションを終了
      cancelAnimationFrame(animationRequestId);
    } else {
      updateTimerDisplay(remainingTime);
    }
  }
}

function updateTimerDisplay(time) {
  const totalSeconds = Math.ceil(time / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const formattedMinutes = minutes.toString().padStart(2, '0');
  const formattedSeconds = seconds.toString().padStart(2, '0');
  timerDisplay.textContent = `${formattedMinutes}:${formattedSeconds}`;
}

function pauseTimer() {
  if (!isPaused) {
    isPaused = true;
    pausedTime = Date.now();
    clearInterval(timerInterval);
    // ポーズボタンをレジュームボタンに切り替え
    pauseButton.style.display = 'none';
    resumeButton.style.display = 'inline';
  }
}

function resumeTimer() {
  if (isPaused) {
    isPaused = false;
    const pauseDuration = Date.now() - pausedTime;
    timerStartTime += pauseDuration; // 開始時刻を調整
    timerInterval = setInterval(updateTimer, 1000);
    // レジュームボタンをポーズボタンに戻す
    resumeButton.style.display = 'none';
    pauseButton.style.display = 'inline';
  }
}

function resetTimer() {
  // タイマーを停止
  clearInterval(timerInterval);
  countdownTime = 0;
  timerDisplay.textContent = '00:00';
  // ボタンの表示を初期状態に戻す
  pauseButton.style.display = 'none';
  resumeButton.style.display = 'none';
  resetButton.style.display = 'none';
  start25Button.style.display = 'inline';
  startRandomButton.style.display = 'inline';
}

// 背景アニメーションの関数
function startBackgroundAnimation(duration) {
  // アニメーションの初期化
  skyColors = {
    blueSky: skyColors.blueSky, // 既存の青空パレットを使用
    sunset: getRandomSkyPalette('sunset'),
    nightSky: getRandomSkyPalette('nightSky')
  };

  animationDuration = duration;
  animationStartTime = Date.now();
  isAnimationPaused = false;
  updateBackground();
}

function updateBackground() {
  if (isAnimationPaused) return;

  const elapsedTime = Date.now() - animationStartTime;
  let t = elapsedTime / animationDuration;

  if (t >= 1) {
    t = 1;
    // アニメーションを終了
    cancelAnimationFrame(animationRequestId);
  }

  // 現在の空のタイプを計算
  let accumulatedDuration = 0;
  let fromSky, toSky;
  let localT;

  for (let i = 0; i < skySequence.length; i++) {
    const sky = skySequence[i];
    const start = accumulatedDuration;
    const end = accumulatedDuration + sky.duration;

    if (t >= start && t <= end) {
      const nextSky = skySequence[i + 1];
      if (nextSky) {
        fromSky = skyColors[sky.type];
        toSky = skyColors[nextSky.type];
        localT = (t - start) / (end - start);
      } else {
        // 最後の状態に到達した場合
        fromSky = toSky = skyColors[sky.type];
        localT = 1;
      }
      break;
    }
    accumulatedDuration = end;
  }

  // 上部と下部の色を補間
  const topColor = interpolateHSL(fromSky.top, toSky.top, localT);
  const bottomColor = interpolateHSL(fromSky.bottom, toSky.bottom, localT);

  // 背景グラデーションを設定
  const gradient = `linear-gradient(to bottom, ${hslToCss(topColor)}, ${hslToCss(bottomColor)})`;
  document.body.style.setProperty('--background-gradient', gradient);

  // 次のフレームをリクエスト
  animationRequestId = requestAnimationFrame(updateBackground);
}

function pauseBackgroundAnimation() {
  if (!isAnimationPaused) {
    isAnimationPaused = true;
    animationPausedTime = Date.now();
    cancelAnimationFrame(animationRequestId);
  }
}

function resumeBackgroundAnimation() {
  if (isAnimationPaused) {
    isAnimationPaused = false;
    const pauseDuration = Date.now() - animationPausedTime;
    animationStartTime += pauseDuration; // 開始時刻を調整
    updateBackground();
  }
}

function resetBackgroundAnimation() {
  cancelAnimationFrame(animationRequestId);
  isAnimationPaused = false;
  // 新しいランダムな青空パレットを取得
  skyColors.blueSky = getRandomSkyPalette('blueSky');
  // 背景を新しい青空に設定
  const blueSky = skyColors.blueSky;
  const gradient = `linear-gradient(to bottom, ${hslToCss(blueSky.top)}, ${hslToCss(blueSky.bottom)})`;
  document.body.style.setProperty('--background-gradient', gradient);
}

// 全画面表示の制御
function requestFullscreen() {
  if (document.documentElement.requestFullscreen) {
    document.documentElement.requestFullscreen();
  } else if (document.documentElement.webkitRequestFullscreen) {
    document.documentElement.webkitRequestFullscreen();
  } else if (document.documentElement.msRequestFullscreen) {
    document.documentElement.msRequestFullscreen();
  }
}

// ページ読み込み時に全画面表示を試行（ユーザーアクションが必要な場合は無効）
document.addEventListener('DOMContentLoaded', function() {
  // モバイルデバイスでのみ全画面表示を試行
  if (/Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
    // ユーザーがページをタップした時に全画面表示を試行
    document.addEventListener('click', function() {
      requestFullscreen();
    }, { once: true });
  }
}); 