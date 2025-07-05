
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
        metalness: 0.4,
        roughness: 0.6,
        bumpMap: bumpTexture,
        bumpScale: 0.005,
    });
    
    const metalMaterial = new THREE.MeshStandardMaterial({
        color: new THREE.Color(0xcccccc),
        metalness: 0.9,
        roughness: 0.3,
        bumpMap: bumpTexture,
        bumpScale: 0.02,
    });

    const canGroup = new THREE.Group();
    const canRadius = 0.5;
    const bodyHeight = 1.4;
    const segments = 64; // Increased for smoother geometry
    
    const canBody = new THREE.Mesh(new THREE.CylinderGeometry(canRadius, canRadius, bodyHeight, segments), canBodyMaterial);
    canGroup.add(canBody);
    
    const topTaperHeight = 0.1;
    const canTopTaper = new THREE.Mesh(new THREE.CylinderGeometry(canRadius * 0.9, canRadius, topTaperHeight, segments), metalMaterial);
    canTopTaper.position.y = bodyHeight / 2 + topTaperHeight / 2;
    canGroup.add(canTopTaper);
    
    const lidHeight = 0.025;
    const canTopLid = new THREE.Mesh(new THREE.CylinderGeometry(canRadius * 0.9, canRadius * 0.88, lidHeight, segments), metalMaterial);
    canTopLid.position.y = canTopTaper.position.y + topTaperHeight / 2;
    canGroup.add(canTopLid);

    const bottomTaperHeight = 0.1;
    const canBottomTaper = new THREE.Mesh(new THREE.CylinderGeometry(canRadius, canRadius * 0.9, bottomTaperHeight, segments), metalMaterial);
    canBottomTaper.position.y = -bodyHeight / 2 - bottomTaperHeight / 2;
    canGroup.add(canBottomTaper);
    
    const bottomRimHeight = 0.05;
    const canBottomRim = new THREE.Mesh(new THREE.CylinderGeometry(canRadius * 0.9, canRadius * 0.9, bottomRimHeight, segments), metalMaterial);
    canBottomRim.position.y = canBottomTaper.position.y - bottomTaperHeight / 2;
    canGroup.add(canBottomRim);

    canGroup.scale.set(1.8, 1.8, 1.8);
    canGroup.position.x = -0.8;

    return canGroup;
}

function createFruitMesh(flavorName: string): THREE.Group {
    const fruitGroup = new THREE.Group();
    const material = new THREE.MeshStandardMaterial({ roughness: 0.4, metalness: 0.1 });
    let geometry;

    const createCluster = (color: THREE.Color, count: number, baseRadius: number) => {
        material.color = color;
        for (let i = 0; i < count; i++) {
            const radius = baseRadius * (Math.random() * 0.4 + 0.8);
            geometry = new THREE.SphereGeometry(radius, 16, 16);
            const sphere = new THREE.Mesh(geometry, material);
            sphere.position.set(
                (Math.random() - 0.5) * 0.5,
                (Math.random() - 0.5) * 0.5,
                (Math.random() - 0.5) * 0.5
            );
            fruitGroup.add(sphere);
        }
    }

    switch (flavorName) {
        case 'Orange Burst':
            geometry = new THREE.SphereGeometry(0.4, 32, 32);
            material.color.set('#FFA500');
            fruitGroup.add(new THREE.Mesh(geometry, material));
            break;
        case 'Lime Zing':
            geometry = new THREE.SphereGeometry(0.35, 32, 32);
            material.color.set('#32CD32');
            fruitGroup.add(new THREE.Mesh(geometry, material));
            break;
        case 'Grape Blast':
            createCluster(new THREE.Color('#800080'), 15, 0.15);
            break;
        case 'Blueberry Wave':
            createCluster(new THREE.Color('#4682B4'), 20, 0.1);
            break;
        case 'Mango Tango':
             geometry = new THREE.SphereGeometry(0.4, 32, 32);
             (geometry as THREE.SphereGeometry).scale(1, 1.2, 1);
            material.color.set('#FFBF00');
            fruitGroup.add(new THREE.Mesh(geometry, material));
            break;
        case 'Raspberry Rush':
             createCluster(new THREE.Color('#E30B5D'), 20, 0.1);
            break;
        case 'Pearadise':
            geometry = new THREE.SphereGeometry(0.3, 32, 32);
            (geometry as THREE.SphereGeometry).scale(1, 1.4, 1);
            material.color.set('#D1E231');
            const pear = new THREE.Mesh(geometry, material)
            pear.position.y = 0.2;
            fruitGroup.add(pear);
            break;
        case 'Strawberry Bliss':
            geometry = new THREE.ConeGeometry(0.3, 0.6, 32);
            material.color.set('#FC5A8D');
            const strawberry = new THREE.Mesh(geometry, material)
            strawberry.rotation.x = -0.2;
            fruitGroup.add(strawberry);
            break;
        default:
             geometry = new THREE.SphereGeometry(0.4, 32, 32);
             material.color.set('#FFFFFF');
             fruitGroup.add(new THREE.Mesh(geometry, material));
    }

    fruitGroup.position.x = 1.0;
    return fruitGroup;
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
    camera.position.z = 6; // Moved camera back for full visibility

    renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true; // Enable shadows for realism
    renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Softer shadows

    currentMount.innerHTML = ''; 
    currentMount.appendChild(renderer.domElement);
    
    // Adjusted lighting for better contrast and realism
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.0);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 3.5);
    directionalLight.position.set(3, 5, 4);
    directionalLight.castShadow = true; // Light will cast shadows
    scene.add(directionalLight);

    const can = createCanMesh(flavorName, flavorColor);
    can.traverse(function(child) {
        if ((child as THREE.Mesh).isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
        }
    });
    scene.add(can);

    const fruit = createFruitMesh(flavorName);
    fruit.traverse(function(child) {
        if ((child as THREE.Mesh).isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
        }
    });
    scene.add(fruit);
    
    let animationFrameId: number;

    const animate = () => {
      can.rotation.y += 0.005;
      fruit.rotation.y -= 0.007;
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

  return <div ref={mountRef} className="aspect-[3/5] w-full" />;
}
