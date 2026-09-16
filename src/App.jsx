import React, { useState, useEffect, useCallback, useRef } from 'react';
import './App.css';

const COLUMN_STRUCTURE = [3, 4, 3, 4, 3];
const TOTAL_NODES = 17;
// 초기 이미지(대지 42) 상의 로고 위치와 동일하게 설정
const INITIAL_LOGO_INDICES = [3, 13]; 

const generateGridNodes = () => {
  const nodes = [];
  const gap = 100; // 원 중심 간의 간격
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
  const [mode, setMode] = useState('static'); // 'static', 'interactive', 'slideshow'
  
  // 2개의 로고 위치 관리
  const [activeIndices, setActiveIndices] = useState(INITIAL_LOGO_INDICES);
  const [currentBgImage, setCurrentBgImage] = useState('');
  const lastActivity = useRef(Date.now());

  const fetchNewImage = async (query = 'abstract') => {
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
    if (mode === 'static') {
      setMode('interactive');
      fetchNewImage(val);
    }
  };

  // 2개의 로고를 무작위 위치로 이동시키는 함수
  const moveLogos = useCallback(() => {
    setActiveIndices(() => {
      const first = Math.floor(Math.random() * TOTAL_NODES);
      let second = Math.floor(Math.random() * TOTAL_NODES);
      while (second === first) { // 두 로고가 겹치지 않게 함
        second = Math.floor(Math.random() * TOTAL_NODES);
      }
      return [first, second];
    });
  }, []);

  // 타임라인 시퀀스 (10초/30초)
  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      const diff = (now - lastActivity.current) / 1000;

      if (mode === 'interactive' && diff >= 10) {
        setMode('static');
        setActiveIndices(INITIAL_LOGO_INDICES);
      } else if (mode === 'static' && diff >= 20 && diff < 50) {
        if (mode !== 'slideshow') {
          setMode('slideshow');
          fetchNewImage('minimal');
        }
      } else if (mode === 'slideshow' && diff >= 50) {
        setMode('static');
        setActiveIndices(INITIAL_LOGO_INDICES);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [mode]);

  // 로고 이동 타이머 (애니메이션 모드일 때)
  useEffect(() => {
    if (mode !== 'static') {
      const interval = setInterval(() => {
        moveLogos();
        if (mode === 'slideshow') fetchNewImage('art');
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [mode, moveLogos]);

  return (
    <div className={`brand-container mode-${mode}`}>
      <main className="viewport">
        <div className="grid-wrapper">
          
          {/* 모드 1: 초기 대지 42 정적 이미지 */}
          <div className={`static-layer ${mode === 'static' ? 'visible' : ''}`}>
            <img src="/assets/initial-grid.png" alt="Static Grid" />
          </div>

          {/* 모드 2 & 3: 인터랙티브 마스킹 시스템 */}
          <div className={`dynamic-layer ${mode !== 'static' ? 'visible' : ''}`}>
            {nodes.map((node) => (
              <div 
                key={node.id} 
                className="mask-circle"
                style={{ 
                  left: node.x, 
                  top: node.y,
                  backgroundImage: `url(${currentBgImage})`,
                  backgroundPosition: `-${node.x}px -${node.y}px`,
                  backgroundSize: '496px 396px'
                }}
              />
            ))}
            
            {/* 움직이는 2개의 로고 마커 */}
            {activeIndices.map((idx, i) => (
              <div 
                key={`marker-${i}`}
                className="moving-logo"
                style={{ 
                  transform: `translate(${nodes[idx]?.x || 0}px, ${nodes[idx]?.y || 0}px)` 
                }}
              >
                <img src="/assets/logo-reference.png" alt="Logo" />
              </div>
            ))}
          </div>

        </div>
      </main>

      <footer className="footer">
        <form onSubmit={(e) => { e.preventDefault(); lastActivity.current = Date.now(); fetchNewImage(inputText); }}>
          <input 
            value={inputText} 
            onChange={(e) => handleInteraction(e.target.value)} 
            placeholder="TYPE TO START INTERACTION" 
          />
        </form>
      </footer>
    </div>
  );
}

export default App;
