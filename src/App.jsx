import React, { useState, useEffect, useCallback } from 'react';
import './App.css';

const COLUMN_STRUCTURE = [3, 4, 3, 4, 3];
const TOTAL_NODES = 17;
const DEFAULT_TEXT = "TOUCH EVERYTHING";

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
  const [nodes, setNodes] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [currentBgImage, setCurrentBgImage] = useState('');
  const [loading, setLoading] = useState(false);

  // 새로운 이미지 한 장을 가져오는 함수
  const fetchNewImage = async (query = 'nature') => {
    try {
      const res = await fetch(`/api/images?q=${query}`);
      const data = await res.json();
      if (data.images && data.images.length > 0) {
        // 검색 결과 중 무작위 하나 선택
        const randomImg = data.images[Math.floor(Math.random() * data.images.length)];
        setCurrentBgImage(randomImg);
      }
    } catch (e) {
      setCurrentBgImage(`https://picsum.photos/1200/800?sig=${Math.random()}`);
    }
  };

  const generateLayout = useCallback(async (textToUse = DEFAULT_TEXT) => {
    setLoading(true);
    const coords = generateGridNodes();
    const words = textToUse.toUpperCase().split(/\s+/).filter(Boolean);
    
    await fetchNewImage(words[0] || 'minimal');

    // 타입 배치: 이번에는 이미지를 더 많이 배치하여 마스킹 효과를 극대화 (8개 이미지, 5개 텍스트, 4개 빈칸)
    let types = [...Array(8).fill('image'), ...Array(5).fill('text'), ...Array(4).fill('empty')]
                .sort(() => Math.random() - 0.5);

    let wIdx = 0;
    setNodes(coords.map((c, i) => ({
      ...c,
      type: types[i],
      content: types[i] === 'text' ? (words[wIdx++ % words.length] || '•') : null
    })));
    setLoading(false);
  }, []);

  useEffect(() => { generateLayout(); }, [generateLayout]);

  // 로고 마커가 이동할 때마다 배경 이미지 교체
  useEffect(() => {
    const words = (inputText || DEFAULT_TEXT).split(' ');
    fetchNewImage(words[Math.floor(Math.random() * words.length)]);
  }, [activeIndex]);

  // 자동 이동 타이머
  useEffect(() => {
    const interval = setInterval(() => setActiveIndex(prev => (prev + 1) % TOTAL_NODES), 6000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="brand-container">
      <main className="viewport">
        <div className="grid-system">
          {nodes.map((node, i) => (
            <div 
              key={node.id} 
              className={`node ${node.type} ${activeIndex === i ? 'active' : ''}`}
              style={{ 
                left: node.x, 
                top: node.y,
                // 이미지 타입일 경우 단일 배경 이미지와 좌표 설정
                backgroundImage: node.type === 'image' ? `url(${currentBgImage})` : 'none',
                backgroundPosition: `-${node.x}px -${node.y}px`,
                backgroundSize: '480px 380px' // 그리드 전체 크기에 맞춤
              }}
              onClick={() => setActiveIndex(i)}
            >
              {node.type === 'text' && <span className="label">{node.content}</span>}
            </div>
          ))}

          {/* 로고 마커 (검은 원 로고) */}
          <div 
            className="logo-marker"
            style={{ transform: `translate(${nodes[activeIndex]?.x || 0}px, ${nodes[activeIndex]?.y || 0}px)` }}
          >
            <img src="/assets/logo-reference.jpg" alt="Logo" />
          </div>
        </div>
      </main>

      <footer className="footer">
        <form onSubmit={(e) => { e.preventDefault(); generateLayout(inputText); }}>
          <input value={inputText} onChange={e => setInputText(e.target.value)} placeholder="TYPE TO GENERATE..." />
          <button type="submit">{loading ? '...' : 'GENERATE'}</button>
        </form>
      </footer>
    </div>
  );
}

export default App;
