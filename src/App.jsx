import React, { useState, useEffect, useCallback } from 'react';
import './App.css';

const COLUMN_STRUCTURE = [3, 4, 3, 4, 3];
const TOTAL_NODES = 17;
const INITIAL_LOGO_INDICES = [3, 13]; // 초기 화면 로고 위치 (2열 상단, 4열 하단)

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
  const [isStarted, setIsStarted] = useState(false); // 인터랙션 시작 여부
  const [activeIndex, setActiveIndex] = useState(0);
  const [currentBgImage, setCurrentBgImage] = useState('');

  // 새로운 이미지 가져오기
  const fetchNewImage = async (query = 'nature') => {
    try {
      const res = await fetch(`/api/images?q=${query}`);
      const data = await res.json();
      if (data.images?.length > 0) {
        const randomImg = data.images[Math.floor(Math.random() * data.images.length)];
        setCurrentBgImage(randomImg);
      }
    } catch (e) {
      setCurrentBgImage(`https://picsum.photos/1200/800?sig=${Math.random()}`);
    }
  };

  // 텍스트 입력 시 시스템 활성화
  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputText(value);
    if (!isStarted && value.trim() !== '') {
      setIsStarted(true);
      fetchNewImage(value);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    fetchNewImage(inputText || 'minimal');
  };

  // 로고 이동 시 이미지 자동 교체 (활성화된 상태에서만)
  useEffect(() => {
    if (isStarted) {
      const words = (inputText || "TOUCH").split(' ');
      fetchNewImage(words[Math.floor(Math.random() * words.length)]);
    }
  }, [activeIndex, isStarted]);

  // 자동 이동 타이머 (활성화된 상태에서만)
  useEffect(() => {
    if (isStarted) {
      const interval = setInterval(() => {
        setActiveIndex(prev => (prev + 1) % TOTAL_NODES);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [isStarted]);

  return (
    <div className="brand-container">
      <main className="viewport">
        <div className="grid-system">
          {nodes.map((node, i) => {
            const isInitialLogo = !isStarted && INITIAL_LOGO_INDICES.includes(i);
            
            return (
              <div 
                key={node.id} 
                className={`node ${isInitialLogo ? 'static-logo' : ''}`}
                style={{ 
                  left: node.x, 
                  top: node.y,
                  // 시작된 후에는 모든 원에 마스킹 이미지 적용
                  backgroundImage: isStarted ? `url(${currentBgImage})` : 'none',
                  backgroundPosition: `-${node.x}px -${node.y}px`,
                  backgroundSize: '496px 396px',
                  backgroundColor: isStarted ? 'transparent' : (isInitialLogo ? 'transparent' : '#D9D9D9')
                }}
                onClick={() => isStarted && setActiveIndex(i)}
              >
                {/* 초기 상태의 정적 로고 이미지 */}
                {isInitialLogo && <img src="/assets/logo-reference.png" className="inner-logo" alt="Logo" />}
              </div>
            );
          })}

          {/* 활성화된 후 움직이는 로고 마커 */}
          {isStarted && (
            <div 
              className="logo-marker"
              style={{ transform: `translate(${nodes[activeIndex].x}px, ${nodes[activeIndex].y}px)` }}
            >
              <img src="/assets/logo-reference.png" alt="Active Logo" />
            </div>
          )}
        </div>
      </main>

      <footer className="footer">
        <form onSubmit={handleFormSubmit}>
          <input 
            value={inputText} 
            onChange={handleInputChange} 
            placeholder="TYPE TO START..." 
            autoFocus
          />
          {/* 버튼 문구 삭제 */}
          <button type="submit" style={{ display: 'none' }}></button>
        </form>
      </footer>
    </div>
  );
}

export default App;
