
"use client";

import * as THREE from 'three';
import { useEffect, useRef, useCallback } from 'react';
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
    
    const topGroup = new THREE.Group();
    topGroup.position.y = bodyHeight / 2;

    const centerPanel = new THREE.Mesh(
        new THREE.CylinderGeometry(canRadius * 0.8, canRadius * 0.8, 0.02, segments),
        metalMaterial
    );
    centerPanel.position.y = -0.04;
    topGroup.add(centerPanel);
    
    const slopedPanel = new THREE.Mesh(
        new THREE.CylinderGeometry(canRadius * 0.98, canRadius * 0.8, 0.04, segments),
        metalMaterial
    );
    slopedPanel.position.y = -0.02;
    topGroup.add(slopedPanel);
    
    const rim = new THREE.Mesh(
        new THREE.TorusGeometry(canRadius, 0.03, 16, segments),
        metalMaterial
    );
    rim.rotation.x = Math.PI / 2;
    topGroup.add(rim);

    const pullTab = new THREE.Group();
    pullTab.name = "pullTab";
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
    canGroup.userData = { flavorName, flavorColor };
    return canGroup;
}


function createGlass() {
    const points = [
        new THREE.Vector2(0.6, -1.5),
        new THREE.Vector2(0.7, -1.45),
        new THREE.Vector2(0.85, 1.45),
        new THREE.Vector2(0.9, 1.5)
    ];
    const geometry = new THREE.LatheGeometry(points, 32);
    const material = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        metalness: 0.1,
        roughness: 0.05,
        transmission: 1,
        ior: 1.5,
        thickness: 0.3,
        transparent: true,
        opacity: 0.5,
        side: THREE.DoubleSide
    });
    const glass = new THREE.Mesh(geometry, material);
    glass.visible = false;
    return glass;
}

function createParticles(color: string) {
    const particleCount = 2000;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i++) {
        positions[i] = 0;
        velocities[i] = 0;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));
    
    const material = new THREE.PointsMaterial({
        color: color,
        size: 0.03,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending,
        sizeAttenuation: true
    });

    const particles = new THREE.Points(geometry, material);
    particles.visible = false;
    return particles;
}

export function Scene() {
  const mountRef = useRef<HTMLDivElement>(null);
  const animationState = useRef({
      isAnimating: false,
      can: null as THREE.Group | null,
      glass: null as THREE.Mesh | null,
      particles: null as THREE.Points | null,
      originalPosition: new THREE.Vector3(),
      originalRotation: new THREE.Euler(),
      stage: 'idle' as 'idle' | 'lifting' | 'opening' | 'tilting' | 'pouring' | 'resetting',
      startTime: 0,
      pourStartTime: 0,
      liquidLevel: -1.5,
      cameraInitialPosition: new THREE.Vector3(),
      cameraInitialLookAt: new THREE.Vector3(),
  });
  
  const popSound = useRef<HTMLAudioElement | null>(null);
  const pourSound = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!mountRef.current || typeof window === 'undefined') return;

    popSound.current = new Audio('https://cdn.pixabay.com/audio/2022/03/15/audio_19b1683932.mp3');
    pourSound.current = new Audio('https://cdn.pixabay.com/audio/2022/09/20/audio_5514f6b289.mp3');
    if (pourSound.current) pourSound.current.loop = true;

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

    const spacing = 2.5;
    const totalCans = flavors.length;

    // Create a new array with Orange Burst at the 4th position (index 3) to be near the center
    const reorderedFlavors = [...flavors];
    const mainCanIndexOriginal = reorderedFlavors.findIndex(f => f.name === 'Orange Burst');
    if (mainCanIndexOriginal !== -1 && mainCanIndexOriginal !== 3) {
        const [mainCanFlavor] = reorderedFlavors.splice(mainCanIndexOriginal, 1);
        reorderedFlavors.splice(3, 0, mainCanFlavor);
    }

    reorderedFlavors.forEach((flavor, index) => {
        const can = createCanMesh(flavor.name, flavor.color);
        
        // This calculation places the cans symmetrically around x=0
        const position = (index - (totalCans - 1) / 2) * spacing;
        can.position.x = position;
        
        can.castShadow = true;
        can.traverse(function(child) { if ((child as THREE.Mesh).isMesh) { child.castShadow = true; } });

        if (flavor.name === 'Orange Burst') {
            mainCan = can;
        } else {
            otherCans.push(can);
        }
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
        if (animationState.current.isAnimating) return;
        scrollY = window.scrollY;
        
        if (mainCan) {
          const scrollFraction = Math.min(scrollY / animationDistance, 1);
          const easedFraction = 1 - Math.pow(1 - scrollFraction, 3);
          mainCan.position.y = THREE.MathUtils.lerp(0, -5, easedFraction);
          const scale = THREE.MathUtils.lerp(1.0, 1.8, easedFraction);
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
    
    const raycaster = new THREE.Raycaster();
    const handleClick = (event: MouseEvent) => {
        if (animationState.current.isAnimating) return;
        
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);

        const intersects = raycaster.intersectObjects(allCans, true);

        if (intersects.length > 0) {
            let clickedObject = intersects[0].object;
            while(clickedObject.parent && !allCans.includes(clickedObject as THREE.Group)) {
                clickedObject = clickedObject.parent;
            }
            const can = clickedObject as THREE.Group;
            const flavor = flavors.find(f => f.name === can.userData.flavorName);

            if (can && flavor) {
                const state = animationState.current;
                state.isAnimating = true;
                state.can = can;
                state.originalPosition.copy(can.position);
                state.originalRotation.copy(can.rotation);
                state.stage = 'lifting';
                state.startTime = performance.now();
                state.liquidLevel = -1.5;
                
                state.cameraInitialPosition.copy(camera.position);
                const controls = scene.getObjectByName("cameraLookAtTarget");
                if (controls) state.cameraInitialLookAt.copy(controls.position);
                
                state.glass = createGlass();
                scene.add(state.glass);

                state.particles = createParticles(flavor.color);
                scene.add(state.particles);
            }
        }
    };
    window.addEventListener('click', handleClick);

    const clock = new THREE.Clock();
    const cameraLookAtTarget = new THREE.Object3D();
    cameraLookAtTarget.name = "cameraLookAtTarget";
    scene.add(cameraLookAtTarget);

    const tick = () => {
        const delta = clock.getDelta();
        const state = animationState.current;
        
        if (state.isAnimating && state.can) {
            const can = state.can;
            const pullTab = can.getObjectByName('pullTab');
            const glass = state.glass;
            const particles = state.particles;
            const elapsedTime = (performance.now() - state.startTime) / 1000;
            
            // --- Camera Animation ---
            const worldPosition = new THREE.Vector3();
            can.getWorldPosition(worldPosition);

            const focusPoint = worldPosition.clone().add(new THREE.Vector3(0, 1, 4));
            camera.position.lerp(focusPoint, 0.05);
            cameraLookAtTarget.position.lerp(worldPosition, 0.05);
            camera.lookAt(cameraLookAtTarget.position);

            switch(state.stage) {
                case 'lifting': {
                    const targetY = state.originalPosition.y + 2;
                    can.position.y = THREE.MathUtils.damp(can.position.y, targetY, 4, delta);
                    if (Math.abs(can.position.y - targetY) < 0.01) {
                        state.stage = 'opening';
                        state.startTime = performance.now();
                    }
                    break;
                }
                case 'opening': {
                    const targetRotX = -Math.PI / 2;
                    if(pullTab) pullTab.rotation.x = THREE.MathUtils.damp(pullTab.rotation.x, targetRotX, 8, delta);
                    if (Math.abs(pullTab.rotation.x - targetRotX) < 0.1) {
                        if (state.stage === 'opening') {
                             popSound.current?.play();
                             state.stage = 'tilting';
                             state.startTime = performance.now();
                        }
                    }
                    break;
                }
                case 'tilting': {
                    const targetPos = new THREE.Vector3(state.originalPosition.x, state.originalPosition.y + 1, 2.5);
                    can.position.x = THREE.MathUtils.damp(can.position.x, targetPos.x, 4, delta);
                    can.position.y = THREE.MathUtils.damp(can.position.y, targetPos.y, 4, delta);
                    can.position.z = THREE.MathUtils.damp(can.position.z, targetPos.z, 4, delta);

                    const targetRotX = -Math.PI / 2.2;
                    can.rotation.x = THREE.MathUtils.damp(can.rotation.x, targetRotX, 4, delta);

                    if (glass) {
                        glass.visible = true;
                        
                        const glassWorldPosition = new THREE.Vector3();
                        can.getWorldPosition(glassWorldPosition);
                        glass.position.set(glassWorldPosition.x, worldPosition.y - 1.5, 3);
                        
                        const progress = Math.min(elapsedTime / 0.5, 1);
                        glass.scale.set(progress, progress, progress);
                    }

                    if (Math.abs(can.rotation.x - targetRotX) < 0.1) {
                        state.stage = 'pouring';
                        state.pourStartTime = performance.now();
                        pourSound.current?.play();
                    }
                    break;
                }
                case 'pouring': {
                    const pourDuration = 3000;
                    if (performance.now() - state.pourStartTime > pourDuration) {
                        state.stage = 'resetting';
                        state.startTime = performance.now();
                        pourSound.current?.pause();
                        if (pourSound.current) pourSound.current.currentTime = 0;
                    }

                    if (particles && glass && can) {
                        particles.visible = true;
                        state.liquidLevel = THREE.MathUtils.lerp(-1.5, 0.8, (performance.now() - state.pourStartTime) / pourDuration);

                        const positions = particles.geometry.attributes.position.array as Float32Array;
                        const velocities = particles.geometry.attributes.velocity.array as Float32Array;
                        const pourLocalOrigin = new THREE.Vector3(0, 1.4, 0);
                        const pourWorldOrigin = pourLocalOrigin.clone().applyMatrix4(can.matrixWorld);

                        for (let i = 0; i < positions.length; i += 3) {
                           const isDead = velocities[i+1] === 0;

                           if (isDead && Math.random() < 0.1) { // Respawn
                                positions[i] = pourWorldOrigin.x + (Math.random() - 0.5) * 0.1;
                                positions[i+1] = pourWorldOrigin.y;
                                positions[i+2] = pourWorldOrigin.z + (Math.random() - 0.5) * 0.1;

                                velocities[i] = (Math.random() - 0.5) * 0.1;
                                velocities[i+1] = -0.1 - (Math.random() * 0.05); // Initial downward velocity
                                velocities[i+2] = (Math.random() - 0.5) * 0.1;
                           }
                           
                           if (!isDead) {
                                velocities[i+1] -= 0.005; // Gravity
                                positions[i] += velocities[i];
                                positions[i+1] += velocities[i+1];
                                positions[i+2] += velocities[i+2];

                                const particlePos = new THREE.Vector3(positions[i], positions[i+1], positions[i+2]);
                                const glassPos = glass.position;
                                const glassRadius = 0.85;

                                if (particlePos.y < glassPos.y + state.liquidLevel && 
                                    particlePos.distanceTo(new THREE.Vector3(glassPos.x, particlePos.y, glassPos.z)) < glassRadius) {
                                    velocities[i+1] = 0; // Kill particle
                                }
                           }
                        }
                        particles.geometry.attributes.position.needsUpdate = true;
                    }
                    break;
                }
                 case 'resetting': {
                    can.position.x = THREE.MathUtils.damp(can.position.x, state.originalPosition.x, 4, delta);
                    can.position.y = THREE.MathUtils.damp(can.position.y, state.originalPosition.y, 4, delta);
                    can.position.z = THREE.MathUtils.damp(can.position.z, state.originalPosition.z, 4, delta);
                    
                    can.rotation.x = THREE.MathUtils.damp(can.rotation.x, state.originalRotation.x, 4, delta);
                    can.rotation.y = THREE.MathUtils.damp(can.rotation.y, state.originalRotation.y, 4, delta);
                    can.rotation.z = THREE.MathUtils.damp(can.rotation.z, state.originalRotation.z, 4, delta);
                    
                    if(glass) glass.scale.x = THREE.MathUtils.damp(glass.scale.x, 0, 8, delta);
                    if(glass) glass.scale.y = THREE.MathUtils.damp(glass.scale.y, 0, 8, delta);
                    if(glass) glass.scale.z = THREE.MathUtils.damp(glass.scale.z, 0, 8, delta);
                    
                    if(pullTab) pullTab.rotation.x = THREE.MathUtils.damp(pullTab.rotation.x, 0, 4, delta);

                    if (can.position.distanceTo(state.originalPosition) < 0.01) {
                        if (glass) scene.remove(glass);
                        if (particles) scene.remove(particles);
                        state.isAnimating = false;
                        state.can = null;
                        state.stage = 'idle';
                    }
                    break;
                }
            }
        } else {
             // --- Default Camera Behavior ---
             cameraLookAtTarget.position.x = mouse.x * 0.2;
             cameraLookAtTarget.position.y = -mouse.y * 0.2;
             
             const targetCamPos = new THREE.Vector3(mouse.x * 0.5, 0, 9.5);
             camera.position.lerp(targetCamPos, 0.05);
             camera.lookAt(cameraLookAtTarget.position);
        }
        
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
        window.removeEventListener('click', handleClick);
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
