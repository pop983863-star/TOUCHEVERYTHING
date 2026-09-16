import React, { useState, useEffect, useCallback, useRef } from 'react';
import './App.css';

const COLUMN_STRUCTURE = [3, 4, 3, 4, 3];
const TOTAL_NODES = 17;

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
  const [mode, setMode] = useState('static'); // 'static', 'interactive', 'slideshow'
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
    if (mode === 'static') {
      setMode('interactive');
      fetchNewImage(val);
    }
  };

  // 10초/30초 타임라인 시퀀스
  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      const diff = (now - lastActivity.current) / 1000;

      if (mode === 'interactive' && diff >= 10) {
        setMode('static'); // 10초 무반응 시 '대지 42' 이미지로 복귀
      } else if (mode === 'static' && diff >= 20 && diff < 50) {
        if (mode !== 'slideshow') {
          setMode('slideshow');
          fetchNewImage('minimal');
        }
      } else if (mode === 'slideshow' && diff >= 50) {
        setMode('static');
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [mode]);

  useEffect(() => {
    if (mode !== 'static') {
      const interval = setInterval(() => {
        setActiveIndex(prev => (prev + 1) % TOTAL_NODES);
        if (mode === 'slideshow') fetchNewImage('abstract');
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [mode]);

  return (
    <div className={`brand-container mode-${mode}`}>
      <main className="viewport">
        <div className="grid-wrapper">
          
          {/* [모드 1] 대지 42 사본: 정적 고화질 이미지 (초기 상태) */}
          <div className={`initial-static-view ${mode === 'static' ? 'visible' : ''}`}>
            <img src="/assets/initial-grid.png" alt="Initial Design" />
          </div>

          {/* [모드 2 & 3] 인터랙티브 그리드: 마스킹 시스템 */}
          <div className={`dynamic-system ${mode !== 'static' ? 'visible' : ''}`}>
            {nodes.map((node, i) => (
              <div 
                key={node.id} 
                className="mask-node"
                style={{ 
                  left: node.x, 
                  top: node.y,
                  backgroundImage: `url(${currentBgImage})`,
                  backgroundPosition: `-${node.x}px -${node.y}px`,
                  backgroundSize: '496px 396px'
                }}
              />
            ))}
            
            {/* 움직이는 로고 마커 (원과 1:1 크기) */}
            <div 
              className="moving-logo"
              style={{ transform: `translate(${nodes[activeIndex].x}px, ${nodes[activeIndex].y}px)` }}
            >
              <img src="/assets/logo-reference.png" alt="Logo" />
            </div>
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
