import React, { useState, useEffect, useCallback, useRef } from 'react';
import './App.css';

const COLUMN_STRUCTURE = [3, 4, 3, 4, 3];
const TOTAL_NODES = 17;
const INITIAL_LOGO_INDICES = [3, 13]; // '대지 42 사본'의 로고 위치

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
  const [mode, setMode] = useState('initial'); // 'initial', 'interactive', 'idle-show'
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

  const handleInteraction = (val) => {
    setInputText(val);
    lastActivity.current = Date.now();
    if (mode !== 'interactive') {
      setMode('interactive');
      fetchNewImage(val);
    }
  };

  // 타임라인 시퀀스 로직
  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      const diff = (now - lastActivity.current) / 1000;

      if (mode === 'interactive' && diff >= 10) {
        setMode('initial'); // 10초 무반응 시 초기 로고 상태로
      } else if (mode === 'initial' && diff >= 20 && diff < 50) {
        // 로고 상태 복귀 후 10초 더 지나면 (총 20초 무반응) 이미지 쇼 시작
        if (mode !== 'idle-show') {
          setMode('idle-show');
          fetchNewImage('minimal');
        }
      } else if (mode === 'idle-show' && diff >= 50) {
        // 이미지 쇼 30초 진행 후 다시 초기화
        setMode('initial');
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [mode]);

  useEffect(() => {
    if (mode !== 'initial') {
      const interval = setInterval(() => {
        setActiveIndex(prev => (prev + 1) % TOTAL_NODES);
        if (mode === 'idle-show') fetchNewImage('abstract');
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [mode]);

  return (
    <div className={`brand-container state-${mode}`}>
      <main className="viewport">
        <div className="grid-system">
          {nodes.map((node, i) => {
            const isInitialLogo = INITIAL_LOGO_INDICES.includes(i);
            const isMasking = mode === 'interactive' || mode === 'idle-show';
            
            return (
              <div 
                key={node.id} 
                className="node"
                style={{ 
                  left: node.x, 
                  top: node.y,
                  backgroundImage: isMasking ? `url(${currentBgImage})` : 'none',
                  backgroundPosition: `-${node.x}px -${node.y}px`,
                  backgroundSize: '496px 396px',
                  backgroundColor: !isMasking && !isInitialLogo ? '#D9D9D9' : 'transparent'
                }}
              >
                {/* 초기 상태(initial)에서 특정 위치에만 로고 표시 */}
                {mode === 'initial' && isInitialLogo && (
                  <img src="/assets/logo-reference.png" className="logo-img-fit" alt="Logo" />
                )}
              </div>
            );
          })}

          {/* 인터랙션 시에만 나타나는 움직이는 로고 마커 */}
          {mode !== 'initial' && (
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
            onChange={(e) => handleInteraction(e.target.value)} 
            placeholder="TYPE TO INTERACT" 
          />
        </form>
      </footer>
    </div>
  );
}

export default App;
