
'use client';

import * as THREE from 'three';
import { useEffect, useRef } from 'react';

const vertexShader = `
uniform float uTime;
uniform float uBigWavesElevation;
uniform float uBigWavesFrequency;
uniform float uSmallWavesElevation;
uniform float uSmallWavesFrequency;
uniform float uSmallWavesSpeed;

varying float vElevation;

// Simplex 3D Noise by Stefan Gustavson
// https://github.com/ashima/webgl-noise
vec3 mod289(vec3 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}
vec4 mod289(vec4 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}
vec4 permute(vec4 x) {
  return mod289(((x*34.0)+1.0)*x);
}
vec4 taylorInvSqrt(vec4 r) {
  return 1.79284291400159 - 0.85373472095314 * r;
}
float snoise(vec3 v) {
  const vec2 C = vec2(1.0/6.0, 1.0/3.0) ;
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i  = floor(v + dot(v, C.yyy) );
  vec3 x0 = v - i + dot(i, C.xxx) ;
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min( g.xyz, l.zxy );
  vec3 i2 = max( g.xyz, l.zxy );
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod289(i);
  vec4 p = permute( permute( permute(
             i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))
           + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));
  float n_ = 0.142857142857;
  vec3  ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_ );
  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4( x.xy, y.xy );
  vec4 b1 = vec4( x.zw, y.zw );
  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;
  vec3 p0 = vec3(a0.xy,h.x);
  vec3 p1 = vec3(a0.zw,h.y);
  vec3 p2 = vec3(a1.xy,h.z);
  vec3 p3 = vec3(a1.zw,h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1),
                                dot(p2,x2), dot(p3,x3) ) );
}

void main() {
  vec4 modelPosition = modelMatrix * vec4(position, 1.0);
  
  // Big, rolling waves
  float elevation = snoise(vec3(modelPosition.x * uBigWavesFrequency, modelPosition.y * uBigWavesFrequency, uTime * 0.4)) * uBigWavesElevation;
  
  // Smaller, faster ripples on top
  elevation += snoise(vec3(modelPosition.xy * uSmallWavesFrequency, uTime * uSmallWavesSpeed)) * uSmallWavesElevation;

  modelPosition.z += elevation;
  vElevation = elevation;
  
  gl_Position = projectionMatrix * viewMatrix * modelPosition;
}
`;

const fragmentShader = `
uniform vec3 uDepthColor;
uniform vec3 uSurfaceColor;
uniform vec3 uFoamColor;
uniform float uColorOffset;
uniform float uColorMultiplier;

varying float vElevation;

void main() {
    float mixStrength = (vElevation + uColorOffset) * uColorMultiplier;
    vec3 color = mix(uDepthColor, uSurfaceColor, mixStrength);

    // Foam on wave crests
    float foamStrength = smoothstep(0.4, 0.7, vElevation);
    color = mix(color, uFoamColor, foamStrength);

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

    const geometry = new THREE.PlaneGeometry(60, 60, 128, 128);
    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uTime: { value: 0 },
        // Big Waves
        uBigWavesElevation: { value: 0.3 },
        uBigWavesFrequency: { value: 0.8 },
        // Small Waves
        uSmallWavesElevation: { value: 0.15 },
        uSmallWavesFrequency: { value: 2.0 },
        uSmallWavesSpeed: { value: 1.5 },
        // Colors
        uDepthColor: { value: new THREE.Color('#00072d') },
        uSurfaceColor: { value: new THREE.Color('#0077b6') },
        uFoamColor: { value: new THREE.Color('#ffffff') },
        uColorOffset: { value: 0.1 },
        uColorMultiplier: { value: 2.5 },
      }
    });
    
    const wavePlane = new THREE.Mesh(geometry, material);
    wavePlane.position.z = -2;
    wavePlane.position.y = -4;
    wavePlane.rotation.x = -Math.PI / 4;
    scene.add(wavePlane);
    
    let animationFrameId: number;
    const startTime = clock.getElapsedTime();

    const animate = () => {
      const elapsedTime = clock.getElapsedTime();
      material.uniforms.uTime.value = elapsedTime;

      const progress = Math.min((elapsedTime - startTime) / 2.0, 1.0);
      const easeOutQuad = (x: number): number => x * (2 - x);
      const easedProgress = easeOutQuad(progress);

      // Animate wave properties to make it more dramatic
      material.uniforms.uBigWavesElevation.value = THREE.MathUtils.lerp(0.2, 0.8, easedProgress);
      material.uniforms.uSmallWavesElevation.value = THREE.MathUtils.lerp(0.1, 0.25, easedProgress);
      material.uniforms.uColorMultiplier.value = THREE.MathUtils.lerp(2.5, 4.0, easedProgress);

      wavePlane.position.y = THREE.MathUtils.lerp(-4, 0, easedProgress);
      wavePlane.position.z = THREE.MathUtils.lerp(-2, 1, easedProgress);
      
      // Add a slight camera shake effect as the wave peaks
      if (progress > 0.5) {
        const shakeProgress = (progress - 0.5) * 2; // Normalize to 0-1 range
        const shakeIntensity = Math.pow(shakeProgress, 2) * 0.1;
        camera.position.x = (Math.random() - 0.5) * shakeIntensity;
        camera.position.y = (Math.random() - 0.5) * shakeIntensity;
      } else {
        camera.position.x = 0;
        camera.position.y = 0;
      }
      
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
            className="absolute inset-0 flex items-start justify-center pointer-events-none pt-10"
        >
            <h1 className="font-headline text-black text-5xl md:text-7xl lg:text-8xl text-center p-4 animate-in fade-in-0 duration-1000">
                Let's dive through your thirst
            </h1>
        </div>
    </div>
  );
}
