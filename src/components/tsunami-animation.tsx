
'use client';

import * as THREE from 'three';
import { useEffect, useRef, useState } from 'react';

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
varying vec3 vViewPosition;

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
    float elevation = snoise(vec3(p.x * uBigWavesFrequency.x, p.y * uBigWavesFrequency.y, uTime * uBigWavesSpeed)) * uBigWavesElevation;
    
    // FBM for smaller waves
    float freq = uSmallWavesFrequency;
    float amp = uSmallWavesElevation;
    for(int i = 0; i < 4; i++) {
        elevation += snoise(vec3(p.x * freq, p.y * freq, uTime * uSmallWavesSpeed + float(i)*1.5)) * amp;
        freq *= 1.8;
        amp *= 0.6;
    }
    return elevation;
}

void main() {
    vec4 modelPos = vec4(position, 1.0);
    
    float elevation = getWaterElevation(position.xy);
    modelPos.z += elevation;
    
    float epsilon = 0.01;
    float elev_x = getWaterElevation(position.xy + vec2(epsilon, 0.0));
    float elev_y = getWaterElevation(position.xy + vec2(0.0, epsilon));
    
    vec3 objectNormal = normalize(cross(
        vec3(0.0, epsilon, elev_y - elevation), 
        vec3(epsilon, 0.0, elev_x - elevation)
    ));
    
    vElevation = elevation;
    vNormal = normalize(normalMatrix * objectNormal);

    vec4 viewPos = viewMatrix * modelMatrix * modelPos;
    vViewPosition = viewPos.xyz;

    gl_Position = projectionMatrix * viewPos;
}
`;

const fragmentShader = `
uniform vec3 uDepthColor;
uniform vec3 uSurfaceColor;
uniform vec3 uFoamColor;
uniform float uColorOffset;
uniform float uColorMultiplier;
uniform vec3 uSpecularColor;
uniform float uShininess;

varying float vElevation;
varying vec3 vNormal;
varying vec3 vViewPosition;

void main() {
    // Lighting is calculated in view space
    vec3 lightDirection = normalize(vec3(1.0, 1.5, 1.0));
    vec3 viewDirection = normalize(-vViewPosition);

    // Fresnel
    float fresnel = dot(viewDirection, vNormal);
    fresnel = pow(1.0 - fresnel, 3.0);

    // Diffuse
    float diffuse = max(0.0, dot(vNormal, lightDirection));

    // Specular
    vec3 reflection = reflect(-lightDirection, vNormal);
    float specularStrength = pow(max(dot(viewDirection, reflection), 0.0), uShininess);
    vec3 specular = specularStrength * uSpecularColor;

    // Base Color
    float mixStrength = (vElevation + uColorOffset) * uColorMultiplier;
    vec3 color = mix(uDepthColor, uSurfaceColor, mixStrength);
    
    // Apply diffuse lighting
    color *= (diffuse * 0.7 + 0.3);

    // Foam
    float foamCrests = smoothstep(0.4, 0.7, vElevation);
    float foamSteepness = smoothstep(0.2, 0.6, 1.0 - vNormal.y);
    float foamStrength = clamp(foamCrests + foamSteepness, 0.0, 1.0);
    
    color = mix(color, uFoamColor, foamStrength);

    // Add specular highlights on top of everything
    color += specular * (0.5 + 0.5 * fresnel);

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
  const [animationStage, setAnimationStage] = useState<'rising' | 'diving' | 'done'>('rising');

  useEffect(() => {
    if (!mountRef.current) return;

    const currentMount = mountRef.current;
    
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x00102a, 0.03); // Deep blue fog for underwater effect

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 3, 10); // Start camera further back
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    currentMount.appendChild(renderer.domElement);
    
    const clock = new THREE.Clock();

    const geometry = new THREE.PlaneGeometry(500, 500, 256, 256);
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
        // Colors & Lighting
        uDepthColor: { value: new THREE.Color('#043936') },
        uSurfaceColor: { value: new THREE.Color(flavorColor) },
        uFoamColor: { value: new THREE.Color('#ffffff') },
        uColorOffset: { value: 0.1 },
        uColorMultiplier: { value: 3.0 },
        uSpecularColor: { value: new THREE.Color(0xffffff) },
        uShininess: { value: 50.0 },
      }
    });
    
    const wavePlane = new THREE.Mesh(geometry, material);
    wavePlane.rotation.x = -Math.PI / 2;
    wavePlane.position.y = -10;
    scene.add(wavePlane);
    
    const bubbleCount = 400;
    const bubbleGeometry = new THREE.BufferGeometry();
    const bubblePositions = new Float32Array(bubbleCount * 3);

    for (let i = 0; i < bubbleCount; i++) {
        bubblePositions[i * 3 + 0] = (Math.random() - 0.5) * 60; // x
        bubblePositions[i * 3 + 1] = (Math.random() - 1.5) * 40; // y start below
        bubblePositions[i * 3 + 2] = (Math.random() - 0.5) * 60; // z
    }
    bubbleGeometry.setAttribute('position', new THREE.BufferAttribute(bubblePositions, 3));
    
    const bubbleMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.15,
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending,
        sizeAttenuation: true,
    });
    const bubbles = new THREE.Points(bubbleGeometry, bubbleMaterial);
    bubbles.visible = false;
    scene.add(bubbles);

    let animationFrameId: number;
    const startTime = clock.getElapsedTime();
    let localAnimationStage: 'rising' | 'diving' | 'done' = 'rising';

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();
      material.uniforms.uTime.value = elapsedTime * 0.4;

      if (localAnimationStage === 'rising') {
        const progress = Math.min((elapsedTime - startTime) / 4.0, 1.0);
        const easedProgress = 1 - Math.pow(1 - progress, 3);
  
        wavePlane.position.y = THREE.MathUtils.lerp(-10, 4, easedProgress);
        
        if (progress >= 1.0) {
            localAnimationStage = 'diving';
            setAnimationStage('diving');
            bubbles.visible = true;
        }
      } else if (localAnimationStage === 'diving') {
        const diveStartTime = startTime + 4.0;
        const diveProgress = Math.min((elapsedTime - diveStartTime) / 4.0, 1.0);
        const easedDiveProgress = 1 - Math.pow(1 - diveProgress, 2);

        camera.position.y = THREE.MathUtils.lerp(3, -15, easedDiveProgress);
        camera.position.z = THREE.MathUtils.lerp(10, -20, easedDiveProgress);
        if(scene.fog instanceof THREE.FogExp2) {
          scene.fog.density = THREE.MathUtils.lerp(0.03, 0.08, easedDiveProgress);
        }

        const positions = bubbleGeometry.attributes.position.array as Float32Array;
        for (let i = 0; i < bubbleCount; i++) {
            positions[i * 3 + 1] += Math.random() * 0.1 + 0.05;
            
            if (positions[i * 3 + 1] > camera.position.y + 10) {
                positions[i * 3 + 1] = camera.position.y - 30;
                positions[i * 3 + 0] = camera.position.x + (Math.random() - 0.5) * 60;
                positions[i * 3 + 2] = camera.position.z + (Math.random() - 0.5) * 60;
            }
        }
        bubbleGeometry.attributes.position.needsUpdate = true;

        if (diveProgress >= 1.0) {
            localAnimationStage = 'done';
            setAnimationStage('done');
            onCloseRef.current();
        }
      }
      
      renderer.render(scene, camera);
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
        bubbleGeometry.dispose();
        bubbleMaterial.dispose();
        renderer.dispose();
    };
  }, [flavorColor, setAnimationStage]);

  return (
    <div 
        className="fixed inset-0 z-50"
    >
        <div ref={mountRef} className="absolute inset-0" />
        {animationStage === 'diving' && (
            <div 
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
            >
                <h1 className="font-headline text-white text-5xl md:text-7xl lg:text-8xl text-center p-4 animate-in fade-in-0 duration-1000">
                    Diving through the thirst
                </h1>
            </div>
        )}
    </div>
  );
}
