
'use client';

import * as THREE from 'three';
import { useEffect, useRef, useState } from 'react';
import { flavors } from '@/lib/flavors';
import { useParams, useRouter } from 'next/navigation';
import { createCanMesh } from '@/components/can-model';
import { TsunamiAnimation } from '@/components/tsunami-animation';
import { cn } from '@/lib/utils';

function createGlass() {
    const points = [
        new THREE.Vector2(0.6, -1.5),
        new THREE.Vector2(0.7, -1.45),
        new THREE.Vector2(0.85, 1.45),
        new THREE.Vector2(0.9, 1.5)
    ];
    const geometry = new THREE.LatheGeometry(points, 64);
    const material = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        metalness: 0,
        roughness: 0.1,
        transmission: 1.0,
        ior: 1.52,
        thickness: 1.5,
        specularIntensity: 1.0,
        clearcoat: 1.0,
        clearcoatRoughness: 0.1,
        transparent: true,
        side: THREE.FrontSide,
    });
    const glass = new THREE.Mesh(geometry, material);
    glass.visible = false;
    glass.castShadow = true;
    return glass;
}

function createParticles(color: string) {
    const particleCount = 10000;
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
        color: new THREE.Color(color),
        size: 0.03,
        transparent: true,
        opacity: 0.8,
        blending: THREE.NormalBlending,
        sizeAttenuation: true
    });

    const particles = new THREE.Points(geometry, material);
    particles.visible = false;
    return particles;
}

function createLiquid(color: string) {
    const flavorColor = new THREE.Color(color);
    const depthColor = flavorColor.clone().multiplyScalar(0.5);
    const surfaceColor = flavorColor.clone().lerp(new THREE.Color(0xffffff), 0.5);

    const canvas = document.createElement('canvas');
    canvas.width = 2;
    canvas.height = 256;
    const context = canvas.getContext('2d');
    if (context) {
        const gradient = context.createLinearGradient(0, 0, 0, 256);
        gradient.addColorStop(0, surfaceColor.getStyle());
        gradient.addColorStop(1, depthColor.getStyle());
        context.fillStyle = gradient;
        context.fillRect(0, 0, canvas.width, canvas.height);
    }
    const gradientTexture = new THREE.CanvasTexture(canvas);

    const geometry = new THREE.CylinderGeometry(0.84, 0.65, 3.2, 32);
    const material = new THREE.MeshPhysicalMaterial({
        map: gradientTexture,
        metalness: 0,
        roughness: 0.05,
        transmission: 0.95,
        ior: 1.33,
        thickness: 2.5,
        transparent: true,
    });
    const liquid = new THREE.Mesh(geometry, material);
    liquid.position.y = -0.15;
    liquid.visible = false;
    return liquid;
}

function createFoamTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const context = canvas.getContext('2d');
    if (context) {
        context.fillStyle = 'rgba(255, 255, 255, 0.8)';
        context.fillRect(0, 0, 512, 512);
        
        // Large bubbles
        for (let i = 0; i < 50; i++) {
            context.beginPath();
            const x = Math.random() * 512;
            const y = Math.random() * 512;
            const r = Math.random() * 30 + 10;
            const grad = context.createRadialGradient(x, y, r * 0.25, x, y, r);
            grad.addColorStop(0, `rgba(255, 255, 255, ${0.4 + Math.random() * 0.3})`);
            grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
            context.fillStyle = grad;
            context.arc(x, y, r, 0, Math.PI * 2);
            context.fill();
        }

        // Small bubbles
        for (let i = 0; i < 400; i++) {
            context.beginPath();
            const x = Math.random() * 512;
            const y = Math.random() * 512;
            const r = Math.random() * 5 + 2;
            const grad = context.createRadialGradient(x, y, r * 0.1, x, y, r);
            grad.addColorStop(0, `rgba(255, 255, 255, ${0.5 + Math.random() * 0.3})`);
            grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
            context.fillStyle = grad;
            context.arc(x, y, r, 0, Math.PI * 2);
            context.fill();
        }
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(1, 1);
    texture.anisotropy = 16;
    return texture;
}


function createFoam() {
    const foamTexture = createFoamTexture();
    const geometry = new THREE.CylinderGeometry(0.84, 0.84, 0.1, 32);
    const material = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        map: foamTexture,
        alphaMap: foamTexture,
        bumpMap: foamTexture,
        bumpScale: 0.01,
        transparent: true,
        opacity: 0.95,
        roughness: 0.9,
        metalness: 0,
    });
    const foam = new THREE.Mesh(geometry, material);
    foam.visible = false;
    return foam;
}


export default function PourPage() {
    const mountRef = useRef<HTMLDivElement>(null);
    const router = useRouter();
    const params = useParams();
    const flavorName = decodeURIComponent(params.flavor as string);
    const [animationStage, setAnimationStage] = useState<'tsunami' | 'pouring'>('tsunami');

    const animationState = useRef({
      isAnimating: false,
      can: null as THREE.Group | null,
      glass: null as THREE.Mesh | null,
      particles: null as THREE.Points | null,
      liquid: null as THREE.Mesh | null,
      foam: null as THREE.Mesh | null,
      liquidClipPlane: null as THREE.Plane | null,
      originalPosition: new THREE.Vector3(),
      originalRotation: new THREE.Euler(),
      stage: 'idle' as 'idle' | 'lifting' | 'opening' | 'tilting' | 'pouring' | 'resetting',
      startTime: 0,
      pourStartTime: 0,
      cameraInitialPosition: new THREE.Vector3(),
      cameraInitialLookAt: new THREE.Vector3(),
    });

    const flavor = flavors.find(f => f.name === flavorName);

    useEffect(() => {
        if (!flavor) {
            router.push('/');
        }
    }, [flavor, router]);

    useEffect(() => {
        if (animationStage !== 'pouring' || !mountRef.current || typeof window === 'undefined' || !flavor) return;

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
        renderer.localClippingEnabled = true;
        currentMount.appendChild(renderer.domElement);

        const hemiLight = new THREE.HemisphereLight(0xffffff, 0xbbbbbb, 2.0);
        hemiLight.position.set(0, 20, 0);
        scene.add(hemiLight);

        const keyLight = new THREE.DirectionalLight(0xffffff, 2.0);
        keyLight.position.set(5, 5, 5);
        keyLight.castShadow = true;
        scene.add(keyLight);
        
        const fillLight = new THREE.DirectionalLight(0xffffff, 0.7);
        fillLight.position.set(-5, 2, 5);
        scene.add(fillLight);
        
        const backLight = new THREE.DirectionalLight(0xffffff, 2.5);
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
            const time = clock.getElapsedTime();
            const state = animationState.current;
            
            if (state.isAnimating && state.can) {
                const can = state.can;
                const pullTab = can.getObjectByName('pullTab');
                const glass = state.glass;
                const particles = state.particles;
                const liquid = state.liquid;
                const foam = state.foam;
                const liquidClipPlane = state.liquidClipPlane;
                
                let cameraTargetPos = new THREE.Vector3(4.5, 0, 8);
                let cameraLookAtPos = new THREE.Vector3(4.5, 0, 0);

                if (state.stage === 'pouring' && glass) {
                    cameraTargetPos = new THREE.Vector3(glass.position.x, glass.position.y + 1, glass.position.z + 4);
                    cameraLookAtPos = new THREE.Vector3(glass.position.x, glass.position.y, glass.position.z);
                }

                camera.position.lerp(cameraTargetPos, 0.04);
                cameraLookAtTarget.position.lerp(cameraLookAtPos, 0.04);
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
                        const targetPos = new THREE.Vector3(4.0, 2.2, 2.5);
                        can.position.x = THREE.MathUtils.damp(can.position.x, targetPos.x, 4, delta);
                        can.position.y = THREE.MathUtils.damp(can.position.y, targetPos.y, 4, delta);
                        can.position.z = THREE.MathUtils.damp(can.position.z, targetPos.z, 4, delta);

                        const targetRotX = -Math.PI / 2.2;
                        can.rotation.x = THREE.MathUtils.damp(can.rotation.x, targetRotX, 4, delta);

                        if (glass) {
                            glass.visible = true;
                            const progress = Math.min((performance.now() - state.startTime) / 800, 1);
                            glass.scale.set(progress, progress, progress);
                        }

                        if (Math.abs(can.rotation.x - targetRotX) < 0.1) {
                            if (state.stage === 'tilting') {
                                state.stage = 'pouring';
                                state.pourStartTime = performance.now();
                                if(liquid && foam && glass) {
                                    liquid.visible = true;
                                    foam.visible = true;
                                    liquid.position.copy(glass.position);
                                    liquid.position.y -= 0.15;
                                }
                            }
                        }
                        break;
                    }
                    case 'pouring': {
                        const pourDuration = 2000;
                        const pourProgress = Math.min((performance.now() - state.pourStartTime) / pourDuration, 1);

                        // Dolly zoom effect
                        camera.fov = THREE.MathUtils.lerp(75, 65, pourProgress);
                        camera.updateProjectionMatrix();

                        if (pourProgress >= 1) {
                           if (state.stage === 'pouring') {
                                state.stage = 'idle';
                                router.push('/');
                            }
                        }

                        const glassBottomY = -1.7;
                        const glassTopY = 1.45;
                        const liquidSurfaceY = THREE.MathUtils.lerp(glassBottomY, glassTopY + 0.1, pourProgress);
                        
                        if (liquidClipPlane) {
                           liquidClipPlane.constant = liquidSurfaceY;
                        }

                        if (foam && (foam.material as THREE.MeshStandardMaterial).map) {
                            const foamMaterial = foam.material as THREE.MeshStandardMaterial;
                            const map = foamMaterial.map as THREE.Texture;

                            const swell = Math.sin(pourProgress * Math.PI * 0.5);
                            const dissipate = 1 - pourProgress;
                            const foamHeight = 0.05 + swell * 0.5 * dissipate;
                            foam.scale.y = foamHeight;

                            foam.scale.x = foam.scale.z = 1 + Math.sin(time * 20) * 0.02 + Math.sin(time * 33) * 0.03;
                            foam.position.y = liquidSurfaceY + (foamHeight / 2) - 0.05;
                            foam.position.y += Math.sin(time * 50) * 0.01;
                            
                            map.offset.y = -time * 0.2;
                            map.offset.x = Math.sin(time * 10) * 0.05;
                            
                            foamMaterial.opacity = Math.max(0, 0.9 * dissipate);
                            
                            foam.position.x = glass.position.x;
                            foam.position.z = glass.position.z;
                        }


                        if (particles && glass && can && liquid) {
                            particles.visible = true;

                            const positions = particles.geometry.attributes.position.array as Float32Array;
                            const velocities = particles.geometry.attributes.velocity.array as Float32Array;
                            const pourLocalOrigin = new THREE.Vector3(0.35, 1.4, 0);
                            const pourWorldOrigin = pourLocalOrigin.clone().applyMatrix4(can.matrixWorld);
                            
                            const glassRadius = 0.85;
                            const emissionRate = (0.2 + (Math.sin(time * 25) * 0.18)) * pourProgress;

                            for (let i = 0; i < positions.length; i += 3) {
                              const isDead = velocities[i] === 0 && velocities[i+1] === 0 && velocities[i+2] === 0;

                              if (isDead && Math.random() < emissionRate) {
                                  positions[i] = pourWorldOrigin.x + (Math.random() - 0.5) * 0.04;
                                  positions[i+1] = pourWorldOrigin.y;
                                  positions[i+2] = pourWorldOrigin.z + (Math.random() - 0.5) * 0.04;

                                  velocities[i] = (Math.random() - 0.5) * 0.05;
                                  velocities[i+1] = -0.2 - (Math.random() * 0.15);
                                  velocities[i+2] = (Math.random() - 0.5) * 0.05;
                              }
                              
                              if (!isDead) {
                                  const particleIsSplashing = velocities[i+1] > 0.01;

                                  if(particleIsSplashing) {
                                    velocities[i+1] -= 0.5 * delta;
                                  } else {
                                    velocities[i+1] -= 1.2 * delta;
                                  }

                                  positions[i] += velocities[i] * delta * 60;
                                  positions[i+1] += velocities[i+1] * delta * 60;
                                  positions[i+2] += velocities[i+2] * delta * 60;

                                  const isFalling = velocities[i+1] < 0;
                                  const particleY = positions[i+1];
                                  const particleXZ = new THREE.Vector2(positions[i] - glass.position.x, positions[i+2] - glass.position.z);

                                  if (isFalling && particleY < liquidSurfaceY && particleXZ.length() < glassRadius) {
                                      positions[i+1] = liquidSurfaceY;

                                      const splashFactor = 0.2;
                                      velocities[i] += (Math.random() - 0.5) * splashFactor;
                                      velocities[i+1] = (0.05 + Math.random() * 0.15);
                                      velocities[i+2] += (Math.random() - 0.5) * splashFactor;
                                  }

                                  if (particleY < glass.position.y - 1.5 || (particleIsSplashing && velocities[i+1] < 0.01)) {
                                     velocities[i] = 0;
                                     velocities[i+1] = 0;
                                     velocities[i+2] = 0;
                                  }
                              }
                            }
                            particles.geometry.attributes.position.needsUpdate = true;
                        }
                        break;
                    }
                    case 'resetting': {
                        break;
                    }
                }
            }
            renderer.render(scene, camera);
        };
        
        const initScene = async () => {
            const can = await createCanMesh(flavor.name, flavor.color);
            can.traverse(function(child) {
              if ((child as THREE.Mesh).isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
              }
            });
            scene.add(can);

            state.isAnimating = true;
            state.can = can;
            state.originalPosition.copy(can.position);
            state.originalRotation.copy(can.rotation);
            state.stage = 'lifting';
            state.startTime = performance.now();

            state.glass = createGlass();
            state.glass.position.set(4.0, -0.2, 2.5);
            scene.add(state.glass);

            state.particles = createParticles(flavor.color);
            scene.add(state.particles);

            state.liquid = createLiquid(flavor.color);
            const liquidClipPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -1.7);
            (state.liquid.material as THREE.Material).clippingPlanes = [liquidClipPlane];
            state.liquidClipPlane = liquidClipPlane;
            scene.add(state.liquid);

            state.foam = createFoam();
            scene.add(state.foam);

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
                        if (material.alphaMap) material.alphaMap.dispose();
                        material.dispose()
                    });
                }
            });
            renderer.dispose();
        };
    }, [flavorName, router, animationStage, flavor]);
    
    if (!flavor) {
        return null;
    }

    return (
        <main className={cn(
            "fixed inset-0 transition-colors duration-500",
            animationStage === 'tsunami' ? 'bg-black' : 'bg-background'
        )}>
            {animationStage === 'tsunami' && (
                <TsunamiAnimation
                    flavorColor={flavor.color}
                    onClose={() => setAnimationStage('pouring')}
                />
            )}
            <div className={cn(
                "absolute inset-0 flex flex-col items-start justify-center p-8 md:p-16 lg:p-24 pointer-events-none transition-opacity duration-300",
                animationStage === 'pouring' ? 'opacity-100' : 'opacity-0'
            )}>
                <h1 className="font-headline text-foreground/10 text-8xl md:text-9xl lg:text-[12rem] text-left select-none leading-none">
                    Then<br />choose<br />your<br />flavour
                </h1>
            </div>
            <div ref={mountRef} className={cn(
                "h-full w-full transition-opacity duration-500",
                animationStage === 'pouring' ? 'opacity-100' : 'opacity-0 pointer-events-none'
            )} />
        </main>
    );
}
