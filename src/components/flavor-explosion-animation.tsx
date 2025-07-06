
'use client';

import * as THREE from 'three';
import { useEffect, useRef } from 'react';
import { createCanMesh } from '@/components/can-model';

interface FlavorExplosionAnimationProps {
    flavorName: string;
    flavorColor: string;
    onComplete: () => void;
}

export function FlavorExplosionAnimation({ flavorName, flavorColor, onComplete }: FlavorExplosionAnimationProps) {
    const mountRef = useRef<HTMLDivElement>(null);
    const onCompleteRef = useRef(onComplete);
    onCompleteRef.current = onComplete;

    useEffect(() => {
        if (!mountRef.current || typeof window === 'undefined') return;

        const currentMount = mountRef.current;
        
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.set(0, 0, 8);

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        currentMount.appendChild(renderer.domElement);

        const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
        scene.add(ambientLight);
        
        const dirLight = new THREE.DirectionalLight(0xffffff, 4.0);
        dirLight.position.set(5, 10, 7.5);
        scene.add(dirLight);

        let canMesh: THREE.Group | null = null;
        let particles: THREE.Points | null = null;
        let initialPositions: Float32Array | null = null;
        let explosionPaths: Float32Array | null = null;
        
        const initScene = async () => {
            const tempCan = await createCanMesh(flavorName, flavorColor);
            
            const geometries: THREE.BufferGeometry[] = [];
            tempCan.traverse(child => {
                if (child instanceof THREE.Mesh) {
                    const geometry = child.geometry.clone();
                    geometry.applyMatrix4(child.matrix);
                    geometries.push(geometry);
                }
            });

            let totalVertices = 0;
            geometries.forEach(g => totalVertices += g.attributes.position.count);
            
            initialPositions = new Float32Array(totalVertices * 3);
            explosionPaths = new Float32Array(totalVertices * 3);
            const currentPositions = new Float32Array(totalVertices * 3);

            let offset = 0;
            for(const geom of geometries) {
                initialPositions.set(geom.attributes.position.array, offset);
                offset += geom.attributes.position.array.length;
            }
            currentPositions.set(initialPositions);

            for (let i = 0; i < totalVertices; i++) {
                const i3 = i * 3;
                const vertex = new THREE.Vector3(initialPositions[i3], initialPositions[i3+1], initialPositions[i3+2]);
                const explosionVec = vertex.clone().normalize().add(
                    new THREE.Vector3(
                        (Math.random() - 0.5),
                        (Math.random() - 0.5),
                        (Math.random() - 0.5)
                    ).multiplyScalar(2)
                ).multiplyScalar(10 + Math.random() * 5);

                explosionPaths[i3] = explosionVec.x;
                explosionPaths[i3+1] = explosionVec.y;
                explosionPaths[i3+2] = explosionVec.z;
            }

            const particleGeometry = new THREE.BufferGeometry();
            particleGeometry.setAttribute('position', new THREE.BufferAttribute(currentPositions, 3));

            const particleMaterial = new THREE.PointsMaterial({
                color: new THREE.Color(flavorColor),
                size: 0.05,
                transparent: true,
                opacity: 1.0,
                blending: THREE.AdditiveBlending,
                sizeAttenuation: true
            });

            particles = new THREE.Points(particleGeometry, particleMaterial);
            scene.add(particles);

            canMesh = await createCanMesh(flavorName, flavorColor);
            canMesh.traverse(child => {
                if (child instanceof THREE.Mesh) {
                    const materials = Array.isArray(child.material) ? child.material : [child.material];
                    materials.forEach(m => {
                        m.transparent = true;
                        m.opacity = 0;
                    });
                }
            });
            scene.add(canMesh);
        };
        
        initScene();
        
        const clock = new THREE.Clock();
        let animationFrameId: number;
        let stage = 'explode';
        let stageStartTime = 0;

        const animate = () => {
            animationFrameId = requestAnimationFrame(animate);
            const elapsedTime = clock.getElapsedTime();

            if (!particles || !canMesh || !initialPositions || !explosionPaths) {
                renderer.render(scene, camera);
                return;
            }
            
            if (stageStartTime === 0) stageStartTime = elapsedTime;
            const timeInStage = elapsedTime - stageStartTime;

            const explosionDuration = 1.2;
            const swirlDuration = 2.0;
            const reformDuration = 1.2;

            const currentPositions = particles.geometry.attributes.position.array as Float32Array;
            
            if (stage === 'explode') {
                const progress = Math.min(timeInStage / explosionDuration, 1);
                const easedProgress = 1 - Math.pow(1 - progress, 2);
                
                for (let i = 0; i < currentPositions.length; i++) {
                    currentPositions[i] = THREE.MathUtils.lerp(initialPositions[i], explosionPaths[i], easedProgress);
                }
                
                if (progress >= 1.0) {
                    stage = 'swirl';
                    stageStartTime = elapsedTime;
                }
            } else if (stage === 'swirl') {
                const progress = Math.min(timeInStage / swirlDuration, 1);
                
                for (let i = 0; i < currentPositions.length / 3; i++) {
                    const i3 = i * 3;
                    const angle = elapsedTime * 2;
                    const d = 0.2 * Math.sin(progress * Math.PI);
                    currentPositions[i3] += Math.sin(angle + initialPositions[i3+1]) * d;
                    currentPositions[i3+1] += Math.cos(angle + initialPositions[i3+2]) * d;
                    currentPositions[i3+2] += Math.sin(angle + initialPositions[i3]) * d;
                }
                particles.rotation.y += 0.01;

                if (progress >= 1.0) {
                    stage = 'reform';
                    stageStartTime = elapsedTime;
                    explosionPaths.set(currentPositions);
                }
            } else if (stage === 'reform') {
                const progress = Math.min(timeInStage / reformDuration, 1);
                const easedProgress = progress * progress;

                for (let i = 0; i < currentPositions.length; i++) {
                    currentPositions[i] = THREE.MathUtils.lerp(explosionPaths[i], initialPositions[i], easedProgress);
                }
                
                (particles.material as THREE.PointsMaterial).opacity = 1.0 - easedProgress;
                
                if (progress > 0.3) {
                    canMesh.traverse(child => {
                        if (child instanceof THREE.Mesh) {
                            const materials = Array.isArray(child.material) ? child.material : [child.material];
                            materials.forEach(m => {
                                m.opacity = (progress - 0.3) / 0.7;
                            });
                        }
                    });
                }

                if (progress >= 1.0) {
                    stage = 'done';
                    onCompleteRef.current();
                }
            }
            
            particles.geometry.attributes.position.needsUpdate = true;
            renderer.render(scene, camera);
        };
        animate();

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
                if (object instanceof THREE.Mesh || object instanceof THREE.Points) {
                    object.geometry.dispose();
                    const materials = Array.isArray(object.material) ? object.material : [object.material];
                    materials.forEach(material => {
                        if (material.map) material.map.dispose();
                        material.dispose()
                    });
                }
            });
            renderer.dispose();
        };
    }, [flavorName, flavorColor]);

    return (
        <div className="fixed inset-0 z-[60] bg-background/50 backdrop-blur-sm">
            <div ref={mountRef} className="h-full w-full" />
        </div>
    );
}
