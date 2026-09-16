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
  const [inputText, setInputText] = useState('');
  const [nodes] = useState(generateGridNodes());
  const [mode, setMode] = useState('static'); 
  const [activeIndices, setActiveIndices] = useState(INITIAL_LOGO_INDICES);
  const [currentBgImage, setCurrentBgImage] = useState('');
  const lastActivity = useRef(Date.now());

  // 이미지 검색 핵심 함수
  const fetchNewImage = async (query = 'abstract') => {
    console.log("이미지 검색 시도:", query); // 브라우저 개발자 도구(F12) 콘솔에서 확인 가능
    try {
      // 쿼리를 안전하게 인코딩하여 호출
      const res = await fetch(`/api/images?q=${encodeURIComponent(query)}`);
      if (!res.ok) throw new Error("API 호출 실패");
      
      const data = await res.json();
      if (data.images && data.images.length > 0) {
        // 성공 시 무작위 이미지 설정
        const newImg = data.images[Math.floor(Math.random() * data.images.length)];
        setCurrentBgImage(newImg);
        console.log("이미지 로드 성공:", newImg);
      } else {
        throw new Error("이미지 데이터 없음");
      }
    } catch (e) {
      console.error("이미지 로드 실패, 대체 이미지 사용:", e);
      // 실패 시 작동 확인을 위한 랜덤 이미지
      setCurrentBgImage(`https://picsum.photos/seed/${Math.random()}/1200/800`);
    }
  };

  // 타이핑 시 호출되는 함수
  const handleInteraction = (val) => {
    setInputText(val);
    lastActivity.current = Date.now();
    
    // 처음 타이핑 시작할 때 모드 전환 및 이미지 호출
    if (mode === 'static' && val.trim() !== '') {
      setMode('interactive');
      fetchNewImage(val);
    }
  };

  const moveLogos = useCallback(() => {
    setActiveIndices(() => {
      let first = Math.floor(Math.random() * TOTAL_NODES);
      let second = Math.floor(Math.random() * TOTAL_NODES);
      while (second === first) second = Math.floor(Math.random() * TOTAL_NODES);
      return [first, second];
    });
  }, []);

  // 시퀀스 제어 (10초/30초)
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

  // 로고 이동 및 이미지 자동 교체
  useEffect(() => {
    if (mode !== 'static') {
      const interval = setInterval(() => {
        moveLogos();
        // 인터랙티브 모드나 슬라이드쇼일 때 주기적으로 이미지 교체
        fetchNewImage(inputText || 'art');
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [mode, moveLogos, inputText]);

  return (
    <div className="brand-container">
      <main className="viewport">
        <div className="main-grid-wrapper">
          
          <div className={`layer-static ${mode === 'static' ? 'on' : ''}`}>
            <img src="/assets/initial-grid.png" alt="Static Grid" />
          </div>

          <div className={`layer-dynamic ${mode !== 'static' ? 'on' : ''}`}>
            {nodes.map((node) => (
              <div 
                key={node.id} 
                className="mask-circle"
                style={{ 
                  left: `${node.x}px`, 
                  top: `${node.y}px`,
                  backgroundImage: `url(${currentBgImage})`,
                  backgroundPosition: `-${node.x}px -${node.y}px`,
                  backgroundSize: '496px 396px' 
                }}
              />
            ))}
            
            {activeIndices.map((idx, i) => (
              <div 
                key={`marker-${i}`}
                className="moving-logo-marker"
                style={{ transform: `translate(${nodes[idx].x}px, ${nodes[idx].y}px)` }}
              >
                <img src="/assets/logo-reference.png" alt="Logo" />
              </div>
            ))}
          </div>

        </div>
      </main>

      <footer className="footer">
        <form onSubmit={(e) => { e.preventDefault(); fetchNewImage(inputText); }}>
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
