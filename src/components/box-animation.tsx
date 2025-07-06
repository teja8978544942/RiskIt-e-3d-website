
'use client';

import * as THREE from 'three';
import { useEffect, useRef } from 'react';
import { createCanMesh } from '@/components/can-model';

function createBox(flavorColor: string): THREE.Group {
    const boxGroup = new THREE.Group();

    const boxColor = '#d2b48c'; // Cardboard color
    const textureCanvas = document.createElement('canvas');
    textureCanvas.width = 1024;
    textureCanvas.height = 1024;
    const context = textureCanvas.getContext('2d');
    if (context) {
        context.fillStyle = boxColor;
        context.fillRect(0, 0, 1024, 1024);
        
        context.font = 'bold 150px "Playfair Display"';
        context.fillStyle = 'rgba(0,0,0,0.6)';
        context.textAlign = 'center';
        context.textBaseline = 'middle';

        context.save();
        context.translate(256, 512);
        context.rotate(-Math.PI / 2);
        context.fillText('RiskIt', 0, 0);
        context.restore();

        context.save();
        context.translate(768, 512);
        context.rotate(Math.PI / 2);
        context.fillText('RiskIt', 0, 0);
        context.restore();

        context.save();
        context.translate(512, 256);
        context.fillText('RiskIt', 0, 0);
        context.restore();
       
        context.save();
        context.translate(512, 768);
        context.rotate(Math.PI);
        context.fillText('RiskIt', 0, 0);
        context.restore();
    }
    const boxTexture = new THREE.CanvasTexture(textureCanvas);

    const boxMaterial = new THREE.MeshStandardMaterial({ 
        map: boxTexture,
        roughness: 0.8,
        metalness: 0.1,
    });

    const boxWidth = 5;
    const boxHeight = 3;
    const boxDepth = 7;

    const boxGeometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);
    const boxMesh = new THREE.Mesh(boxGeometry, boxMaterial);
    boxMesh.position.y = boxHeight / 2;
    boxGroup.add(boxMesh);

    const flapWidth = boxWidth / 2;
    const flapDepth = boxDepth / 2;

    const flapMaterial = new THREE.MeshStandardMaterial({ 
        color: boxColor,
        roughness: 0.8,
        metalness: 0.1,
        side: THREE.DoubleSide 
    });

    const createFlap = (width: number, height: number, name: string) => {
        const flapGeometry = new THREE.PlaneGeometry(width, height);
        const flap = new THREE.Mesh(flapGeometry, flapMaterial);
        flap.name = name;
        return flap;
    };
    
    const frontFlapPivot = new THREE.Group();
    const frontFlap = createFlap(boxWidth, flapDepth, 'frontFlap');
    frontFlap.position.z = flapDepth / 2;
    frontFlapPivot.add(frontFlap);
    frontFlapPivot.position.set(0, boxHeight, boxDepth / 2);
    frontFlapPivot.rotation.x = Math.PI;
    boxGroup.add(frontFlapPivot);

    const backFlapPivot = new THREE.Group();
    const backFlap = createFlap(boxWidth, flapDepth, 'backFlap');
    backFlap.position.z = -flapDepth / 2;
    backFlapPivot.add(backFlap);
    backFlapPivot.position.set(0, boxHeight, -boxDepth / 2);
    boxGroup.add(backFlapPivot);
    
    const leftFlapPivot = new THREE.Group();
    const leftFlap = createFlap(flapWidth, boxDepth, 'leftFlap');
    leftFlap.position.x = -flapWidth / 2;
    leftFlapPivot.add(leftFlap);
    leftFlapPivot.position.set(-boxWidth / 2, boxHeight, 0);
    leftFlapPivot.rotation.z = Math.PI;
    boxGroup.add(leftFlapPivot);

    const rightFlapPivot = new THREE.Group();
    const rightFlap = createFlap(flapWidth, boxDepth, 'rightFlap');
    rightFlap.position.x = flapWidth / 2;
    rightFlapPivot.add(rightFlap);
    rightFlapPivot.position.set(boxWidth / 2, boxHeight, 0);
    boxGroup.add(rightFlapPivot);

    return boxGroup;
}

function createStarParticles() {
    const particleCount = 500;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i++) {
        positions[i] = (Math.random() - 0.5) * 10;
        positions[i+1] = (Math.random() - 0.5) * 10;
        positions[i+2] = (Math.random() - 0.5) * 10;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    const material = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.05,
        transparent: true,
        blending: THREE.AdditiveBlending,
        sizeAttenuation: true,
        opacity: 0,
    });

    return new THREE.Points(geometry, material);
}


interface BoxAnimationProps {
    flavorName: string;
    flavorColor: string;
    onComplete: () => void;
}

export function BoxAnimation({ flavorName, flavorColor, onComplete }: BoxAnimationProps) {
    const mountRef = useRef<HTMLDivElement>(null);
    const onCompleteRef = useRef(onComplete);
    onCompleteRef.current = onComplete;

    useEffect(() => {
        if (!mountRef.current || typeof window === 'undefined') return;

        const currentMount = mountRef.current;
        
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.set(0, 8, 12);
        camera.lookAt(0, 0, 0);

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.shadowMap.enabled = true;
        currentMount.appendChild(renderer.domElement);

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
        scene.add(ambientLight);
        
        const dirLight = new THREE.DirectionalLight(0xffffff, 2.5);
        dirLight.position.set(8, 15, 10);
        dirLight.castShadow = true;
        dirLight.shadow.mapSize.width = 2048;
        dirLight.shadow.mapSize.height = 2048;
        scene.add(dirLight);

        const pointLight = new THREE.PointLight(flavorColor, 0, 20);
        pointLight.position.set(0, 2, 0);
        scene.add(pointLight);

        const shadowPlane = new THREE.Mesh(
            new THREE.PlaneGeometry(50, 50),
            new THREE.ShadowMaterial({ opacity: 0.3 })
        );
        shadowPlane.rotation.x = -Math.PI / 2;
        shadowPlane.position.y = -0.01;
        shadowPlane.receiveShadow = true;
        scene.add(shadowPlane);
        
        const box = createBox(flavorColor);
        box.visible = false;
        scene.add(box);
        
        const canContainer = new THREE.Group();
        canContainer.visible = false;
        scene.add(canContainer);

        const particles = createStarParticles();
        scene.add(particles);

        const initCans = async () => {
            const canPromises = [];
            for (let i = 0; i < 6; i++) {
                canPromises.push(createCanMesh(flavorName, flavorColor));
            }
            const canMeshes = await Promise.all(canPromises);
            
            const canWidth = 2.2;
            const canDepth = 2.2;

            canMeshes.forEach((can, i) => {
                const row = Math.floor(i / 2);
                const col = i % 2;
                can.position.set(
                    (col - 0.5) * canWidth,
                    1.5,
                    (row - 1) * canDepth
                );
                can.rotation.y = Math.random() * Math.PI;
                can.traverse(child => {
                    if ((child as THREE.Mesh).isMesh) {
                        child.castShadow = true;
                    }
                });
                canContainer.add(can);
            });
        };
        initCans();
        
        const clock = new THREE.Clock();
        let animationFrameId: number;
        let stage = 'intro';
        let stageStartTime = clock.getElapsedTime();

        const animate = () => {
            animationFrameId = requestAnimationFrame(animate);
            const delta = clock.getDelta();
            const elapsedTime = clock.getElapsedTime();

            if (box) {
                const timeInStage = elapsedTime - stageStartTime;

                switch(stage) {
                    case 'intro':
                        box.visible = true;
                        box.position.y = THREE.MathUtils.damp(box.position.y, 0, 4, delta);
                        box.rotation.y += delta * 0.1;
                        if (timeInStage > 1.5) {
                            stage = 'opening';
                            stageStartTime = elapsedTime;
                        }
                        break;
                    
                    case 'opening':
                        const frontFlap = box.getObjectByName('frontFlap')?.parent;
                        const backFlap = box.getObjectByName('backFlap')?.parent;
                        const leftFlap = box.getObjectByName('leftFlap')?.parent;
                        const rightFlap = box.getObjectByName('rightFlap')?.parent;

                        if (frontFlap) frontFlap.rotation.x = THREE.MathUtils.damp(frontFlap.rotation.x, 0, 6, delta);
                        if (backFlap) backFlap.rotation.x = THREE.MathUtils.damp(backFlap.rotation.x, Math.PI, 6, delta);
                        if (leftFlap) leftFlap.rotation.z = THREE.MathUtils.damp(leftFlap.rotation.z, 0, 6, delta);
                        if (rightFlap) rightFlap.rotation.z = THREE.MathUtils.damp(rightFlap.rotation.z, Math.PI, 6, delta);
                        
                        pointLight.intensity = THREE.MathUtils.damp(pointLight.intensity, 80, 2, delta);
                        (particles.material as THREE.PointsMaterial).opacity = THREE.MathUtils.damp((particles.material as THREE.PointsMaterial).opacity, 1.0, 4, delta);


                        if (timeInStage > 1) {
                           canContainer.visible = true;
                        }

                        if (timeInStage > 2.5) {
                            stage = 'reveal';
                            stageStartTime = elapsedTime;
                        }
                        break;
                    
                    case 'reveal':
                        const targetCamPos = new THREE.Vector3(0, 15, 5);
                        camera.position.lerp(targetCamPos, 0.05);
                        camera.lookAt(canContainer.position);

                        pointLight.intensity = THREE.MathUtils.damp(pointLight.intensity, 0, 4, delta);
                        (particles.material as THREE.PointsMaterial).opacity = THREE.MathUtils.damp((particles.material as THREE.PointsMaterial).opacity, 0, 4, delta);

                        if (timeInStage > 3) {
                            stage = 'outro';
                            stageStartTime = elapsedTime;
                        }
                        break;
                    
                    case 'outro':
                         if (stage === 'outro') {
                           stage = 'done';
                           onCompleteRef.current();
                         }
                        break;
                }
            }

            particles.rotation.y += delta * 0.1;
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
