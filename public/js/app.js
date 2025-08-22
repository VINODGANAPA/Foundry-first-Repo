import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
import { buildFertilizationScene, buildCleavageScene, buildBlastocystScene, buildImplantationScene, buildGestationScene } from './ivf_scenes.js';

const canvas = document.getElementById('ivf-canvas');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
camera.position.set(0, 0, 6);

let animateScene = null;

const resize = () => {
	const width = canvas.clientWidth;
	const height = canvas.clientHeight;
	if (canvas.width !== width || canvas.height !== height) {
		renderer.setSize(width, height, false);
		camera.aspect = width / height;
		camera.updateProjectionMatrix();
	}
};

const switchScene = (name) => {
	scene.clear();
	switch (name) {
		case 'fertilization':
			animateScene = buildFertilizationScene(scene);
			break;
		case 'cleavage':
			animateScene = buildCleavageScene(scene);
			break;
		case 'blastocyst':
			animateScene = buildBlastocystScene(scene);
			break;
		case 'implantation':
			animateScene = buildImplantationScene(scene);
			break;
		case 'gestation':
			animateScene = buildGestationScene(scene);
			break;
		default:
			animateScene = buildFertilizationScene(scene);
	}
};

const tick = () => {
	resize();
	if (animateScene) animateScene(Date.now());
	renderer.render(scene, camera);
	requestAnimationFrame(tick);
};

// Hook buttons
const buttons = document.querySelectorAll('.controls button');
buttons.forEach((btn) => {
	btn.addEventListener('click', () => switchScene(btn.dataset.scene));
});

// Default scene
switchScene('fertilization');
requestAnimationFrame(tick);

// Footer year
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// Booking form
const form = document.getElementById('booking-form');
const statusEl = document.getElementById('form-status');
const apptList = document.getElementById('appointments');

const fetchAppointments = async () => {
	try {
		const res = await fetch('/api/appointments');
		const data = await res.json();
		apptList.innerHTML = '';
		data.slice(0, 8).forEach((a) => {
			const li = document.createElement('li');
			li.textContent = `${a.name} — ${new Date(a.preferred_date).toDateString()} — ${a.email}`;
			apptList.appendChild(li);
		});
	} catch (e) {
		console.error(e);
	}
};

if (form) {
	form.addEventListener('submit', async (e) => {
		e.preventDefault();
		statusEl.textContent = 'Submitting...';
		const formData = new FormData(form);
		const payload = Object.fromEntries(formData.entries());
		try {
			const res = await fetch('/api/appointments', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload),
			});
			if (!res.ok) throw new Error('Request failed');
			statusEl.textContent = 'Appointment submitted! We will contact you.';
			form.reset();
			fetchAppointments();
		} catch (err) {
			statusEl.textContent = 'Failed to submit. Please try again.';
		}
	});
}

fetchAppointments();