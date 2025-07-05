
'use client';

import * as THREE from 'three';
import { useEffect, useRef } from 'react';

interface FlavorSceneProps {
  flavorName: string;
  flavorColor: string;
}

function createCanMesh(flavorName: string, flavorColor: string): THREE.Group {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const context = canvas.getContext('2d');
    
    if (context) {
      context.fillStyle = flavorColor;
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.font = 'bold 150px "Playfair Display"';
      context.fillStyle = 'white';
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.fillText('RiskIt', canvas.width / 2, canvas.height / 2 - 60);
      context.font = 'bold 70px "PT Sans"';
      context.fillText(flavorName.toUpperCase(), canvas.width / 2, canvas.height / 2 + 70);
    }

    const texture = new THREE.CanvasTexture(canvas);

    const bumpCanvas = document.createElement('canvas');
    bumpCanvas.width = 128;
    bumpCanvas.height = 128;
    const bumpContext = bumpCanvas.getContext('2d');
    if (bumpContext) {
        const imageData = bumpContext.createImageData(128, 128);
        for (let i = 0; i < imageData.data.length; i += 4) {
            const value = Math.random() * 255;
            imageData.data[i] = value;
            imageData.data[i + 1] = value;
            imageData.data[i + 2] = value;
            imageData.data[i + 3] = 255;
        }
        bumpContext.putImageData(imageData, 0, 0);
    }
    const bumpTexture = new THREE.CanvasTexture(bumpCanvas);
    bumpTexture.wrapS = THREE.RepeatWrapping;
    bumpTexture.wrapT = THREE.RepeatWrapping;

    const canBodyMaterial = new THREE.MeshStandardMaterial({
        map: texture,
        metalness: 0.5,
        roughness: 0.5,
        bumpMap: bumpTexture,
        bumpScale: 0.005,
    });
    
    const metalMaterial = new THREE.MeshStandardMaterial({
        color: new THREE.Color(0xcccccc),
        metalness: 0.95,
        roughness: 0.15,
        bumpMap: bumpTexture,
        bumpScale: 0.01,
    });

    const canGroup = new THREE.Group();
    const canRadius = 0.5;
    const bodyHeight = 1.4;
    const segments = 64;
    
    const canBody = new THREE.Mesh(new THREE.CylinderGeometry(canRadius, canRadius, bodyHeight, segments), canBodyMaterial);
    canGroup.add(canBody);
    
    // Can Bottom
    const bottomTaperHeight = 0.1;
    const canBottomTaper = new THREE.Mesh(new THREE.CylinderGeometry(canRadius, canRadius * 0.9, bottomTaperHeight, segments), metalMaterial);
    canBottomTaper.position.y = -bodyHeight / 2 - bottomTaperHeight / 2;
    canGroup.add(canBottomTaper);

    const bottomRimHeight = 0.05;
    const canBottomRim = new THREE.Mesh(new THREE.CylinderGeometry(canRadius * 0.9, canRadius * 0.9, bottomRimHeight, segments), metalMaterial);
    canBottomRim.position.y = canBottomTaper.position.y - bottomTaperHeight / 2;
    canGroup.add(canBottomRim);

    // Can Top (Lid)
    const topGroup = new THREE.Group();
    topGroup.position.y = bodyHeight / 2;

    const topSurface = new THREE.Mesh(
        new THREE.CylinderGeometry(canRadius * 0.88, canRadius * 0.92, 0.05, segments),
        metalMaterial
    );
    topSurface.position.y = -0.025;
    topGroup.add(topSurface);

    const topRim = new THREE.Mesh(
        new THREE.TorusGeometry(canRadius * 0.96, 0.02, 16, segments),
        metalMaterial
    );
    topRim.rotation.x = Math.PI / 2;
    topGroup.add(topRim);

    // Pull Tab
    const pullTab = new THREE.Group();
    const tabRing = new THREE.Mesh(
        new THREE.TorusGeometry(0.09, 0.025, 12, 24),
        metalMaterial
    );
    tabRing.rotation.x = Math.PI / 2;

    const tabLever = new THREE.Mesh(
        new THREE.BoxGeometry(0.2, 0.0075, 0.1),
        metalMaterial
    );
    tabLever.position.x = -0.125;
    
    pullTab.add(tabRing, tabLever);
    pullTab.position.set(0.1, 0.015, 0);
    pullTab.rotation.z = Math.PI / 16;
    pullTab.rotation.y = -Math.PI / 9;
    
    topGroup.add(pullTab);
    canGroup.add(topGroup);

    canGroup.scale.set(1.8, 1.8, 1.8);
    canGroup.position.x = 0;

    return canGroup;
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
    
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 4.0);
    keyLight.position.set(3, 5, 4);
    keyLight.castShadow = true;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xffffff, 1.5);
    fillLight.position.set(-5, 2, -5);
    scene.add(fillLight);

    const can = createCanMesh(flavorName, flavorColor);
    can.traverse(function(child) {
        if ((child as THREE.Mesh).isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
        }
    });
    scene.add(can);
    
    let animationFrameId: number;

    const animate = () => {
      can.rotation.y += 0.005;
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
