"use client";

import * as THREE from 'three';
import { useEffect, useRef } from 'react';

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
    mountRef.current.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 2.5);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 3.5);
    directionalLight.position.set(3, 5, 4);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    // Create a canvas texture for the can label
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024; // High-res for crisp text
    const context = canvas.getContext('2d');
    
    const canColor = '#E87722'; // Orange Burst color
    const textColor = 'white';
    const flavorName = 'Orange Burst';
    
    if (context) {
      context.fillStyle = canColor;
      context.fillRect(0, 0, canvas.width, canvas.height);
      
      // Brand Name
      context.font = 'bold 150px "Playfair Display"';
      context.fillStyle = textColor;
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.fillText('RiskIt', canvas.width / 2, canvas.height / 2 - 60);

      // Flavor Name
      context.font = 'bold 70px "PT Sans"';
      context.fillStyle = textColor;
      context.fillText(flavorName.toUpperCase(), canvas.width / 2, canvas.height / 2 + 70);
    }

    const texture = new THREE.CanvasTexture(canvas);

    // Material for the can body with the logo
    const canBodyMaterial = new THREE.MeshStandardMaterial({
        map: texture,
        metalness: 0.6,
        roughness: 0.4,
    });
    
    // Material for the top and bottom of the can
    const canTopBottomMaterial = new THREE.MeshStandardMaterial({
        color: new THREE.Color(canColor),
        metalness: 0.6,
        roughness: 0.4,
    });

    const canGroup = new THREE.Group();
    
    const canBody = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 2.8, 64), canBodyMaterial);
    canBody.position.y = 0;
    canGroup.add(canBody);
    
    const canTop = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 1, 0.15, 64), canTopBottomMaterial);
    canTop.position.y = 1.475;
    canGroup.add(canTop);
    
    const canBottom = new THREE.Mesh(new THREE.CylinderGeometry(1, 0.95, 0.15, 64), canTopBottomMaterial);
    canBottom.position.y = -1.475;
    canGroup.add(canBottom);

    scene.add(canGroup);

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

        if (start && end) {
            camera.position.lerpVectors(start.cameraPos, end.cameraPos, sectionFraction);
            canGroup.rotation.x = THREE.MathUtils.lerp(start.canRotation.x, end.canRotation.x, sectionFraction);
            canGroup.rotation.y = THREE.MathUtils.lerp(start.canRotation.y, end.canRotation.y, sectionFraction);
            canGroup.rotation.z = THREE.MathUtils.lerp(start.canRotation.z, end.canRotation.z, sectionFraction);
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

    const clock = new THREE.Clock();
    
    const tick = () => {
        const elapsedTime = clock.getElapsedTime();
        
        canGroup.position.y = Math.sin(elapsedTime * 0.8) * 0.05;

        const targetLookAt = new THREE.Vector3(mouse.x * 0.1, -mouse.y * 0.1, -1);
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
        if (mountRef.current) {
            mountRef.current.removeChild(renderer.domElement);
        }
        
        scene.traverse(object => {
            if (object instanceof THREE.Mesh) {
                object.geometry.dispose();
                if (Array.isArray(object.material)) {
                    object.material.forEach(material => material.dispose());
                } else {
                    object.material.dispose();
                }
            }
        });
        renderer.dispose();
    };
  }, []);

  return <div ref={mountRef} className="fixed top-0 left-0 -z-10 h-full w-full" />;
}
