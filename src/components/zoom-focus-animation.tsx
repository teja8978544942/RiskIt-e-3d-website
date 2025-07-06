
'use client';

import * as THREE from 'three';
import { useEffect, useRef } from 'react';
import { createCanMesh } from '@/components/can-model';

interface ZoomFocusAnimationProps {
    flavorName: string;
    flavorColor: string;
    onComplete: () => void;
}

export function ZoomFocusAnimation({ flavorName, flavorColor, onComplete }: ZoomFocusAnimationProps) {
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
        
        const clock = new THREE.Clock();
        let animationFrameId: number;
        let stage = 'zoom';
        let stageStartTime = 0;

        const animate = () => {
            animationFrameId = requestAnimationFrame(animate);
            const elapsedTime = clock.getElapsedTime();

            if (!canMesh) {
                renderer.render(scene, camera);
                return;
            }
            
            if (stageStartTime === 0) stageStartTime = elapsedTime;
            const timeInStage = elapsedTime - stageStartTime;

            const zoomDuration = 2.5;

            if (stage === 'zoom') {
                const progress = Math.min(timeInStage / zoomDuration, 1);
                const easedProgress = 1 - Math.pow(1 - progress, 3); // easeOutCubic

                // Animate scale
                const startScale = 0.5;
                const endScale = 1.5;
                const currentScale = THREE.MathUtils.lerp(startScale, endScale, easedProgress);
                canMesh.scale.set(currentScale, currentScale, currentScale);

                // Animate rotation
                canMesh.rotation.y = THREE.MathUtils.lerp(0, Math.PI * 2, easedProgress);
                
                // Animate camera position for a slight dolly effect
                const startZ = 8;
                const endZ = 5;
                camera.position.z = THREE.MathUtils.lerp(startZ, endZ, easedProgress);

                if (progress >= 1.0) {
                    stage = 'done';
                    onCompleteRef.current();
                }
            }
            
            renderer.render(scene, camera);
        };
        
        const initScene = async () => {
            canMesh = await createCanMesh(flavorName, flavorColor);
            canMesh.scale.set(0.5, 0.5, 0.5); // Start small
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
                    if (object.geometry) object.geometry.dispose();
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
