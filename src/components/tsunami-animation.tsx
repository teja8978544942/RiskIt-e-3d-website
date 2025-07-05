
'use client';

import * as THREE from 'three';
import { useEffect, useRef } from 'react';

const vertexShader = `
uniform float uTime;
// Big Waves
uniform float uBigWavesElevation;
uniform vec2 uBigWavesFrequency;
uniform float uBigWavesSpeed;
// Small Waves
uniform float uSmallWavesElevation;
uniform float uSmallWavesFrequency;
uniform float uSmallWavesSpeed;


varying float vElevation;
varying vec3 vNormal;

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

float getWaterElevation(vec2 p) {
    float elevation = 0.0;
    
    // Main large waves
    elevation += snoise(vec3(p.x * uBigWavesFrequency.x, p.y * uBigWavesFrequency.y, uTime * uBigWavesSpeed)) * uBigWavesElevation;

    // Smaller, detailed waves (fractal noise)
    float freq = uSmallWavesFrequency;
    float amp = uSmallWavesElevation;
    for(int i = 0; i < 4; i++) {
        elevation += snoise(vec3(p.x * freq, p.y * freq, uTime * uSmallWavesSpeed)) * amp;
        freq *= 2.0;
        amp *= 0.5;
    }
    return elevation;
}


void main() {
    // Calculations in object space before modelMatrix is applied
    vec4 pos = vec4(position, 1.0);

    float elevation = getWaterElevation(pos.xy);
    pos.z = elevation;
    
    // Calculate normals for lighting/foam
    float epsilon = 0.01;
    float elev_x = getWaterElevation(pos.xy + vec2(epsilon, 0.0));
    float elev_y = getWaterElevation(pos.xy + vec2(0.0, epsilon));

    // Using the displaced points to find the normal
    vec3 p_x = vec3(epsilon, 0.0, elev_x - elevation);
    vec3 p_y = vec3(0.0, epsilon, elev_y - elevation);
    vec3 calculatedNormal = normalize(cross(p_y, p_x));

    vElevation = elevation;
    vNormal = normalize(normalMatrix * calculatedNormal);

    gl_Position = projectionMatrix * viewMatrix * modelMatrix * pos;
}
`;

const fragmentShader = `
uniform vec3 uDepthColor;
uniform vec3 uSurfaceColor;
uniform vec3 uFoamColor;
uniform float uColorOffset;
uniform float uColorMultiplier;

varying float vElevation;
varying vec3 vNormal;

void main() {
    // Basic directional light from above and to the side
    vec3 lightDirection = normalize(vec3(0.8, 1.0, 0.5));
    float diffuse = max(0.0, dot(vNormal, lightDirection));

    // Base color mix from deep to surface water
    float mixStrength = (vElevation + uColorOffset) * uColorMultiplier;
    vec3 color = mix(uDepthColor, uSurfaceColor, mixStrength);
    
    // Apply lighting, but keep it subtle so water doesn't get too dark
    color = color * (diffuse * 0.6 + 0.4);

    // Foam on crests
    float foamCrests = smoothstep(0.4, 0.7, vElevation);
    
    // Add some foam based on steepness of the wave from the normal
    // A more upright normal (in view space) means flatter water.
    // So we want foam when the y-component of the normal is low.
    float steepness = 1.0 - vNormal.y;
    float foamSteepness = smoothstep(0.3, 0.7, steepness);

    float foamStrength = foamCrests + foamSteepness * 0.5;

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
    camera.position.set(0, 3, 5);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    currentMount.appendChild(renderer.domElement);
    
    const clock = new THREE.Clock();

    const geometry = new THREE.PlaneGeometry(100, 100, 256, 256);
    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uTime: { value: 0 },
        // Big Waves
        uBigWavesElevation: { value: 0.6 },
        uBigWavesFrequency: { value: new THREE.Vector2(0.6, 0.2) },
        uBigWavesSpeed: { value: 0.3 },
        // Small Waves
        uSmallWavesElevation: { value: 0.25 },
        uSmallWavesFrequency: { value: 2.0 },
        uSmallWavesSpeed: { value: 1.0 },
        // Colors
        uDepthColor: { value: new THREE.Color('#043936') }, // Deep teal
        uSurfaceColor: { value: new THREE.Color('#88c0d0') }, // Sea green/blue
        uFoamColor: { value: new THREE.Color('#ffffff') },
        uColorOffset: { value: 0.1 },
        uColorMultiplier: { value: 3.0 },
      }
    });
    
    const wavePlane = new THREE.Mesh(geometry, material);
    wavePlane.rotation.x = -Math.PI / 2;
    wavePlane.position.y = -10; // Start below the viewport
    scene.add(wavePlane);
    
    let animationFrameId: number;
    const startTime = clock.getElapsedTime();
    let isClosed = false;

    const animate = () => {
      const elapsedTime = clock.getElapsedTime();
      material.uniforms.uTime.value = elapsedTime * 0.4;

      const progress = Math.min((elapsedTime - startTime) / 6.0, 1.0);
      const easedProgress = 1 - Math.pow(1 - progress, 2);

      // Animate the water level rising up to fill the screen
      wavePlane.position.y = THREE.MathUtils.lerp(-10, 2, easedProgress);
      
      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);

      if (progress >= 1.0 && !isClosed) {
          isClosed = true;
          onCloseRef.current();
      }
    };
    animate();

    const onResize = () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', onResize);

    return () => {
        window.removeEventListener('resize', onResize);
        cancelAnimationFrame(animationFrameId);
        if (currentMount && renderer.domElement.parentElement === currentMount) {
          currentMount.removeChild(renderer.domElement);
        }
        geometry.dispose();
        material.dispose();
        renderer.dispose();
    };
  }, [flavorColor]);

  return (
    <div 
        className="fixed inset-0 z-[60] bg-[#043936]"
    >
        <div ref={mountRef} className="absolute inset-0" />
        <div 
            className="absolute inset-0 flex items-start justify-center pointer-events-none pt-2"
        >
            <h1 className="font-headline text-black text-5xl md:text-7xl lg:text-8xl text-center p-4 animate-in fade-in-0 duration-1000">
                Let's dive through your thirst
            </h1>
        </div>
    </div>
  );
}
