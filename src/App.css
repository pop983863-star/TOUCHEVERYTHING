@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;700&display=swap');

:root {
  --node-size: 96px;
  --grid-w: 496px;
  --grid-h: 396px;
  --sidebar-w: 22%; /* 좌측 비율 축소 */
  --content-w: 78%; /* 우측 비율 확장 */
}

body {
  margin: 0; background-color: #ffffff;
  font-family: 'IBM Plex Sans', sans-serif;
  font-weight: 400; overflow: hidden;
  -webkit-tap-highlight-color: transparent;
}

.app-root-container { width: 100vw; height: 100vh; position: relative; }

/* --- HOME VIEW (1:50 STABILITY) --- */
.page-home { width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; }
.viewport { flex: 1; display: flex; align-items: center; justify-content: center; width: 100%; padding-bottom: 10vh; }
.main-grid-wrapper { position: relative; width: var(--grid-w); height: var(--grid-h); }
.layer-static, .layer-dynamic { position: absolute; top: 0; left: 0; width: 100%; height: 100%; opacity: 0; transition: opacity 1.5s ease-in-out; pointer-events: none; }
.on { opacity: 1 !important; pointer-events: auto !important; z-index: 10; }
.pixel-perfect { width: 100%; height: 100%; object-fit: fill; display: block; }
.mask-circle { position: absolute; width: var(--node-size); height: var(--node-size); border-radius: 50%; background-repeat: no-repeat; background-size: var(--grid-w) var(--grid-h); background-color: #f9f9f9; transition: background-image 1.5s ease-in-out; }
.logo-overlay-marker { position: absolute; width: var(--node-size); height: var(--node-size); z-index: 20; transition: transform 0.85s cubic-bezier(0.16, 1, 0.3, 1); display: flex; align-items: center; justify-content: center; }
.logo-overlay-marker img { width: 100%; height: 100%; border-radius: 50%; object-fit: cover; transform: scale(1.02); }
.footer-layout { position: absolute; bottom: 80px; width: 100%; display: flex; justify-content: center; }
.dynamic-input-area { display: inline-flex; align-items: center; justify-content: center; padding: 5px 0; min-width: 0; position: relative; transition: all 0.5s ease; }
.dynamic-input-area.is-active { border-bottom: 0.5px solid #111; }
.touch-text { font-size: 9px; letter-spacing: 0.25em; color: #111; margin-right: -0.25em; }
.comma-text { width: 0; opacity: 0; transition: all 0.3s ease; display: inline-block; overflow: hidden; font-size: 9px; color: #111; }
.dynamic-input-area.is-active .comma-text { width: 7px; opacity: 1; margin-right: 2px; margin-left: 0.25em; }
input { font-size: 9px; font-weight: 400; background: transparent; border: none; outline: none; text-transform: uppercase; letter-spacing: 0.2em; caret-color: #111; }
.input-measure { font-size: 9px; visibility: hidden; white-space: pre; letter-spacing: 0.2em; padding-right: 5px; }

/* --- INTERNAL SPLIT LAYOUT --- */
.internal-layout { display: flex; width: 100vw; height: 100vh; background: #fff; }

.internal-sidebar {
  width: var(--sidebar-w);
  height: 100vh;
  display: flex;
  align-items: center;
  padding-left: 5vw;
  position: fixed;
  left: 0; top: 0;
  z-index: 100;
}

.sidebar-group { display: flex; flex-direction: column; align-items: flex-start; gap: 4px; }
.sidebar-title { font-size: 20px; font-weight: 700; cursor: pointer; letter-spacing: -0.01em; }
.sidebar-comma { font-size: 18px; color: #eee; margin-top: -8px; margin-bottom: 8px; transition: color 0.4s; }
.sidebar-comma.active { color: #000; } /* 쉼표 인덱스 활성화 */

.sidebar-nav { display: flex; flex-direction: column; gap: 8px; }
.sidebar-nav button {
  background: none; border: none; padding: 0; text-align: left;
  font-family: 'IBM Plex Sans', sans-serif; font-weight: 700; font-size: 16px;
  color: #eee; cursor: pointer; transition: color 0.3s;
}
.sidebar-nav button.active, .sidebar-nav button:hover { color: #000; }

/* 우측 콘텐츠 영역 확장 */
.internal-main {
  width: var(--content-w);
  height: 100vh;
  margin-left: var(--sidebar-w);
  overflow-y: scroll;
  scroll-behavior: smooth;
  scrollbar-width: none;
}
.internal-main::-webkit-scrollbar { display: none; }

.internal-section {
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 0;
}

/* OVERVIEW SLOGAN STYLE (desktop-10.jpg 반영) */
.main-slogan {
  font-size: 24px;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: #000;
  text-align: center;
}

/* EVERYTHING FRAME STYLE (desktop-11.jpg 반영) */
.everything-frame {
  width: 85%;
  max-width: 900px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.page-everything {
  width: 100%;
  aspect-ratio: 16 / 9; /* 시각적 프레임 비율 고정 */
  position: relative;
  overflow: hidden;
  background: #fcfcfc;
  border: 0.5px solid #eee; /* 아주 미세한 프레임 선 */
}

canvas { display: block; width: 100%; height: 100%; }

/* [수정] 덴시티 바 소형화 및 정중앙 배치 */
.halftone-controls-outer {
  position: absolute;
  bottom: 25px;
  width: 100%;
  display: flex;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.4s;
}
.page-everything:hover .halftone-controls-outer { opacity: 1; }

.halftone-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  padding: 8px 15px;
  background: rgba(255, 255, 255, 0.98);
  box-shadow: 0 4px 15px rgba(0,0,0,0.04);
  border-radius: 4px;
}
.halftone-box span { font-size: 7px; font-weight: 700; letter-spacing: 0.1em; color: #555; }
.halftone-box input[type="range"] { width: 70px; height: 1px; -webkit-appearance: none; background: #eee; outline: none; }
.halftone-box input[type="range"]::-webkit-slider-thumb { -webkit-appearance: none; width: 6px; height: 6px; background: #000; border-radius: 50%; }

.everything-zoom-hint { font-size: 9px; letter-spacing: 0.2em; color: #bbb; text-transform: uppercase; }

/* ABOUT & EPISODE */
.about-editorial-wrap { display: flex; flex-direction: column; align-items: center; text-align: center; max-width: 500px; }
.about-date { font-size: 11px; color: #999; margin-bottom: 25px; }
.about-question { font-size: 22px; font-weight: 700; margin-bottom: 35px; }
.about-body { font-size: 13px; line-height: 2.2; color: #444; }
.about-slogan-text { margin-top: 80px; padding: 30px; font-size: 15px; font-weight: 700; transition: all 0.8s ease; margin-bottom: 80px; }

.sub-video-container { display: flex; flex-direction: column; gap: 80px; align-items: center; }
.video-box { width: var(--grid-w); height: var(--grid-h); background: #f8f8f8; }
.brand-video { width: 100%; height: 100%; object-fit: cover; }

.home-back-btn { position: fixed; right: 30px; bottom: 30px; width: 45px; height: 45px; z-index: 500; cursor: pointer; }
.home-back-btn img { width: 100%; height: 100%; border-radius: 50%; object-fit: cover; }

.slogan-focus-mode .internal-layout, .slogan-focus-mode .internal-section { background-color: #000; }
.slogan-focus-mode .about-slogan-text { color: #fff; transform: scale(1.03); }
.slogan-focus-mode .internal-sidebar, .slogan-focus-mode .about-date, .slogan-focus-mode .about-question, .slogan-focus-mode .about-body, .slogan-focus-mode .home-back-btn { opacity: 0 !important; pointer-events: none; }
