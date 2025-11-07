'use client';

import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';

interface Hotspot {
  x: number;
  y: number;
  z: number;
  target: string;
  label: string;
}

interface SceneData {
  id: string;
  name: string;
  description: string;
  image: string;
  thumb: string;
  hotspots: Hotspot[];
}

interface HotspotElementData {
  element: HTMLDivElement;
  position: THREE.Vector3;
}

const scenes: SceneData[] = [
  {
    id: 'scene1',
    name: 'Church Exterior',
    description: 'Beautiful Gothic architecture with stunning spires and ornate details.',
    image: '/img/1.jpg',
    thumb: '/img/1.jpg',
    hotspots: [
      { x: -200, y: 0, z: 300, target: 'scene2', label: 'Enter Sanctuary' },
      { x: 300, y: 0, z: 200, target: 'scene2', label: 'View Main Entrance' }
    ]
  },
  {
    id: 'scene2',
    name: 'Church Sanctuary',
    description: 'The sacred worship space with beautiful stained glass windows and altar.',
    image: '/img/2.jpg',
    thumb: '/img/2.jpg',
    hotspots: [
      { x: 250, y: 0, z: -300, target: 'scene1', label: 'Exit to Exterior' },
      { x: -300, y: 0, z: 200, target: 'scene1', label: 'View Altar' }
    ]
  }
];

const galleryImages: string[] = ['/img/1.jpg', '/img/2.jpg'];

const PanoramaViewer: React.FC = () => {
  const [mounted, setMounted] = useState(false);
  const [currentSceneIndex, setCurrentSceneIndex] = useState<number>(0);
  const [isMusicPlaying, setIsMusicPlaying] = useState<boolean>(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState<boolean>(false);
  const [currentGalleryIndex, setCurrentGalleryIndex] = useState<number>(0);
  const [isAutoRotate, setIsAutoRotate] = useState<boolean>(true);

  const containerRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const hotspotElementsRef = useRef<HotspotElementData[]>([]);
  
  const lonRef = useRef<number>(0);
  const latRef = useRef<number>(0);
  const onPointerDownLonRef = useRef<number>(0);
  const onPointerDownLatRef = useRef<number>(0);
  const onPointerDownMouseXRef = useRef<number>(0);
  const onPointerDownMouseYRef = useRef<number>(0);
  const isUserInteractingRef = useRef<boolean>(false);
  const fovRef = useRef<number>(75);
  const autoRotateSpeedRef = useRef<number>(0.1);

  // Fix hydration by only rendering on client
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !containerRef.current) return;

    // Initialize Three.js
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      1,
      1000
    );
    camera.position.set(0, 0, 0.1);
    cameraRef.current = camera;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);

      // Auto-rotate when not interacting
      if (isAutoRotate && !isUserInteractingRef.current) {
        lonRef.current += autoRotateSpeedRef.current;
      }

      const phi = THREE.MathUtils.degToRad(90 - latRef.current);
      const theta = THREE.MathUtils.degToRad(lonRef.current);

      const target = new THREE.Vector3(
        500 * Math.sin(phi) * Math.cos(theta),
        500 * Math.cos(phi),
        500 * Math.sin(phi) * Math.sin(theta)
      );

      camera.lookAt(target);
      updateHotspotPositions();
      renderer.render(scene, camera);
    };

    animate();

    // Window resize handler
    const handleResize = () => {
      if (!cameraRef.current || !rendererRef.current) return;
      cameraRef.current.aspect = window.innerWidth / window.innerHeight;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, [mounted, isAutoRotate]);

  useEffect(() => {
    if (mounted) {
      loadScene(currentSceneIndex);
    }
  }, [currentSceneIndex, mounted]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const speed = 2;
      switch(e.key) {
        case 'ArrowLeft':
          lonRef.current -= speed;
          setIsAutoRotate(false);
          break;
        case 'ArrowRight':
          lonRef.current += speed;
          setIsAutoRotate(false);
          break;
        case 'ArrowUp':
          latRef.current = Math.min(85, latRef.current + speed);
          setIsAutoRotate(false);
          break;
        case 'ArrowDown':
          latRef.current = Math.max(-85, latRef.current - speed);
          setIsAutoRotate(false);
          break;
        case '+':
        case '=':
          handleZoom(-5);
          break;
        case '-':
        case '_':
          handleZoom(5);
          break;
        case ' ':
          e.preventDefault();
          setIsAutoRotate(prev => !prev);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const loadScene = (index: number) => {
    if (!sceneRef.current || !containerRef.current) return;

    const sceneData = scenes[index];

    // Remove old mesh
    sceneRef.current.children.forEach(child => {
      if (child instanceof THREE.Mesh) {
        sceneRef.current?.remove(child);
      }
    });

    // Remove old hotspots
    hotspotElementsRef.current.forEach(({ element }) => element.remove());
    hotspotElementsRef.current = [];

    // Load panorama
    const loader = new THREE.TextureLoader();
    loader.load(sceneData.image, (texture) => {
      const geometry = new THREE.SphereGeometry(500, 60, 40);
      geometry.scale(-1, 1, 1);

      const material = new THREE.MeshBasicMaterial({ map: texture });
      const mesh = new THREE.Mesh(geometry, material);
      sceneRef.current?.add(mesh);
    });

    // Create hotspots
    sceneData.hotspots.forEach(hotspot => {
      createHotspot(hotspot);
    });
  };

  const createHotspot = (hotspot: Hotspot) => {
    if (!containerRef.current) return;

    const el = document.createElement('div');
    el.className = 'hotspot';
    el.innerHTML = `
      <div class="hotspot-inner">
        <div class="hotspot-pulse"></div>
        <div class="hotspot-icon">→</div>
        <div class="hotspot-label">${hotspot.label}</div>
      </div>
    `;

    el.addEventListener('click', () => {
      const targetIndex = scenes.findIndex(s => s.id === hotspot.target);
      if (targetIndex !== -1) {
        setCurrentSceneIndex(targetIndex);
      }
    });

    const position = new THREE.Vector3(hotspot.x, hotspot.y, hotspot.z);
    containerRef.current.appendChild(el);
    hotspotElementsRef.current.push({ element: el, position });
  };

  const updateHotspotPositions = () => {
    if (!cameraRef.current) return;

    hotspotElementsRef.current.forEach(({ element, position }) => {
      const pos = position.clone();
      pos.project(cameraRef.current!);

      const x = (pos.x * 0.5 + 0.5) * window.innerWidth;
      const y = (pos.y * -0.5 + 0.5) * window.innerHeight;

      element.style.left = x - 30 + 'px';
      element.style.top = y - 30 + 'px';
      element.style.display = pos.z < 1 ? 'block' : 'none';
    });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    isUserInteractingRef.current = true;
    setIsAutoRotate(false);
    onPointerDownMouseXRef.current = e.clientX;
    onPointerDownMouseYRef.current = e.clientY;
    onPointerDownLonRef.current = lonRef.current;
    onPointerDownLatRef.current = latRef.current;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isUserInteractingRef.current) {
      lonRef.current = (onPointerDownMouseXRef.current - e.clientX) * 0.1 + onPointerDownLonRef.current;
      latRef.current = (e.clientY - onPointerDownMouseYRef.current) * 0.1 + onPointerDownLatRef.current;
      latRef.current = Math.max(-85, Math.min(85, latRef.current));
    }
  };

  const handleMouseUp = () => {
    isUserInteractingRef.current = false;
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    isUserInteractingRef.current = true;
    setIsAutoRotate(false);
    onPointerDownMouseXRef.current = touch.clientX;
    onPointerDownMouseYRef.current = touch.clientY;
    onPointerDownLonRef.current = lonRef.current;
    onPointerDownLatRef.current = latRef.current;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isUserInteractingRef.current) {
      const touch = e.touches[0];
      lonRef.current = (onPointerDownMouseXRef.current - touch.clientX) * 0.1 + onPointerDownLonRef.current;
      latRef.current = (touch.clientY - onPointerDownMouseYRef.current) * 0.1 + onPointerDownLatRef.current;
      latRef.current = Math.max(-85, Math.min(85, latRef.current));
    }
  };

  const handleTouchEnd = () => {
    isUserInteractingRef.current = false;
  };

  const toggleMusic = () => {
    if (audioRef.current) {
      if (isMusicPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsMusicPlaying(!isMusicPlaying);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const handleZoom = (delta: number) => {
    if (!cameraRef.current) return;
    fovRef.current = Math.max(30, Math.min(100, fovRef.current + delta));
    cameraRef.current.fov = fovRef.current;
    cameraRef.current.updateProjectionMatrix();
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    handleZoom(e.deltaY * 0.05);
  };

  // Don't render until mounted (fixes hydration)
  if (!mounted) {
    return (
      <div style={{
        width: '100vw',
        height: '100vh',
        background: '#000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontSize: '18px'
      }}>
        Loading...
      </div>
    );
  }

  const currentScene = scenes[currentSceneIndex];

  return (
    <div style={{ margin: 0, padding: 0, overflow: 'hidden', background: '#000' }}>
      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          overflow: hidden;
          background: #000;
        }

        #panorama-container {
          position: relative;
          width: 100vw;
          height: 100vh;
          cursor: grab;
        }

        #panorama-container:active {
          cursor: grabbing;
        }

        .hotspot {
          position: absolute;
          width: 60px;
          height: 60px;
          cursor: pointer;
          transition: all 0.3s ease;
          z-index: 10;
        }

        .hotspot-inner {
          position: relative;
          width: 100%;
          height: 100%;
        }

        .hotspot-pulse {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 40px;
          height: 40px;
          background: rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          animation: pulse 2s infinite;
        }

        .hotspot-icon {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 30px;
          height: 30px;
          background: rgba(33, 150, 243, 0.9);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 18px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
        }

        .hotspot:hover .hotspot-icon {
          transform: translate(-50%, -50%) scale(1.2);
          background: rgba(33, 150, 243, 1);
        }

        .hotspot-label {
          position: absolute;
          top: -35px;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(0, 0, 0, 0.8);
          color: white;
          padding: 6px 12px;
          border-radius: 4px;
          white-space: nowrap;
          font-size: 13px;
          opacity: 0;
          transition: opacity 0.3s;
          pointer-events: none;
        }

        .hotspot:hover .hotspot-label {
          opacity: 1;
        }

        @keyframes pulse {
          0% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 1;
          }
          100% {
            transform: translate(-50%, -50%) scale(2);
            opacity: 0;
          }
        }
      `}</style>

      <div
        ref={containerRef}
        id="panorama-container"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onWheel={handleWheel}
      />

      {/* Controls */}
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '20px',
        zIndex: 100,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
      }}>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={toggleMusic}
            style={{
              background: isMusicPlaying ? 'rgba(33, 150, 243, 0.9)' : 'rgba(0, 0, 0, 0.7)',
              color: 'white',
              border: 'none',
              padding: '12px 20px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              transition: 'all 0.3s',
              fontWeight: isMusicPlaying ? 'bold' : 'normal'
            }}
          >
            🎵 Hymn Music: {isMusicPlaying ? 'ON' : 'OFF'}
          </button>
          <button
            onClick={() => {
              setCurrentGalleryIndex(0);
              setIsGalleryOpen(true);
            }}
            style={{
              background: 'rgba(0, 0, 0, 0.7)',
              color: 'white',
              border: 'none',
              padding: '12px 20px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              transition: 'all 0.3s'
            }}
          >
            📷 Gallery
          </button>
          <button
            onClick={toggleFullscreen}
            style={{
              background: 'rgba(0, 0, 0, 0.7)',
              color: 'white',
              border: 'none',
              padding: '12px 20px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              transition: 'all 0.3s'
            }}
          >
            ⛶ Fullscreen
          </button>
          
        </div>
        
        {/* Zoom Controls */}
       

      </div>

      {/* Info Panel */}
      <div style={{
        position: 'absolute',
        top: '20px',
        right: '20px',
        background: 'rgba(0, 0, 0, 0.7)',
        color: 'white',
        padding: '15px',
        borderRadius: '8px',
        maxWidth: '300px',
        zIndex: 100
      }}>
        <h3 style={{ margin: '0 0 10px 0', fontSize: '18px' }}>{currentScene.name}</h3>
        <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.5' }}>{currentScene.description}</p>
      </div>

      {/* Scene Selector */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 100,
        display: 'flex',
        gap: '10px',
        background: 'rgba(0, 0, 0, 0.7)',
        padding: '10px',
        borderRadius: '8px'
      }}>
        {scenes.map((scene, index) => (
          <div
            key={scene.id}
            onClick={() => setCurrentSceneIndex(index)}
            style={{
              width: '100px',
              height: '60px',
              backgroundImage: `url(${scene.thumb})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              borderRadius: '4px',
              cursor: 'pointer',
              border: `3px solid ${index === currentSceneIndex ? '#fff' : 'transparent'}`,
              transition: 'all 0.3s',
              position: 'relative'
            }}
          >
            <div style={{
              position: 'absolute',
              bottom: '5px',
              left: '5px',
              right: '5px',
              background: 'rgba(0, 0, 0, 0.8)',
              color: 'white',
              fontSize: '11px',
              padding: '3px',
              borderRadius: '2px',
              textAlign: 'center'
            }}>
              {scene.name}
            </div>
          </div>
        ))}
      </div>

      {/* Gallery Modal */}
      {isGalleryOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(0, 0, 0, 0.95)',
          zIndex: 1000,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <div style={{ maxWidth: '90%', maxHeight: '90%', position: 'relative' }}>
            <button
              onClick={() => setIsGalleryOpen(false)}
              style={{
                position: 'absolute',
                top: '-40px',
                right: 0,
                background: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                border: 'none',
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                cursor: 'pointer',
                fontSize: '24px'
              }}
            >
              ×
            </button>
            <button
              onClick={() => setCurrentGalleryIndex((currentGalleryIndex - 1 + galleryImages.length) % galleryImages.length)}
              style={{
                position: 'absolute',
                top: '50%',
                left: '-70px',
                transform: 'translateY(-50%)',
                background: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                border: 'none',
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                cursor: 'pointer',
                fontSize: '24px'
              }}
            >
              ‹
            </button>
            <img
              src={galleryImages[currentGalleryIndex]}
              alt="Gallery"
              style={{ maxWidth: '100%', maxHeight: '80vh', borderRadius: '8px' }}
            />
            <button
              onClick={() => setCurrentGalleryIndex((currentGalleryIndex + 1) % galleryImages.length)}
              style={{
                position: 'absolute',
                top: '50%',
                right: '-70px',
                transform: 'translateY(-50%)',
                background: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                border: 'none',
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                cursor: 'pointer',
                fontSize: '24px'
              }}
            >
              ›
            </button>
          </div>
        </div>
      )}

      {/* Audio */}
      <audio ref={audioRef} loop>
        <source src="https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3" type="audio/mpeg" />
      </audio>
    </div>
  );
};

export default PanoramaViewer;