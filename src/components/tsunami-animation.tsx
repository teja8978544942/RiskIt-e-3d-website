'use client';

import * as THREE from 'three';
import { useEffect, useRef } from 'react';

const vertexShader = `
uniform float uTime;
varying float vElevation;

void main() {
  vec4 modelPosition = modelMatrix * vec4(position, 1.0);
  
  float elevation = sin(modelPosition.x * 2.0 + uTime * 1.5) * 0.2 +
                    cos(modelPosition.y * 3.0 + uTime * 1.0) * 0.15;
  
  modelPosition.z += elevation;
  vElevation = elevation;
  
  gl_Position = projectionMatrix * viewMatrix * modelPosition;
}
`;

const fragmentShader = `
uniform vec3 uColor;
uniform float uTime;
varying float vElevation;

void main() {
  float mixStrength = (vElevation + 0.3) / 0.6;
  vec3 color = mix(uColor, vec3(1.0), mixStrength * 0.5);
  gl_FragColor = vec4(color, 1.0);
}
`;


interface TsunamiAnimationProps {
  flavorColor: string;
  onClose: () => void;
}

export function TsunamiAnimation({ flavorColor, onClose }: TsunamiAnimationProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!mountRef.current) return;

    const currentMount = mountRef.current;
    
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.z = 2.5;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    currentMount.appendChild(renderer.domElement);
    
    const clock = new THREE.Clock();

    const geometry = new THREE.PlaneGeometry(10, 10, 128, 128);
    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uColor: { value: new THREE.Color(flavorColor) },
      }
    });
    
    const wavePlane = new THREE.Mesh(geometry, material);
    scene.add(wavePlane);
    
    let animationFrameId: number;
    const animate = () => {
      const elapsedTime = clock.getElapsedTime();
      material.uniforms.uTime.value = elapsedTime;
      
      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    };
    animate();

    const onResize = () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', onResize);
    
    const closeTimeout = setTimeout(() => {
      onCloseRef.current();
    }, 2500);

    const handleClick = () => {
        onCloseRef.current();
    };
    currentMount.addEventListener('click', handleClick);

    return () => {
        window.removeEventListener('resize', onResize);
        clearTimeout(closeTimeout);
        if (currentMount) {
            currentMount.removeEventListener('click', handleClick);
            if (renderer.domElement.parentElement === currentMount) {
                currentMount.removeChild(renderer.domElement);
            }
        }
        cancelAnimationFrame(animationFrameId);
        geometry.dispose();
        material.dispose();
        renderer.dispose();
    };
  }, [flavorColor]);

  return (
    <div 
        className="fixed inset-0 z-[60] bg-black/50 animate-in fade-in-0 duration-500"
    >
        <div ref={mountRef} className="absolute inset-0" />
        <div 
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
        >
            <h1 className="font-headline text-white text-5xl md:text-7xl lg:text-8xl text-center p-4 drop-shadow-2xl">
                Let's dive your thirst
            </h1>
        </div>
    </div>
  );
}
