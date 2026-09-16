import React, { useState, useEffect, useCallback, useRef } from 'react';
import './App.css';

const COLUMN_STRUCTURE = [3, 4, 3, 4, 3];
const TOTAL_NODES = 17;
// '대지 42 사본'의 실제 로고 인덱스 위치
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

  const moveLogos = useCallback(() => {
    setActiveIndices(() => {
      let first = Math.floor(Math.random() * TOTAL_NODES);
      let second = Math.floor(Math.random() * TOTAL_NODES);
      while (second === first) {
        second = Math.floor(Math.random() * TOTAL_NODES);
      }
      return [first, second];
    });
  }, []);

  // 타임라인 (10초/30초)
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
      } else if (mode ===
