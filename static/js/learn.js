/* global THREE */
(function(){
  const stageDescriptions = [
    "Ovarian stimulation: Hormones encourage multiple follicles to mature.",
    "Egg retrieval: Mature oocytes are collected using a fine needle.",
    "Fertilization: Sperm meets egg in lab (IVF/ICSI).",
    "Embryo culture: Embryos develop to blastocyst stage under monitoring.",
    "Embryo transfer: Selected embryo transferred to uterus.",
    "Implantation & Gestation: Embryo implants; early pregnancy begins.",
  ];

  const stageText = document.getElementById('stage-text');
  const canvas = document.getElementById('ivf-canvas');
  const buttons = Array.from(document.querySelectorAll('.stage-controls .btn'));

  let renderer, scene, camera, animationId;
  const objects = { eggs: [], sperm: [], embryo: null, uterus: null };

  function setText(idx){ stageText.textContent = stageDescriptions[idx]; }

  function init(){
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    resize();
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0b0f17);
    camera = new THREE.PerspectiveCamera(55, canvas.clientWidth/canvas.clientHeight, 0.1, 1000);
    camera.position.set(0, 1.2, 6);

    const amb = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(amb);
    const dir = new THREE.DirectionalLight(0xffffff, 0.6);
    dir.position.set(3, 6, 5);
    scene.add(dir);

    createBaseAssets();
    setStage(0);
    animate();
    window.addEventListener('resize', resize);
  }

  function resize(){
    const width = canvas.clientWidth;
    const height = 500; // CSS fixed height
    renderer && renderer.setSize(width, height, false);
    camera && (camera.aspect = width/height, camera.updateProjectionMatrix());
  }

  function clearScene(){
    for(const key of Object.keys(objects)){
      const value = objects[key];
      if(Array.isArray(value)){
        value.forEach(mesh => mesh && scene.remove(mesh));
        objects[key] = [];
      } else if(value){
        scene.remove(value);
        objects[key] = null;
      }
    }
  }

  function createBaseAssets(){
    // Subtle grid/floor
    const grid = new THREE.GridHelper(20, 20, 0x223, 0x112);
    grid.position.y = -1.2;
    scene.add(grid);
  }

  function buildOvaries(){
    const mat = new THREE.MeshStandardMaterial({ color: 0x9b7bff, roughness: 0.5, metalness: 0.1 });
    for(let i=0;i<6;i++){
      const geo = new THREE.SphereGeometry(0.25, 24, 16);
      const egg = new THREE.Mesh(geo, mat);
      egg.position.set(-2 + i*0.8, Math.sin(i)*0.2, 0);
      scene.add(egg);
      objects.eggs.push(egg);
    }
    const ovaryRight = new THREE.Mesh(new THREE.SphereGeometry(0.8, 32, 24), new THREE.MeshStandardMaterial({ color: 0x6aa4ff }));
    ovaryRight.position.set(2.2, 0, 0);
    scene.add(ovaryRight);
  }

  function buildRetrieval(){
    buildOvaries();
    const needle = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 3, 16), new THREE.MeshStandardMaterial({ color: 0xe6e6e6, metalness: 0.8, roughness: 0.2 }));
    needle.rotation.z = Math.PI/2;
    needle.position.set(0.5, 0, 0);
    scene.add(needle);
  }

  function buildFertilization(){
    const egg = new THREE.Mesh(new THREE.SphereGeometry(0.8, 32, 24), new THREE.MeshStandardMaterial({ color: 0x9b7bff }));
    egg.position.set(0, 0, 0);
    scene.add(egg);
    objects.eggs.push(egg);

    const spermMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
    for(let i=0;i<30;i++){
      const head = new THREE.Mesh(new THREE.SphereGeometry(0.06, 12, 8), spermMat);
      head.position.set(2.5 + Math.random()*1.5, (Math.random()-0.5)*1.2, (Math.random()-0.5)*1);
      scene.add(head);
      objects.sperm.push(head);
    }
  }

  function buildEmbryoCulture(){
    const embryo = new THREE.Mesh(new THREE.IcosahedronGeometry(0.7, 1), new THREE.MeshStandardMaterial({ color: 0xffe08a, roughness: 0.4 }));
    embryo.position.set(0, 0, 0);
    scene.add(embryo);
    objects.embryo = embryo;

    const dish = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.2, 0.2, 48), new THREE.MeshStandardMaterial({ color: 0x224, transparent: true, opacity: 0.5 }));
    dish.position.y = -0.9;
    scene.add(dish);
  }

  function buildTransfer(){
    const catheter = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 4, 16), new THREE.MeshStandardMaterial({ color: 0xcce6ff }));
    catheter.rotation.z = Math.PI/8;
    catheter.position.set(1.5, 0.2, 0);
    scene.add(catheter);

    const embryo = new THREE.Mesh(new THREE.SphereGeometry(0.25, 24, 16), new THREE.MeshStandardMaterial({ color: 0xffe08a }));
    embryo.position.set(-0.5, 0.1, 0);
    scene.add(embryo);
    objects.embryo = embryo;

    const uterus = new THREE.Mesh(new THREE.TorusGeometry(2, 0.25, 16, 100), new THREE.MeshStandardMaterial({ color: 0xff6aa4, wireframe: true }));
    uterus.rotation.x = Math.PI/2;
    uterus.position.set(0, -0.3, 0);
    scene.add(uterus);
    objects.uterus = uterus;
  }

  function buildImplantation(){
    const uterus = new THREE.Mesh(new THREE.TorusGeometry(2.2, 0.3, 16, 100), new THREE.MeshStandardMaterial({ color: 0xff6aa4, wireframe: false, transparent: true, opacity: 0.3 }));
    uterus.rotation.x = Math.PI/2;
    uterus.position.set(0, -0.3, 0);
    scene.add(uterus);
    objects.uterus = uterus;

    const embryo = new THREE.Mesh(new THREE.SphereGeometry(0.35, 24, 16), new THREE.MeshStandardMaterial({ color: 0xffe08a }));
    embryo.position.set(0, -0.1, 0.9);
    scene.add(embryo);
    objects.embryo = embryo;
  }

  function setStage(idx){
    clearScene();
    createBaseAssets();
    setText(idx);
    switch(idx){
      case 0: buildOvaries(); break;
      case 1: buildRetrieval(); break;
      case 2: buildFertilization(); break;
      case 3: buildEmbryoCulture(); break;
      case 4: buildTransfer(); break;
      case 5: buildImplantation(); break;
      default: buildOvaries();
    }
  }

  function animate(){
    animationId = requestAnimationFrame(animate);
    // Gentle animations
    const t = performance.now()/1000;
    objects.eggs.forEach((egg, i)=>{ if(!egg) return; egg.position.y = Math.sin(t + i)*0.1; });
    objects.sperm.forEach((head, i)=>{ if(!head) return; head.position.x -= 0.01 + Math.random()*0.01; head.position.y += Math.sin(t*6+i)*0.005; if(head.position.x < -2) head.position.x = 3 + Math.random()*1.5; });
    if(objects.embryo){ objects.embryo.rotation.y += 0.01; objects.embryo.rotation.x += 0.008; }
    if(objects.uterus){ objects.uterus.scale.setScalar(1 + Math.sin(t)*0.02); }
    renderer.render(scene, camera);
  }

  buttons.forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const idx = parseInt(btn.getAttribute('data-stage'), 10) || 0;
      setStage(idx);
    });
  });

  setText(0);
  init();
})();