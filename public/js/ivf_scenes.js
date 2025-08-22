import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

const disposeScene = (scene) => {
	if (!scene) return;
	scene.traverse((object) => {
		if (object.geometry) object.geometry.dispose();
		if (object.material) {
			if (Array.isArray(object.material)) object.material.forEach((m) => m.dispose());
			else object.material.dispose();
		}
	});
};

const lights = (scene) => {
	const ambient = new THREE.AmbientLight(0xffffff, 0.6);
	scene.add(ambient);
	const dir = new THREE.DirectionalLight(0xffffff, 0.8);
	dir.position.set(3, 5, 2);
	scene.add(dir);
};

const createCell = (radius, color, opacity = 0.9) => {
	const geometry = new THREE.SphereGeometry(radius, 48, 48);
	const material = new THREE.MeshPhysicalMaterial({ color, roughness: 0.5, metalness: 0.0, transparent: true, opacity });
	return new THREE.Mesh(geometry, material);
};

export const buildFertilizationScene = (scene) => {
	disposeScene(scene);
	lights(scene);
	const egg = createCell(1.2, 0xf5a3b6, 0.6);
	egg.position.set(0, 0, 0);
	scene.add(egg);

	// Sperm represented as small moving spheres
	const spermGroup = new THREE.Group();
	for (let i = 0; i < 80; i++) {
		const sperm = createCell(0.06, 0x9ec5fe, 0.9);
		sperm.userData = { angle: Math.random() * Math.PI * 2, radius: 3 + Math.random() * 2, speed: 0.005 + Math.random() * 0.01 };
		spermGroup.add(sperm);
	}
	scene.add(spermGroup);

	return (t) => {
		spermGroup.children.forEach((s) => {
			s.userData.angle += s.userData.speed;
			s.position.set(Math.cos(s.userData.angle) * s.userData.radius, Math.sin(s.userData.angle) * s.userData.radius, Math.sin(s.userData.angle * 2) * 0.3);
		});
		egg.rotation.y += 0.002;
	};
};

export const buildCleavageScene = (scene) => {
	disposeScene(scene);
	lights(scene);
	// 2-cell, 4-cell, 8-cell cluster
	const group = new THREE.Group();
	const colors = [0xffc6d1, 0xff9db5, 0xff7a9b];
	for (let i = 0; i < 8; i++) {
		const cell = createCell(0.5, colors[i % colors.length], 0.8);
		const angle = (i / 8) * Math.PI * 2;
		cell.position.set(Math.cos(angle) * 0.9, Math.sin(angle) * 0.9, (i % 2 === 0 ? 0.3 : -0.3));
		group.add(cell);
	}
	scene.add(group);
	return () => {
		group.rotation.y += 0.003;
		group.rotation.x += 0.0015;
	};
};

export const buildBlastocystScene = (scene) => {
	disposeScene(scene);
	lights(scene);
	const outer = createCell(1.4, 0xffdde7, 0.3);
	scene.add(outer);
	const innerGroup = new THREE.Group();
	for (let i = 0; i < 80; i++) {
		const cell = createCell(0.18, 0xff9db5, 0.85);
		const angle = Math.random() * Math.PI * 2;
		const r = 0.8 + Math.random() * 0.3;
		cell.position.set(Math.cos(angle) * r, Math.sin(angle) * r, (Math.random() - 0.5) * 0.8);
		innerGroup.add(cell);
	}
	scene.add(innerGroup);
	return () => {
		innerGroup.rotation.y += 0.002;
		outer.rotation.y -= 0.0015;
	};
};

export const buildImplantationScene = (scene) => {
	disposeScene(scene);
	lights(scene);
	// Endometrium surface
	const plane = new THREE.Mesh(
		new THREE.PlaneGeometry(8, 4, 64, 64),
		new THREE.MeshStandardMaterial({ color: 0xf8c4c4, roughness: 0.9 })
	);
	plane.rotation.x = -Math.PI / 2.2;
	plane.position.y = -1.4;
	scene.add(plane);
	// Embryo
	const embryo = createCell(0.8, 0xff9db5, 0.85);
	embryo.position.set(0, -0.3, 0);
	scene.add(embryo);
	return () => {
		plane.rotation.z += 0.0008;
		embryo.rotation.y += 0.002;
	};
};

export const buildGestationScene = (scene) => {
	disposeScene(scene);
	lights(scene);
	// Simple gestational sac visualization
	const sac = createCell(1.8, 0xdbeafe, 0.25);
	scene.add(sac);
	const fetus = createCell(0.5, 0x8ab4f8, 0.9);
	fetus.position.set(0.2, -0.2, 0);
	scene.add(fetus);
	return () => {
		sac.rotation.y += 0.001;
		fetus.rotation.y -= 0.002;
		fetus.position.x = 0.2 + Math.sin(Date.now() * 0.001) * 0.2;
	};
};