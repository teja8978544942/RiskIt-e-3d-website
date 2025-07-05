
'use client';

import * as THREE from 'three';
import { useEffect, useRef } from 'react';
import { createCanMesh } from '@/components/can-model';

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

interface PourAnimationProps {
    flavorName: string;
    flavorColor: string;
    onComplete: () => void;
}

export function PourAnimation({ flavorName, flavorColor, onComplete }: PourAnimationProps) {
    const mountRef = useRef<HTMLDivElement>(null);
    const onCompleteRef = useRef(onComplete);
    onCompleteRef.current = onComplete;

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

    useEffect(() => {
        if (!mountRef.current || typeof window === 'undefined') return;

        const currentMount = mountRef.current;
        
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.z = 8;
        scene.add(camera);

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        currentMount.appendChild(renderer.domElement);

        const ambientLight = new THREE.AmbientLight(0xffffff, 1.0);
        scene.add(ambientLight);

        const keyLight = new THREE.DirectionalLight(0xffffff, 3.0);
        keyLight.position.set(5, 5, 5);
        keyLight.castShadow = true;
        scene.add(keyLight);
        
        const fillLight = new THREE.DirectionalLight(0xffffff, 1.0);
        fillLight.position.set(-5, 2, 5);
        scene.add(fillLight);
        
        const backLight = new THREE.DirectionalLight(0xffffff, 3.0);
        backLight.position.set(0, 8, -10);
        scene.add(backLight);

        const shadowPlane = new THREE.Mesh(
            new THREE.PlaneGeometry(30, 20),
            new THREE.ShadowMaterial({ opacity: 0.2 })
        );
        shadowPlane.rotation.x = -Math.PI / 2;
        shadowPlane.position.y = -1.7;
        shadowPlane.receiveShadow = true;
        scene.add(shadowPlane);

        const state = animationState.current;

        const clock = new THREE.Clock();
        const cameraLookAtTarget = new THREE.Object3D();
        scene.add(cameraLookAtTarget);
        
        let animationFrameId: number;

        const tick = () => {
            animationFrameId = requestAnimationFrame(tick);
            const delta = clock.getDelta();
            const state = animationState.current;
            
            if (state.isAnimating && state.can) {
                const can = state.can;
                const pullTab = can.getObjectByName('pullTab');
                const glass = state.glass;
                const particles = state.particles;
                const elapsedTime = (performance.now() - state.startTime) / 1000;
                
                const worldPosition = new THREE.Vector3();
                can.getWorldPosition(worldPosition);

                const focusPoint = worldPosition.clone().add(new THREE.Vector3(0, 1, 4));
                camera.position.lerp(focusPoint, 0.04);
                cameraLookAtTarget.position.lerp(worldPosition, 0.04);
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
                        if (pullTab && Math.abs(pullTab.rotation.x - targetRotX) < 0.1) {
                            if (state.stage === 'opening') {
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
                            if (state.stage === 'tilting') {
                                state.stage = 'pouring';
                                state.pourStartTime = performance.now();
                            }
                        }
                        break;
                    }
                    case 'pouring': {
                        const pourDuration = 3000;
                        if (performance.now() - state.pourStartTime > pourDuration) {
                            state.stage = 'resetting';
                            state.startTime = performance.now();
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
                                  velocities[i+1] -= 0.3 * delta; // Framerate-independent gravity
                                  positions[i] += velocities[i] * delta * 60;
                                  positions[i+1] += velocities[i+1] * delta * 60;
                                  positions[i+2] += velocities[i+2] * delta * 60;

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
                        can.position.x = THREE.MathUtils.damp(can.position.x, state.originalPosition.x, 2, delta);
                        can.position.y = THREE.MathUtils.damp(can.position.y, state.originalPosition.y, 2, delta);
                        can.position.z = THREE.MathUtils.damp(can.position.z, state.originalPosition.z, 2, delta);
                        
                        can.rotation.x = THREE.MathUtils.damp(can.rotation.x, state.originalRotation.x, 2, delta);
                        can.rotation.y = THREE.MathUtils.damp(can.rotation.y, state.originalRotation.y, 2, delta);
                        can.rotation.z = THREE.MathUtils.damp(can.rotation.z, state.originalRotation.z, 2, delta);
                        
                        if(glass) glass.scale.x = THREE.MathUtils.damp(glass.scale.x, 0, 4, delta);
                        if(glass) glass.scale.y = THREE.MathUtils.damp(glass.scale.y, 0, 4, delta);
                        if(glass) glass.scale.z = THREE.MathUtils.damp(glass.scale.z, 0, 4, delta);
                        
                        if(pullTab) pullTab.rotation.x = THREE.MathUtils.damp(pullTab.rotation.x, 0, 2, delta);

                        if (can.position.distanceTo(state.originalPosition) < 0.1) {
                             if (state.stage === 'resetting') {
                                state.stage = 'idle'; // Prevent re-triggering
                                onCompleteRef.current();
                            }
                        }
                        break;
                    }
                }
            }
            renderer.render(scene, camera);
        };
        
        const initScene = async () => {
            const can = await createCanMesh(flavorName, flavorColor);
            can.castShadow = true;
            can.traverse(function(child) { if ((child as THREE.Mesh).isMesh) { child.castShadow = true; } });
            scene.add(can);

            animationState.current.isAnimating = true;
            animationState.current.can = can;
            animationState.current.originalPosition.copy(can.position);
            animationState.current.originalRotation.copy(can.rotation);
            animationState.current.stage = 'lifting';
            animationState.current.startTime = performance.now();
            animationState.current.liquidLevel = -1.5;

            animationState.current.glass = createGlass();
            scene.add(animationState.current.glass);

            animationState.current.particles = createParticles(flavorColor);
            scene.add(animationState.current.particles);

            tick();
        };

        initScene();

        const onResize = () => {
            if (currentMount) {
              camera.aspect = window.innerWidth / window.innerHeight;
              camera.updateProjectionMatrix();
              renderer.setSize(window.innerWidth, window.innerHeight);
            }
        };
        window.addEventListener('resize', onResize);

        return () => {
            window.removeEventListener('resize', onResize);
            cancelAnimationFrame(animationFrameId);

            if (currentMount && renderer.domElement.parentElement === currentMount) {
                currentMount.removeChild(renderer.domElement);
            }
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
            renderer.dispose();
        };
    }, [flavorName, flavorColor]);

    return (
        <div className="fixed inset-0 z-50 bg-background">
            <div ref={mountRef} className="h-full w-full" />
        </div>
    );
}
