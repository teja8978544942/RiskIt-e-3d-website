
'use client';

import * as THREE from 'three';
import { useEffect, useRef } from 'react';
import { createCanMesh } from '@/components/can-model';

interface LiquidMorphAnimationProps {
    flavorName: string;
    flavorColor: string;
    onComplete: () => void;
}

export function LiquidMorphAnimation({ flavorName, flavorColor, onComplete }: LiquidMorphAnimationProps) {
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
        let blobPositions: Float32Array | null = null;
        let swirlEndPositions: Float32Array | null = null;
        
        const clock = new THREE.Clock();
        let animationFrameId: number;
        let stage = 'melt';
        let stageStartTime = 0;

        const animate = () => {
            animationFrameId = requestAnimationFrame(animate);
            const elapsedTime = clock.getElapsedTime();

            if (!particles || !canMesh || !initialPositions || !blobPositions || !swirlEndPositions) {
                renderer.render(scene, camera);
                return;
            }
            
            if (stageStartTime === 0) stageStartTime = elapsedTime;
            const timeInStage = elapsedTime - stageStartTime;

            const meltDuration = 1.2;
            const swirlDuration = 2.0;
            const reformDuration = 1.2;

            const currentPositions = particles.geometry.attributes.position.array as Float32Array;
            
            if (stage === 'melt') {
                const progress = Math.min(timeInStage / meltDuration, 1);
                const easedProgress = 1 - Math.pow(1 - progress, 3);
                
                for (let i = 0; i < currentPositions.length / 3; i++) {
                    const i3 = i * 3;
                    const initialVec = new THREE.Vector3(initialPositions[i3], initialPositions[i3+1], initialPositions[i3+2]);
                    const blobVec = new THREE.Vector3(blobPositions[i3], blobPositions[i3+1], blobPositions[i3+2]);
                    const currentVec = initialVec.lerp(blobVec, easedProgress);
                    currentPositions[i3] = currentVec.x;
                    currentPositions[i3+1] = currentVec.y;
                    currentPositions[i3+2] = currentVec.z;
                }

                if (progress >= 1.0) {
                    stage = 'swirl';
                    stageStartTime = elapsedTime;
                }
            } else if (stage === 'swirl') {
                const progress = Math.min(timeInStage / swirlDuration, 1);
                
                particles.rotation.y += 0.015;
                particles.rotation.x += 0.01;

                // Add a little extra turbulence to the swirl
                const totalVertices = currentPositions.length / 3;
                for (let i = 0; i < totalVertices; i++) {
                    const i3 = i * 3;
                    const d = 0.1 * Math.sin(progress * Math.PI);
                    currentPositions[i3] += Math.sin(elapsedTime * 5 + blobPositions[i3+1]) * d;
                    currentPositions[i3+1] += Math.cos(elapsedTime * 4 + blobPositions[i3+2]) * d;
                    currentPositions[i3+2] += Math.sin(elapsedTime * 6 + blobPositions[i3]) * d;
                }

                if (progress >= 1.0) {
                    stage = 'reform';
                    stageStartTime = elapsedTime;
                    
                    particles.updateMatrix();
                    const tempGeom = particles.geometry.clone();
                    tempGeom.applyMatrix4(particles.matrix);
                    swirlEndPositions.set(tempGeom.attributes.position.array);
                    particles.rotation.set(0, 0, 0); 
                }
            } else if (stage === 'reform') {
                const progress = Math.min(timeInStage / reformDuration, 1);
                const easedProgress = progress * progress;

                for (let i = 0; i < currentPositions.length / 3; i++) {
                     const i3 = i * 3;
                    const swirlVec = new THREE.Vector3(swirlEndPositions[i3], swirlEndPositions[i3+1], swirlEndPositions[i3+2]);
                    const initialVec = new THREE.Vector3(initialPositions[i3], initialPositions[i3+1], initialPositions[i3+2]);
                    const currentVec = swirlVec.lerp(initialVec, easedProgress);
                    currentPositions[i3] = currentVec.x;
                    currentPositions[i3+1] = currentVec.y;
                    currentPositions[i3+2] = currentVec.z;
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
            blobPositions = new Float32Array(totalVertices * 3);
            swirlEndPositions = new Float32Array(totalVertices * 3);
            const currentPositions = new Float32Array(totalVertices * 3);

            let offset = 0;
            for(const geom of geometries) {
                initialPositions.set(geom.attributes.position.array, offset);
                offset += geom.attributes.position.array.length;
            }
            currentPositions.set(initialPositions);

            // Create blob positions (a sphere with some noise)
            const blobCenter = new THREE.Vector3(0, 0, 0);
            const blobRadius = 1.5;
            const noiseFactor = 0.5;
            for (let i = 0; i < totalVertices; i++) {
                const i3 = i * 3;
                const p = new THREE.Vector3(
                    (Math.random() - 0.5),
                    (Math.random() - 0.5),
                    (Math.random() - 0.5)
                ).normalize().multiplyScalar(blobRadius + (Math.random() - 0.5) * noiseFactor);
                
                blobPositions[i3] = blobCenter.x + p.x;
                blobPositions[i3+1] = blobCenter.y + p.y;
                blobPositions[i3+2] = blobCenter.z + p.z;
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
            animate();
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
