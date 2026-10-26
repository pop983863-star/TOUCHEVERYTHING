import React, { useState, useEffect, useCallback, useRef } from 'react';
import './App.css';

const COLUMN_STRUCTURE = [3, 4, 3, 4, 3];
const TOTAL_NODES = 17;
const INITIAL_LOGO_INDICES = [3, 13]; 

const generateGridNodes = () => {
  const nodes = [];
  const gap = 100;
  COLUMN_STRUCTURE.forEach((rowCount, colIndex) => {
    const offsetY = rowCount === 3 ? 50 : 0;
    for (let i = 0; i < rowCount; i++) {
      nodes.push({ id: nodes.length, x: colIndex * gap, y: i * gap + offsetY });
    }
  });
  return nodes;
};

function App() {
  const [view, setView] = useState('home'); 
  const [activeSection, setActiveSection] = useState('empty'); 
  const [inputText, setInputText] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [nodes] = useState(generateGridNodes());
  const [mode, setMode] = useState('static'); // 'static', 'interactive', 'auto-slideshow'
  const [activeIndices, setActiveIndices] = useState(INITIAL_LOGO_INDICES);
  const [currentBgImage, setCurrentBgImage] = useState('');
  const [dotSize, setDotSize] = useState(15);
  const [isZooming, setIsZooming] = useState(false);
  const [selectedColor, setSelectedColor] = useState(null); 
  const [isSloganHovered, setIsSloganHovered] = useState(false);
  const [isShuffling, setIsShuffling] = useState(false); // 모션 블러용

  const canvasRef = useRef(null);
  const imageBuffer = useRef(null);
  const lastInteractionTime = useRef(Date.now()); 
  const scrollContainerRef = useRef(null);
  const inputRef = useRef(null);

  const emptyRef = useRef(null);
  const overviewRef = useRef(null);
  const everythingRef = useRef(null);
  const aboutRef = useRef(null);
  const episodeRef = useRef(null);

  const preloadImage = (url) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = url; img.crossOrigin = "Anonymous";
      img.onload = () => resolve(url); img.onerror = () => resolve(url);
    });
  };

  const fetchNewImage = async (query = '', color = null) => {
    try {
      const res = await fetch(`/api/images?q=${encodeURIComponent(query)}${color ? `&color=${encodeURIComponent(color)}` : ''}`);
      const data = await res.json();
      if (data.images && data.images.length > 0) {
        const randomIndex = Math.floor(Math.random() * data.images.length);
        const nextImgUrl = data.images[randomIndex];
        await preloadImage(nextImgUrl);
        setCurrentBgImage(nextImgUrl);
      }
    } catch (e) {
      setCurrentBgImage(`https://picsum.photos/seed/${Math.random()}/1200/800`);
    }
  };

  const moveLogos = useCallback(() => {
    setIsShuffling(true);
    setActiveIndices(() => {
      let first = Math.floor(Math.random() * TOTAL_NODES);
      let second = Math.floor(Math.random() * TOTAL_NODES);
      while (second === first) second = Math.floor(Math.random() * TOTAL_NODES);
      return [first, second];
    });
    setTimeout(() => setIsShuffling(false), 600);
  }, []);

  const handleHomeInteraction = (val) => {
    setInputText(val);
    lastInteractionTime.current = Date.now();
    if (mode === 'static' && val.trim() !== '') setMode('interactive');
    const timer = setTimeout(() => { if (val.trim() !== '') fetchNewImage(val); }, 600);
    return () => clearTimeout(timer);
  };

  // --- 인트로 시퀀스 타이머 로직 ---
  useEffect(() => {
    const timer = setInterval(() => {
      if (view !== 'home' || isFocused) return;

      const now = Date.now();
      const diff = (now - lastInteractionTime.current) / 1000;

      // 1. 입력 중 10초간 무반응 시 초기화
      if (mode === 'interactive' && diff >= 10) {
        setMode('static');
        setActiveIndices(INITIAL_LOGO_INDICES);
        setInputText('');
      } 
      // 2. 초기 상태에서 10초간 무반응 시 자동 슬라이드쇼 시작
      else if (mode === 'static' && diff >= 10) {
        setMode('auto-slideshow');
        fetchNewImage('nature,forest'); // 자연 테마
      }
      // 3. 슬라이드쇼 시작 후 15초 뒤 다시 초기화
      else if (mode === 'auto-slideshow' && diff >= 25) {
        setMode('static');
        setActiveIndices(INITIAL_LOGO_INDICES);
        lastInteractionTime.current = Date.now();
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [mode, view, isFocused]);

  // 로고 셔플 타이머
  useEffect(() => {
    if (view === 'home' && mode !== 'static') {
      const interval = setInterval(() => {
        moveLogos();
        if (mode === 'auto-slideshow') fetchNewImage('nature,minimal');
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [mode, view, moveLogos]);

  // --- 내부 페이지 드로잉 및 스크롤 감지 ---
  const drawHalftone = useCallback(async () => {
    if (view !== 'internal' || !canvasRef.current || !currentBgImage) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    const img = new Image(); img.crossOrigin = "Anonymous"; img.src = currentBgImage;
    img.onload = () => {
      const container = canvas.parentElement;
      canvas.width = container.clientWidth; canvas.height = container.clientHeight;
      const scale = Math.max(canvas.width / img.width, canvas.height / img.height);
      const x = (canvas.width / 2) - (img.width / 2) * scale;
      const y = (canvas.height / 2) - (img.height / 2) * scale;
      ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
      const imageDataObj = ctx.getImageData(0, 0, canvas.width, canvas.height);
      imageBuffer.current = imageDataObj;
      if (dotSize <= 1) return;
      const data = imageDataObj.data;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let h = 0; h < canvas.height; h += dotSize) {
        for (let w = 0; w < canvas.width; w += dotSize) {
          const i = (Math.floor(h) * canvas.width + Math.floor(w)) * 4;
          ctx.fillStyle = `rgb(${data[i]},${data[i+1]},${data[i+2]})`;
          ctx.beginPath(); ctx.arc(w, h, dotSize * 0.43, 0, Math.PI * 2); ctx.fill();
        }
      }
    };
  }, [view, currentBgImage, dotSize]);

  useEffect(() => { if (view === 'internal') drawHalftone(); }, [drawHalftone, view, currentBgImage, dotSize]);

  useEffect(() => {
    if (view !== 'internal') return;
    const handleScroll = () => {
      const scrollPos = scrollContainerRef.current.scrollTop + window.innerHeight / 2;
      if (episodeRef.current && scrollPos >= episodeRef.current.offsetTop) setActiveSection('episode');
      else if (aboutRef.current && scrollPos >= aboutRef.current.offsetTop) setActiveSection('about');
      else if (everythingRef.current && scrollPos >= everythingRef.current.offsetTop) setActiveSection('everything');
      else if (overviewRef.current && scrollPos >= overviewRef.current.offsetTop) setActiveSection('overview');
      else setActiveSection('empty');
    };
    const container = scrollContainerRef.current;
    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [view]);

  const scrollTo = (ref) => {
    ref.current.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className={`app-root-container ${isSloganHovered ? 'slogan-focus-mode' : ''} view-${view}`}>
      
      {view === 'home' && (
        <div className="page-home">
          <div className="viewport">
            <div className="main-grid-wrapper">
              <div className={`layer-static ${mode === 'static' ? 'on' : ''}`}><img src="/assets/initial-grid.png" alt="Static" className="pixel-perfect" /></div>
              <div className={`layer-dynamic ${mode !== 'static' ? 'on' : ''}`}>
                {nodes.map(n => (
                  <div key={n.id} className="mask-circle" style={{ left: n.x, top: n.y, backgroundImage: currentBgImage ? `url(${currentBgImage})` : 'none', backgroundPosition: `-${n.x}px -${n.y}px`, backgroundSize: '496px 396px' }} />
                ))}
                {activeIndices.map((idx, i) => (
                  <div key={i} className={`logo-overlay-marker clickable ${isShuffling ? 'shuffling' : ''}`} 
                    style={{ transform: `translate(${nodes[idx].x}px, ${nodes[idx].y}px)` }} 
                    onClick={() => setView('internal')}>
                    <img src="/assets/logo-reference.png" alt="Logo" />
                  </div>
                ))}
              </div>
            </div>
          </div>
          <footer className="footer-layout">
            <div className="footer-container">
              <div className={`dynamic-input-area ${inputText ? 'is-active' : ''}`} onClick={() => inputRef.current?.focus()}>
                <span className="touch-text">TOUCH</span><span className="comma-text">,</span>
                <div className="input-field-wrapper">
                  <input ref={inputRef} value={inputText} onFocus={() => setIsFocused(true)} onBlur={() => setIsFocused(false)} onChange={e => handleHomeInteraction(e.target.value)} autoComplete="off" spellCheck="false" />
                  <span className="input-measure">{inputText}</span>
                </div>
              </div>
              {(mode !== 'static' || inputText) && <div className="footer-hint">TOUCH SYMBOL</div>}
            </div>
          </footer>
        </div>
      )}

      {view === 'internal' && (
        <div className="internal-layout">
          <aside className="internal-sidebar">
            <div className="sidebar-group">
              <div className={`sidebar-title ${activeSection === 'empty' ? 'active' : ''}`} onClick={() => scrollTo(emptyRef)}>TOUCH</div>
              <div className={`sidebar-comma ${activeSection === 'overview' ? 'active' : ''}`} onClick={() => scrollTo(overviewRef)}>,</div>
              <nav className="sidebar-nav">
                <button className={activeSection === 'everything' ? 'active' : ''} onClick={() => scrollTo(everythingRef)}>EVERYTHING</button>
                <button className={activeSection === 'about' ? 'active' : ''} onClick={() => scrollTo(aboutRef)}>ABOUT</button>
                <button className={activeSection === 'episode' ? 'active' : ''} onClick={() => scrollTo(episodeRef)}>EPISODE</button>
              </nav>
            </div>
          </aside>

          <main className="internal-main" ref={scrollContainerRef}>
            <section className="internal-section" ref={emptyRef}>
              <div className="internal-home-video-row">
                <div className="video-box-half"><video src="/assets/logo-loop.mp4" autoPlay loop muted playsInline className="brand-video" /></div>
                <div className="video-box-half"><video src="/assets/logo-system.mp4" autoPlay loop muted playsInline className="brand-video" /></div>
              </div>
            </section>

            <section className="internal-section section-overview" ref={overviewRef}>
               <h1 className="main-slogan">REDISCOVER THE ORDINARY</h1>
            </section>

            <section className="internal-section" ref={everythingRef}>
              <div className="everything-frame">
                <div className={`page-everything ${isZooming ? 'zooming' : ''}`}>
                  <canvas ref={canvasRef} onClick={(e) => {
                    if (isZooming || !imageBuffer.current) return;
                    const rect = canvasRef.current.getBoundingClientRect();
                    const x = Math.floor((e.clientX - rect.left) * (canvasRef.current.width / rect.width));
                    const y = Math.floor((e.clientY - rect.top) * (canvasRef.current.height / rect.height));
                    const data = imageBuffer.current.data;
                    const i = (y * canvasRef.current.width + x) * 4;
                    const hex = '#' + [data[i], data[i+1], data[i+2]].map(val => val.toString(16).padStart(2, '0')).join('');
                    setSelectedColor(hex.toUpperCase()); setIsZooming(true);
                    fe
