
"use client";

import * as THREE from 'three';
import { useEffect, useRef } from 'react';
import { flavors } from '@/lib/flavors';

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
        metalness: 0.7,
        roughness: 0.4,
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
    const canRadius = 1.0;
    const bodyHeight = 2.8;
    const segments = 64;
    
    const canBody = new THREE.Mesh(new THREE.CylinderGeometry(canRadius, canRadius, bodyHeight, segments), canBodyMaterial);
    canGroup.add(canBody);
    
    // Can Bottom
    const bottomTaperHeight = 0.2;
    const canBottomTaper = new THREE.Mesh(new THREE.CylinderGeometry(canRadius, canRadius * 0.9, bottomTaperHeight, segments), metalMaterial);
    canBottomTaper.position.y = -bodyHeight / 2 - bottomTaperHeight / 2;
    canGroup.add(canBottomTaper);
    
    const bottomRimHeight = 0.1;
    const canBottomRim = new THREE.Mesh(new THREE.CylinderGeometry(canRadius * 0.9, canRadius * 0.9, bottomRimHeight, segments), metalMaterial);
    canBottomRim.position.y = canBottomTaper.position.y - bottomTaperHeight / 2;
    canGroup.add(canBottomRim);

    // Can Top (Lid)
    const topGroup = new THREE.Group();
    topGroup.position.y = bodyHeight / 2;

    const topSurface = new THREE.Mesh(
        new THREE.CylinderGeometry(canRadius * 0.88, canRadius * 0.92, 0.1, segments),
        metalMaterial
    );
    topSurface.position.y = -0.05;
    topGroup.add(topSurface);

    const topRim = new THREE.Mesh(
        new THREE.TorusGeometry(canRadius * 0.96, 0.04, 16, segments),
        metalMaterial
    );
    topRim.rotation.x = Math.PI / 2;
    topGroup.add(topRim);

    // Pull Tab
    const pullTab = new THREE.Group();
    const tabRing = new THREE.Mesh(
        new THREE.TorusGeometry(0.18, 0.05, 12, 24),
        metalMaterial
    );
    tabRing.rotation.x = Math.PI / 2;

    const tabLever = new THREE.Mesh(
        new THREE.BoxGeometry(0.4, 0.015, 0.2),
        metalMaterial
    );
    tabLever.position.x = -0.25;
    
    pullTab.add(tabRing, tabLever);
    pullTab.position.set(0.2, 0.03, 0);
    pullTab.rotation.z = Math.PI / 16;
    pullTab.rotation.y = -Math.PI / 9;
    
    topGroup.add(pullTab);
    canGroup.add(topGroup);

    return canGroup;
}


export function Scene() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current || typeof window === 'undefined') return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    scene.add(camera);
    camera.position.z = 8; 

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mountRef.current.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 4.0);
    keyLight.position.set(5, 5, 5);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 20;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xffffff, 1.5);
    fillLight.position.set(-5, 2, 5);
    scene.add(fillLight);
    
    const backLight = new THREE.DirectionalLight(0xffffff, 2.5);
    backLight.position.set(0, 8, -10);
    scene.add(backLight);

    const allCans: THREE.Group[] = [];
    let mainCan: THREE.Group | null = null;
    const otherCans: THREE.Group[] = [];

    const orangeBurstFlavor = flavors.find(f => f.name === 'Orange Burst');
    if (orangeBurstFlavor) {
        mainCan = createCanMesh(orangeBurstFlavor.name, orangeBurstFlavor.color);
        mainCan.position.set(0, 0, 0);
        mainCan.castShadow = true;
        mainCan.traverse(function(child) {
            if ((child as THREE.Mesh).isMesh) {
                child.castShadow = true;
            }
        });
        allCans.push(mainCan);
        scene.add(mainCan);
    }

    const otherFlavors = flavors.filter(f => f.name !== 'Orange Burst');
    const spacing = 2.5;

    otherFlavors.forEach((flavor, index) => {
        const can = createCanMesh(flavor.name, flavor.color);
        
        const side = (index % 2 === 0) ? 1 : -1;
        const step = Math.ceil((index + 1) / 2);
        can.position.x = side * step * spacing;

        can.castShadow = true;
        can.traverse(function(child) {
            if ((child as THREE.Mesh).isMesh) {
                child.castShadow = true;
            }
        });
        otherCans.push(can);
        allCans.push(can);
        scene.add(can);
    });

    const shadowPlane = new THREE.Mesh(
        new THREE.PlaneGeometry(30, 20),
        new THREE.ShadowMaterial({ opacity: 0.2 })
    );
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = -1.7;
    shadowPlane.receiveShadow = true;
    scene.add(shadowPlane);
    
    let scrollY = window.scrollY;
    const animationDistance = window.innerHeight * 3;

    const onScroll = () => {
        scrollY = window.scrollY;
        
        if (mainCan) {
          const scrollFraction = Math.min(scrollY / animationDistance, 1);
          
          const easedFraction = scrollFraction < 0.5 
            ? 4 * scrollFraction * scrollFraction * scrollFraction 
            : 1 - Math.pow(-2 * scrollFraction + 2, 3) / 2;

          mainCan.position.y = THREE.MathUtils.lerp(0, -5, easedFraction);
          
          const minScale = 1.0;
          const maxScale = 1.8;
          const scale = THREE.MathUtils.lerp(minScale, maxScale, easedFraction);
          mainCan.scale.set(scale, scale, scale);
          
          mainCan.rotation.y = THREE.MathUtils.lerp(0, Math.PI * 2, easedFraction);
        }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    const mouse = new THREE.Vector2();
    const onMouseMove = (event: MouseEvent) => {
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', onMouseMove, { passive: true });
    
    const tick = () => {
        const targetLookAt = new THREE.Vector3(mouse.x * 0.2, -mouse.y * 0.2, -1);
        camera.lookAt(targetLookAt);
        
        renderer.render(scene, camera);
        window.requestAnimationFrame(tick);
    };
    tick();

    const onResize = () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    };
    window.addEventListener('resize', onResize);

    return () => {
        window.removeEventListener('resize', onResize);
        window.removeEventListener('scroll', onScroll);
        window.removeEventListener('mousemove', onMouseMove);
        if (mountRef.current && renderer.domElement.parentElement === mountRef.current) {
            mountRef.current.removeChild(renderer.domElement);
        }
        
        const texturesToDispose: THREE.Texture[] = [];
        allCans.forEach(can => {
            can.traverse(object => {
                if (object instanceof THREE.Mesh) {
                    object.geometry.dispose();
                    
                    const materials = Array.isArray(object.material) ? object.material : [object.material];
                    materials.forEach(material => {
                        if (material.map && !texturesToDispose.includes(material.map)) texturesToDispose.push(material.map);
                        if (material.bumpMap && !texturesToDispose.includes(material.bumpMap)) texturesToDispose.push(material.bumpMap);
                        material.dispose()
                    });
                }
            });
        });
        
        texturesToDispose.forEach(texture => texture.dispose());
        renderer.dispose();
    };
  }, []);

  return <div ref={mountRef} className="fixed top-0 left-0 -z-10 h-full w-full" />;
}
