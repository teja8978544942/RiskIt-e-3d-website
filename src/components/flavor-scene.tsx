
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
    texture.anisotropy = 8;

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
    const segments = 128;
    
    const canBody = new THREE.Mesh(new THREE.CylinderGeometry(canRadius, canRadius, bodyHeight, segments), canBodyMaterial);
    canGroup.add(canBody);
    
    // Can Top
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
    const tabShape = new THREE.Shape();
    const arcRadius = 0.09;
    const holeRadius = 0.05;
    const leverWidth = 0.05;
    tabShape.moveTo(-leverWidth / 2, -0.2);
    tabShape.lineTo(leverWidth / 2, -0.2);
    tabShape.absarc(0, -arcRadius, arcRadius, Math.PI * 1.35, Math.PI * -0.35, false);
    tabShape.lineTo(leverWidth / 2, -0.2);

    const tabHole = new THREE.Path();
    tabHole.absarc(0, 0, holeRadius, 0, Math.PI * 2, true);
    tabShape.holes.push(tabHole);

    const extrudeSettings = { depth: 0.02, bevelEnabled: true, bevelSegments: 2, steps: 1, bevelSize: 0.005, bevelThickness: 0.005 };
    const tabGeom = new THREE.ExtrudeGeometry(tabShape, extrudeSettings);
    const tabMesh = new THREE.Mesh(tabGeom, metalMaterial);
    tabMesh.rotation.x = Math.PI / 2;

    const rivetGeom = new THREE.CylinderGeometry(0.025, 0.03, 0.02, 16);
    const rivet = new THREE.Mesh(rivetGeom, metalMaterial);
    rivet.rotation.x = Math.PI / 2;
    
    pullTab.add(tabMesh);
    pullTab.position.set(0.1, 0.015, 0);
    pullTab.rotation.z = Math.PI / 16;
    pullTab.rotation.y = -Math.PI / 9;
    
    topGroup.add(pullTab, rivet);
    canGroup.add(topGroup);

    // Can Bottom
    const bottomTaperGeom = new THREE.CylinderGeometry(canRadius * 0.98, canRadius, 0.025, segments);
    const bottomTaper = new THREE.Mesh(bottomTaperGeom, metalMaterial);
    bottomTaper.position.y = -bodyHeight / 2 - 0.0125;
    canGroup.add(bottomTaper);

    const bottomBaseGeom = new THREE.TorusGeometry(canRadius * 0.9, 0.05, 16, segments);
    const bottomBase = new THREE.Mesh(bottomBaseGeom, metalMaterial);
    bottomBase.rotation.x = Math.PI/2;
    bottomBase.position.y = -bodyHeight / 2 - 0.025;
    canGroup.add(bottomBase);

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
