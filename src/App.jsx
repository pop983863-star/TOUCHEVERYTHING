import React, { useState, useEffect, useCallback, useRef } from 'react';
import './App.css';

const COLUMN_STRUCTURE = [3, 4, 3, 4, 3];
const TOTAL_NODES = 17;
const DEFAULT_TEXT = "TOUCH EVERYTHING";

// 3-4-3-4-3 그리드 좌표 생성 로직
const generateGridNodes = () => {
  const nodes = [];
  const gapX = 100; // 가로 간격
  const gapY = 100; // 세로 간격
  
  COLUMN_STRUCTURE.forEach((rowCount, colIndex) => {
    // 3개짜리 열은 수직 중앙 정렬을 위해 50px 오프셋 추가
    const offsetY = rowCount === 3 ? 50 : 0;
    for (let i = 0; i < rowCount; i++) {
      nodes.push({
        id: nodes.length,
        x: colIndex * gapX,
        y: i * gapY + offsetY,
      });
    }
  });
  return nodes;
};

function App() {
  const [inputText, setInputText] = useState('');
  const [nodes, setNodes] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(false);

  // 데이터 생성 (텍스트, 이미지, 빈 공간 랜덤 배치)
  const generateLayout = useCallback(async (textToUse = DEFAULT_TEXT) => {
    setLoading(true);
    const coords = generateGridNodes();
    const words = textToUse.toUpperCase().split(/\s+/).filter(Boolean);
    
    // Pexels 이미지 가져오기
    let imageUrls = [];
    try {
      const query = words[Math.floor(Math.random() * words.length)] || 'minimal';
      const res = await fetch(`/api/images?q=${query}`);
      const data = await res.json();
      imageUrls = data.images || [];
    } catch (e) {
      console.error("API Error, using placeholders");
    }

    // 타입 섞기 (8개 텍스트, 5개 이미지, 4개 빈칸)
    let types = [
      ...Array(8).fill('text'),
      ...Array(5).fill('image'),
      ...Array(4).fill('empty')
    ].sort(() => Math.random() - 0.5);

    let wIdx = 0, iIdx = 0;
    const newNodes = coords.map((coord, i) => {
      const type = types[i];
      let content = null;
      if (type === 'text') content = words[wIdx++ % words.length] || '•';
      if (type === 'image') content = imageUrls[iIdx++ % imageUrls.length] || `https://picsum.photos/seed/${i}/200`;
      return { ...coord, type, content };
    });

    setNodes(newNodes);
    setLoading(false);
  }, []);

  useEffect(() => { generateLayout(); }, [generateLayout]);

  // 마커 자동 이동 (6초마다)
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex(prev => (prev + 1) % TOTAL_NODES);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="brand-container">
      <header className="info">SYSTEM GRID 3-4-3-4-3 / MOTION IDENTITY</header>
      
      <main className="viewport">
        <div className="grid-system">
          {/* 17개 기본 회색 원 */}
          {nodes.map((node, i) => (
            <div 
              key={node.id} 
              className={`node ${node.type} ${activeIndex === i ? 'active' : ''}`}
              style={{ left: node.x, top: node.y }}
              onClick={() => setActiveIndex(i)}
            >
              {node.type === 'text' && <span className="label">{node.content}</span>}
              {node.type === 'image' && <img src={node.content} alt="" className="node-img" />}
            </div>
          ))}

          {/* 로고 이미지 마커 (쉼표 로고) */}
          {nodes[activeIndex] && (
            <div 
              className="logo-marker"
              style={{ 
                transform: `translate(${nodes[activeIndex].x}px, ${nodes[activeIndex].y}px)` 
              }}
            >
              <img src="/assets/logo-reference.jpg" alt="Active Logo" />
            </div>
          )}
        </div>
      </main>

      <footer className="footer">
        <form onSubmit={(e) => { e.preventDefault(); generateLayout(inputText || DEFAULT_TEXT); }}>
          <input 
            value={inputText} 
            onChange={(e) => setInputText(e.target.value)} 
            placeholder="TYPE TO GENERATE..." 
          />
          <button type="submit">{loading ? 'WAIT' : 'GENERATE'}</button>
        </form>
      </footer>
    </div>
  );
}

export default App;
