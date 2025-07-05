
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
    texture.anisotropy = 16;

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
    const segments = 128;
    
    const canBody = new THREE.Mesh(new THREE.CylinderGeometry(canRadius, canRadius, bodyHeight, segments), canBodyMaterial);
    canGroup.add(canBody);
    
    // Can Top - Reworked for more realism
    const topGroup = new THREE.Group();
    topGroup.position.y = bodyHeight / 2;

    // The recessed center panel
    const centerPanel = new THREE.Mesh(
        new THREE.CylinderGeometry(canRadius * 0.8, canRadius * 0.8, 0.02, segments),
        metalMaterial
    );
    centerPanel.position.y = -0.04;
    topGroup.add(centerPanel);
    
    // The sloped panel connecting the center to the rim
    const slopedPanel = new THREE.Mesh(
        new THREE.CylinderGeometry(canRadius * 0.98, canRadius * 0.8, 0.04, segments),
        metalMaterial
    );
    slopedPanel.position.y = -0.02;
    topGroup.add(slopedPanel);
    
    // The outer seamed rim
    const rim = new THREE.Mesh(
        new THREE.TorusGeometry(canRadius, 0.03, 16, segments),
        metalMaterial
    );
    rim.rotation.x = Math.PI / 2;
    topGroup.add(rim);

    // Pull Tab
    const pullTab = new THREE.Group();
    const tabShape = new THREE.Shape();
    const arcRadius = 0.18;
    const holeRadius = 0.1;
    const leverWidth = 0.1;
    tabShape.moveTo(-leverWidth / 2, -0.4);
    tabShape.lineTo(leverWidth / 2, -0.4);
    tabShape.absarc(0, -arcRadius, arcRadius, Math.PI * 1.35, Math.PI * -0.35, false);
    tabShape.lineTo(leverWidth / 2, -0.4);

    const tabHole = new THREE.Path();
    tabHole.absarc(0, 0, holeRadius, 0, Math.PI * 2, true);
    tabShape.holes.push(tabHole);

    const extrudeSettings = { depth: 0.04, bevelEnabled: true, bevelSegments: 2, steps: 1, bevelSize: 0.01, bevelThickness: 0.01 };
    const tabGeom = new THREE.ExtrudeGeometry(tabShape, extrudeSettings);
    const tabMesh = new THREE.Mesh(tabGeom, metalMaterial);
    tabMesh.rotation.x = Math.PI / 2;

    const rivetGeom = new THREE.CylinderGeometry(0.05, 0.06, 0.04, 16);
    const rivet = new THREE.Mesh(rivetGeom, metalMaterial);
    rivet.rotation.x = Math.PI / 2;
    rivet.position.y = -0.03;
    
    pullTab.add(tabMesh);
    pullTab.position.set(0.2, 0, 0);
    pullTab.rotation.z = Math.PI / 16;
    pullTab.rotation.y = -Math.PI / 9;
    
    topGroup.add(pullTab, rivet);
    canGroup.add(topGroup);

    // Can Bottom
    const bottomTaperGeom = new THREE.CylinderGeometry(canRadius * 0.98, canRadius, 0.05, segments);
    const bottomTaper = new THREE.Mesh(bottomTaperGeom, metalMaterial);
    bottomTaper.position.y = -bodyHeight / 2 - 0.025;
    canGroup.add(bottomTaper);

    const bottomBaseGeom = new THREE.TorusGeometry(canRadius * 0.9, 0.1, 16, segments);
    const bottomBase = new THREE.Mesh(bottomBaseGeom, metalMaterial);
    bottomBase.rotation.x = Math.PI/2;
    bottomBase.position.y = -bodyHeight / 2 - 0.05;
    canGroup.add(bottomBase);

    canGroup.scale.set(0.9, 0.9, 0.9);
    return canGroup;
}


export function Scene() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current || typeof window === 'undefined') return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    scene.add(camera);
    camera.position.z = 9.5; 

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mountRef.current.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 1.0);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 3.0);
    keyLight.position.set(5, 5, 5);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 20;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xffffff, 1.0);
    fillLight.position.set(-5, 2, 5);
    scene.add(fillLight);
    
    const backLight = new THREE.DirectionalLight(0xffffff, 3.0);
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
    const spacing = 2.0;

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
          
          const easedFraction = 1 - Math.pow(1 - scrollFraction, 3);

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
        const targetLookAt = new THREE.Vector3(mouse.x * 0.2, -mouse.y * 0.2, 0);
        camera.position.x += (mouse.x * 0.5 - camera.position.x) * 0.05;
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
