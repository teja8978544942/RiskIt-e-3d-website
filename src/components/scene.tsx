
"use client";

import * as THREE from 'three';
import { useEffect, useRef } from 'react';
import { flavors } from '@/lib/flavors';
import { createCanMesh } from '@/components/can-model';

export function Scene({ onCanClick }: { onCanClick: (flavor: {name: string, color: string}) => void }) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current || typeof window === 'undefined') return;
    
    const currentMount = mountRef.current;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    scene.add(camera);
    camera.position.z = 9.5; 

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
    
    const spacing = 2.5;
    const totalCans = flavors.length;

    const reorderedFlavors = [...flavors];
    const mainCanIndexOriginal = reorderedFlavors.findIndex(f => f.name === 'Orange Burst');
    if (mainCanIndexOriginal !== -1) {
        const [mainCanFlavor] = reorderedFlavors.splice(mainCanIndexOriginal, 1);
        reorderedFlavors.splice(Math.floor(totalCans / 2) -1, 0, mainCanFlavor);
    }
    
    const initCans = async () => {
      for (const [index, flavor] of reorderedFlavors.entries()) {
          const can = await createCanMesh(flavor.name, flavor.color);
          const position = (index - (totalCans - 1) / 2) * spacing;
          can.position.x = position;
          
          can.castShadow = true;
          can.traverse(function(child) { if ((child as THREE.Mesh).isMesh) { child.castShadow = true; } });

          if (flavor.name === 'Orange Burst') {
              mainCan = can;
          }
          allCans.push(can);
          scene.add(can);
      }
    }
    initCans();


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
        scrollY = window.scrollY;
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    const mouse = new THREE.Vector2();
    const onMouseMove = (event: MouseEvent) => {
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', onMouseMove, { passive: true });
    
    const raycaster = new THREE.Raycaster();
    const handleClick = (event: MouseEvent) => {
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
            if (can.userData.flavorName && can.userData.flavorColor) {
                onCanClick({ name: can.userData.flavorName, color: can.userData.flavorColor });
            }
        }
    };
    window.addEventListener('click', handleClick);

    const cameraLookAtTarget = new THREE.Object3D();
    scene.add(cameraLookAtTarget);
    
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const tick = () => {
        animationFrameId = window.requestAnimationFrame(tick);
        const delta = clock.getDelta();
        
        if (mainCan) {
          const scrollFraction = Math.min(scrollY / animationDistance, 1);
          const easedFraction = 1 - Math.pow(1 - scrollFraction, 3);
          
          const targetY = THREE.MathUtils.lerp(0, -5, easedFraction);
          mainCan.position.y = THREE.MathUtils.damp(mainCan.position.y, targetY, 4, delta);

          const targetScale = THREE.MathUtils.lerp(1.0, 1.8, easedFraction);
          mainCan.scale.x = THREE.MathUtils.damp(mainCan.scale.x, targetScale, 4, delta);
          mainCan.scale.y = THREE.MathUtils.damp(mainCan.scale.y, targetScale, 4, delta);
          mainCan.scale.z = THREE.MathUtils.damp(mainCan.scale.z, targetScale, 4, delta);

          const targetRotationY = THREE.MathUtils.lerp(0, Math.PI * 2, easedFraction);
          mainCan.rotation.y = THREE.MathUtils.damp(mainCan.rotation.y, targetRotationY, 4, delta);
        }

        const targetCamPos = new THREE.Vector3(mouse.x * 0.5, 0, 9.5);
        camera.position.x = THREE.MathUtils.damp(camera.position.x, targetCamPos.x, 8, delta);
        camera.position.y = THREE.MathUtils.damp(camera.position.y, targetCamPos.y, 8, delta);
        camera.position.z = THREE.MathUtils.damp(camera.position.z, targetCamPos.z, 8, delta);
        
        cameraLookAtTarget.position.x = THREE.MathUtils.damp(cameraLookAtTarget.position.x, mouse.x * 0.2, 8, delta);
        cameraLookAtTarget.position.y = THREE.MathUtils.damp(cameraLookAtTarget.position.y, -mouse.y * 0.2, 8, delta);
        camera.lookAt(cameraLookAtTarget.position);
        
        renderer.render(scene, camera);
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
        cancelAnimationFrame(animationFrameId);

        if (currentMount && renderer.domElement.parentElement === currentMount) {
            currentMount.removeChild(renderer.domElement);
        }
        
        const texturesToDispose: THREE.Texture[] = [];
        scene.traverse(object => {
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
        
        texturesToDispose.forEach(texture => texture.dispose());
        renderer.dispose();
    };
  }, [onCanClick]);

  return <div ref={mountRef} className="fixed top-0 left-0 -z-10 h-full w-full" />;
}
