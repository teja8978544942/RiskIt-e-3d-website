
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
        color: new THREE.Color(color).lerp(new THREE.Color(0xffffff), 0.2),
        size: 0.035,
        transparent: true,
        opacity: 0.7,
        blending: THREE.AdditiveBlending,
        sizeAttenuation: true
    });

    const particles = new THREE.Points(geometry, material);
    particles.visible = false;
    return particles;
}

function createLiquid(color: string) {
    const geometry = new THREE.CylinderGeometry(0.84, 0.65, 1, 32, 1, true);
    const material = new THREE.MeshStandardMaterial({
        color: color,
        transparent: true,
        opacity: 0.85,
        metalness: 0,
        roughness: 0.2,
        emissive: color,
        emissiveIntensity: 0.2,
    });
    const liquid = new THREE.Mesh(geometry, material);
    liquid.visible = false;
    return liquid;
}

function createFoam() {
    const geometry = new THREE.CylinderGeometry(0.84, 0.84, 0.1, 32);
    const material = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.9,
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
        currentMount.appendChild(renderer.domElement);

        const hemiLight = new THREE.HemisphereLight(0xffffff, 0x888888, 1.5);
        hemiLight.position.set(0, 20, 0);
        scene.add(hemiLight);

        const keyLight = new THREE.DirectionalLight(0xffffff, 1.5);
        keyLight.position.set(5, 5, 5);
        keyLight.castShadow = true;
        scene.add(keyLight);
        
        const fillLight = new THREE.DirectionalLight(0xffffff, 0.5);
        fillLight.position.set(-5, 2, 5);
        scene.add(fillLight);
        
        const backLight = new THREE.DirectionalLight(0xffffff, 1.5);
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
                
                let cameraTargetPos = new THREE.Vector3(0.5, 0, 8);
                let cameraLookAtPos = new THREE.Vector3(0.5, 0, 0);

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
                        const targetPos = new THREE.Vector3(1.2, 2.2, 2.5);
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
                                    foam.position.copy(glass.position);
                                }
                            }
                        }
                        break;
                    }
                    case 'pouring': {
                        const pourDuration = 2000;
                        const pourProgress = Math.min((performance.now() - state.pourStartTime) / pourDuration, 1);

                        if (pourProgress >= 1) {
                           if (state.stage === 'pouring') {
                                state.stage = 'idle';
                                router.push('/');
                            }
                        }

                        if (liquid && foam && glass) {
                            const maxLiquidHeight = 2.3;
                            const currentLiquidHeight = maxLiquidHeight * pourProgress;
                            
                            liquid.scale.y = currentLiquidHeight;
                            liquid.position.y = glass.position.y - 1.5 + (currentLiquidHeight / 2);

                            const foamHeight = Math.max(0.1, 0.4 - (pourProgress * 0.3));
                            foam.scale.y = foamHeight;
                            foam.scale.x = foam.scale.z = 1 + Math.sin(time * 50) * 0.03 + Math.sin(time * 30) * 0.02;
                            foam.position.y = liquid.position.y + (currentLiquidHeight / 2) + (foamHeight / 2);
                            foam.position.y += (Math.sin(time * 80) * 0.015) + (Math.sin(time * 55) * 0.02) + (Math.sin(time * 25) * 0.01);
                        }


                        if (particles && glass && can && liquid) {
                            particles.visible = true;

                            const positions = particles.geometry.attributes.position.array as Float32Array;
                            const velocities = particles.geometry.attributes.velocity.array as Float32Array;
                            const pourLocalOrigin = new THREE.Vector3(0.35, 1.4, 0);
                            const pourWorldOrigin = pourLocalOrigin.clone().applyMatrix4(can.matrixWorld);
                            
                            const liquidSurfaceY = glass.position.y - 1.5 + liquid.scale.y;
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
                                    velocities[i+1] -= 0.8 * delta;
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
            state.glass.position.set(1.2, -1.7 + 1.5, 2.5);
            scene.add(state.glass);

            state.particles = createParticles(flavor.color);
            scene.add(state.particles);

            state.liquid = createLiquid(flavor.color);
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
