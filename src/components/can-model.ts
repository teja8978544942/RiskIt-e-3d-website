import * as THREE from 'three';

export function createCanMesh(flavorName: string, flavorColor: string): THREE.Group {
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
