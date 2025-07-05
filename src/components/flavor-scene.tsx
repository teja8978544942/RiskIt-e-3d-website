
'use client';

import * as THREE from 'three';
import { useEffect, useRef } from 'react';
import { createCanMesh } from './can-model';

interface FlavorSceneProps {
  flavorName: string;
  flavorColor: string;
}

export function FlavorScene({ flavorName, flavorColor }: FlavorSceneProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);

  useEffect(() => {
    if (!mountRef.current || typeof window === 'undefined') return;

    const currentMount = mountRef.current;
    
    if (!rendererRef.current) {
         rendererRef.current = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    }
    const renderer = rendererRef.current;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, currentMount.clientWidth / currentMount.clientHeight, 0.1, 100);
    camera.position.z = 5;

    renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    currentMount.innerHTML = ''; 
    currentMount.appendChild(renderer.domElement);
    
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.0);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 3.0);
    keyLight.position.set(5, 5, 5);
    keyLight.castShadow = true;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xffffff, 1.0);
    fillLight.position.set(-5, 2, 2);
    scene.add(fillLight);
    
    const backLight = new THREE.DirectionalLight(0xffffff, 2.0);
    backLight.position.set(0, 10, -8);
    scene.add(backLight);

    let can: THREE.Group;
    const initCan = async () => {
      can = await createCanMesh(flavorName, flavorColor);
      can.traverse(function(child) {
          if ((child as THREE.Mesh).isMesh) {
              child.castShadow = true;
              child.receiveShadow = true;
          }
      });
      scene.add(can);
    }
    initCan();
    
    let animationFrameId: number;

    const animate = () => {
      if (can) {
        can.rotation.y += 0.005;
      }
      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    };
    animate();

    const onResize = () => {
        if (currentMount && currentMount.clientWidth > 0) {
            camera.aspect = currentMount.clientWidth / currentMount.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
        }
    };
    window.addEventListener('resize', onResize);

    return () => {
        window.removeEventListener('resize', onResize);
        cancelAnimationFrame(animationFrameId);
        
        scene.traverse(object => {
            if (object instanceof THREE.Mesh) {
                object.geometry.dispose();
                const materials = Array.isArray(object.material) ? object.material : [object.material];
                materials.forEach(material => {
                    if (material.map) material.map.dispose();
                    if (material.bumpMap) material.bumpMap.dispose();
                    material.dispose()
                });
            }
        });
        
        if (currentMount && renderer.domElement.parentElement === currentMount) {
             currentMount.removeChild(renderer.domElement);
        }
    };
  }, [flavorName, flavorColor]);

  return <div ref={mountRef} className="aspect-square w-full" />;
}
