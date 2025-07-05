
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
    const canRadius = 1.0;
    const bodyHeight = 2.8;
    const segments = 64;
    
    const canBody = new THREE.Mesh(new THREE.CylinderGeometry(canRadius, canRadius, bodyHeight, segments), canBodyMaterial);
    canGroup.add(canBody);
    
    const topTaperHeight = 0.2;
    const canTopTaper = new THREE.Mesh(new THREE.CylinderGeometry(canRadius * 0.9, canRadius, topTaperHeight, segments), metalMaterial);
    canTopTaper.position.y = bodyHeight / 2 + topTaperHeight / 2;
    canGroup.add(canTopTaper);
    
    const lidHeight = 0.05;
    const canTopLid = new THREE.Mesh(new THREE.CylinderGeometry(canRadius * 0.9, canRadius * 0.88, lidHeight, segments), metalMaterial);
    canTopLid.position.y = canTopTaper.position.y + topTaperHeight / 2;
    canGroup.add(canTopLid);

    const bottomTaperHeight = 0.2;
    const canBottomTaper = new THREE.Mesh(new THREE.CylinderGeometry(canRadius, canRadius * 0.9, bottomTaperHeight, segments), metalMaterial);
    canBottomTaper.position.y = -bodyHeight / 2 - bottomTaperHeight / 2;
    canGroup.add(canBottomTaper);
    
    const bottomRimHeight = 0.1;
    const canBottomRim = new THREE.Mesh(new THREE.CylinderGeometry(canRadius * 0.9, canRadius * 0.9, bottomRimHeight, segments), metalMaterial);
    canBottomRim.position.y = canBottomTaper.position.y - bottomTaperHeight / 2;
    canGroup.add(canBottomRim);

    return canGroup;
}


export function Scene() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current || typeof window === 'undefined') return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    scene.add(camera);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mountRef.current.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 1.0);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 4.5);
    directionalLight.position.set(5, 5, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 1024;
    directionalLight.shadow.mapSize.height = 1024;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 20;
    scene.add(directionalLight);

    const allCans: THREE.Group[] = [];
    let mainCan: THREE.Group | null = null;
    const otherCans: THREE.Group[] = [];

    const otherFlavors = flavors.filter(f => f.name !== 'Orange Burst');

    otherFlavors.forEach((flavor, index) => {
        const can = createCanMesh(flavor.name, flavor.color);
        const angle = (index / (otherFlavors.length - 1)) * Math.PI * 1.4 - (Math.PI * 1.4 / 2);
        const radius = 6;
        can.position.x = Math.sin(angle) * radius;
        can.position.z = -Math.cos(angle) * radius * 0.5 - 3.5;
        can.rotation.y = -angle;
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

    const orangeBurstFlavor = flavors.find(f => f.name === 'Orange Burst');
    if (orangeBurstFlavor) {
        mainCan = createCanMesh(orangeBurstFlavor.name, orangeBurstFlavor.color);
        mainCan.castShadow = true;
        mainCan.traverse(function(child) {
            if ((child as THREE.Mesh).isMesh) {
                child.castShadow = true;
            }
        });
        allCans.push(mainCan);
        scene.add(mainCan);
    }

    const shadowPlane = new THREE.Mesh(
        new THREE.PlaneGeometry(20, 20),
        new THREE.ShadowMaterial({ opacity: 0.2 })
    );
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = -2.2;
    shadowPlane.receiveShadow = true;
    scene.add(shadowPlane);

    const scrollPoints = [
        { cameraPos: new THREE.Vector3(0, 0, 5), canRotation: new THREE.Euler(0, 0, 0) },
        { cameraPos: new THREE.Vector3(-1.5, 0, 4), canRotation: new THREE.Euler(0.1, -Math.PI * 0.3, -0.1) },
        { cameraPos: new THREE.Vector3(1.5, 0, 4), canRotation: new THREE.Euler(-0.1, Math.PI * 0.3, 0.1) },
        { cameraPos: new THREE.Vector3(0, -0.5, 4.5), canRotation: new THREE.Euler(0, Math.PI, 0) },
        { cameraPos: new THREE.Vector3(0, 0, 5), canRotation: new THREE.Euler(0, Math.PI * 2, 0) },
    ];
    
    let scrollY = window.scrollY;
    const pageHeight = document.body.scrollHeight - window.innerHeight;

    const onScroll = () => {
        scrollY = window.scrollY;
        
        const scrollFraction = scrollY / pageHeight;
        const keyframeIndex = Math.min(scrollPoints.length - 2, Math.floor(scrollFraction * (scrollPoints.length - 1)));
        const sectionFraction = (scrollFraction * (scrollPoints.length - 1)) - keyframeIndex;

        const start = scrollPoints[keyframeIndex];
        const end = scrollPoints[keyframeIndex + 1];

        if (start && end && mainCan) {
            camera.position.lerpVectors(start.cameraPos, end.cameraPos, sectionFraction);
            mainCan.rotation.x = THREE.MathUtils.lerp(start.canRotation.x, end.canRotation.x, sectionFraction);
            mainCan.rotation.y = THREE.MathUtils.lerp(start.canRotation.y, end.canRotation.y, sectionFraction);
            mainCan.rotation.z = THREE.MathUtils.lerp(start.canRotation.z, end.canRotation.z, sectionFraction);
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
        const targetLookAt = new THREE.Vector3(mouse.x * 0.1, -mouse.y * 0.1, -1);
        camera.lookAt(targetLookAt);
        
        otherCans.forEach(can => {
            can.rotation.y += 0.003;
        });
        
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
