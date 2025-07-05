'use client';

import * as THREE from 'three';
import { useEffect, useRef } from 'react';

const vertexShader = `
uniform float uTime;
varying float vElevation;

void main() {
  vec4 modelPosition = modelMatrix * vec4(position, 1.0);
  
  // Multiple waves for more complexity
  float wave1 = sin(modelPosition.x * 2.0 + uTime * 1.5) * 0.2;
  float wave2 = sin(modelPosition.y * 3.0 + uTime * 1.0) * 0.15;
  float wave3 = sin(dot(modelPosition.xy, vec2(1.0, 1.0)) * 1.5 + uTime * 0.5) * 0.1;

  float elevation = wave1 + wave2 + wave3;
  
  modelPosition.z += elevation;
  vElevation = elevation;
  
  gl_Position = projectionMatrix * viewMatrix * modelPosition;
}
`;

const fragmentShader = `
uniform float uTime;
varying float vElevation;

void main() {
  vec3 deepColor = vec3(0.05, 0.15, 0.4);
  vec3 surfaceColor = vec3(0.2, 0.5, 0.9);
  
  float mixStrength = (vElevation + 0.35) * 1.5; // Adjusted for new elevation range
  vec3 color = mix(deepColor, surfaceColor, mixStrength);
  
  // Foam on wave crests
  float foamStrength = smoothstep(0.25, 0.5, vElevation);
  color = mix(color, vec3(1.0), foamStrength);

  gl_FragColor = vec4(color, 1.0);
}
`;


interface TsunamiAnimationProps {
  flavorColor: string; // Kept for compatibility, but not used for color
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

    const geometry = new THREE.PlaneGeometry(15, 15, 128, 128);
    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uTime: { value: 0 },
        // The color is now hardcoded inside the fragment shader for a natural water look
      }
    });
    
    const wavePlane = new THREE.Mesh(geometry, material);
    // Start wave further away and angled like a rising wall of water
    wavePlane.position.z = -2;
    wavePlane.position.y = -4;
    wavePlane.rotation.x = -Math.PI / 4;
    scene.add(wavePlane);
    
    let animationFrameId: number;
    const startTime = clock.getElapsedTime();

    const animate = () => {
      const elapsedTime = clock.getElapsedTime();
      material.uniforms.uTime.value = elapsedTime;

      // Animation: Wave rises and moves towards the camera
      const progress = Math.min((elapsedTime - startTime) / 2.0, 1.0);
      const easeOutQuad = (x: number): number => x * (2 - x);
      const easedProgress = easeOutQuad(progress);

      wavePlane.position.y = THREE.MathUtils.lerp(-4, 0, easedProgress);
      wavePlane.position.z = THREE.MathUtils.lerp(-2, 1, easedProgress);
      camera.position.z = THREE.MathUtils.lerp(2.5, 3.5, easedProgress);
      
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
