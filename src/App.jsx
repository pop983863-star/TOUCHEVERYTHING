import React, { useState, useEffect, useCallback, useRef } from 'react';
import './App.css';

const COLUMN_STRUCTURE = [3, 4, 3, 4, 3];
const TOTAL_NODES = 17;
// '대지 42 사본' 이미지의 로고 위치 (2열 상단, 4열 하단)
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
  const [inputText, setInputText] = useState('');
  const [nodes] = useState(generateGridNodes());
  const [mode, setMode] = useState('logo'); // 'logo', 'interactive', 'idle-image'
  const [activeIndex, setActiveIndex] = useState(0);
  const [currentBgImage, setCurrentBgImage] = useState('');
  const lastActivity = useRef(Date.now());

  const fetchNewImage = async (query = 'nature') => {
    try {
      const res = await fetch(`/api/images?q=${query}`);
      const data = await res.json();
      if (data.images?.length > 0) {
        setCurrentBgImage(data.images[Math.floor(Math.random() * data.images.length)]);
      }
    } catch (e) {
      setCurrentBgImage(`https://picsum.photos/1200/800?sig=${Math.random()}`);
    }
  };

  // 모드 변경 및 인터랙션 핸들러
  const startInteraction = (val) => {
    setInputText(val);
    lastActivity.current = Date.now();
    if (mode !== 'interactive') {
      setMode('interactive');
      fetchNewImage(val);
    }
  };

  // 타이머 로직 (10초/30초 시퀀스)
  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      const diff = (now - lastActivity.current) / 1000;

      if (mode === 'interactive' && diff >= 10) {
        setMode('logo'); // 10초간 입력 없으면 로고로 복귀
      } else if (mode === 'logo' && diff >= 20) {
        setMode('idle-image'); // 로고 상태에서 10초 더(총 20초) 지나면 이미지 모드
        fetchNewImage('minimal');
        setTimeout(() => {
          if (Date.now() - lastActivity.current >= 50000) setMode('logo');
        }, 30000); // 30초 동안 유지
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [mode]);

  // 자동 마커 이동 (interactive 혹은 idle-image 모드일 때)
  useEffect(() => {
    if (mode !== 'logo') {
      const interval = setInterval(() => {
        setActiveIndex(prev => (prev + 1) % TOTAL_NODES);
        if (mode === 'idle-image') fetchNewImage('art');
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [mode]);

  return (
    <div className={`brand-container mode-${mode}`}>
      <main className="viewport">
        <div className="grid-system">
          {nodes.map((node, i) => {
            const isInitialLogo = INITIAL_LOGO_INDICES.includes(i);
            const showMask = mode === 'interactive' || mode === 'idle-image';
            
            return (
              <div 
                key={node.id} 
                className={`node ${mode === 'logo' && isInitialLogo ? 'is-logo' : ''}`}
                style={{ 
                  left: node.x, 
                  top: node.y,
                  backgroundImage: showMask ? `url(${currentBgImage})` : 'none',
                  backgroundPosition: `-${node.x}px -${node.y}px`,
                  backgroundSize: '496px 396px',
                  backgroundColor: mode === 'logo' && !isInitialLogo ? '#D9D9D9' : 'transparent'
                }}
              >
                {mode === 'logo' && isInitialLogo && (
                  <img src="/assets/logo-reference.png" className="logo-img" alt="Logo" />
                )}
              </div>
            );
          })}

          {/* 움직이는 로고 마커 */}
          {mode !== 'logo' && (
            <div 
              className="logo-marker"
              style={{ transform: `translate(${nodes[activeIndex].x}px, ${nodes[activeIndex].y}px)` }}
            >
              <img src="/assets/logo-reference.png" alt="Marker" />
            </div>
          )}
        </div>
      </main>

      <footer className="footer">
        <form onSubmit={(e) => { e.preventDefault(); lastActivity.current = Date.now(); fetchNewImage(inputText); }}>
          <input 
            value={inputText} 
            onChange={(e) => startInteraction(e.target.value)} 
            placeholder="TYPE TO START..." 
          />
        </form>
      </footer>
    </div>
  );
}

export default App;
