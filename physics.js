/**
 * ANTI-GRAVITY FLOATING & PHYSICS ENGINE — v2
 * Three.js Floating Ingredients: Ice Cubes, Carbonation Bubbles, Water Droplets
 * Sine-Wave Levitation · Cursor-Repelling Forcefield · Click Implosion/Explosion
 *
 * FIX: Replaced MeshPhysicalMaterial (transmission) with a visually equivalent
 * approach that works correctly on a transparent-alpha WebGL canvas:
 *   - Ice cubes → MeshStandardMaterial with high opacity + edge EdgeGeometry glow lines
 *   - Bubbles → MeshStandardMaterial with emissive glow + low opacity
 *   - Droplets → metallic spheres
 * IMPROVEMENT: Canvas is clamped to the stage container width, not full viewport.
 */

class AntiGravityPhysicsEngine {
  constructor(canvasElement, stageElement) {
    this.canvas = canvasElement;
    this.stage = stageElement || canvasElement.parentElement;

    const rect = this.stage.getBoundingClientRect();
    this.width = rect.width || window.innerWidth;
    this.height = rect.height || window.innerHeight;

    this.antiGravityActive = true;
    this.imploding = false;

    // Mouse in 3D world space
    this.mouse = new THREE.Vector2(-9999, -9999);
    this.mouseRaycaster = new THREE.Raycaster();
    this.interactionPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    this.mouseWorldPos = new THREE.Vector3(-9999, -9999, 0);

    this.theme = 'diet';
    this.themes = {
      classic: {
        bubbleColor:   0xff4455,
        bubbleEmissive:0xcc1122,
        iceColor:      0xffdddd,
        iceEmissive:   0x441111,
        dropletColor:  0xff9999,
        envColor:      0xe61c24,
        lightColor:    0xff4d52
      },
      diet: {
        bubbleColor:   0xaaccee,
        bubbleEmissive:0x3366aa,
        iceColor:      0xddeeff,
        iceEmissive:   0x112244,
        dropletColor:  0xddeeff,
        envColor:      0x808a94,
        lightColor:    0xffffff
      },
      fanta: {
        bubbleColor:   0xffc14d,
        bubbleEmissive:0xff6600,
        iceColor:      0xe8f7ff,
        iceEmissive:   0x27485c,
        dropletColor:  0xff9b3d,
        envColor:      0xff6600,
        lightColor:    0xffcc66
      },
      sprite: {
        bubbleColor:   0x80e000,
        bubbleEmissive:0x00b140,
        iceColor:      0xe8fff0,
        iceEmissive:   0x004d1a,
        dropletColor:  0xa8ff3e,
        envColor:      0x00b140,
        lightColor:    0x80e000
      },
      maaza: {
        bubbleColor:   0xffea00,
        bubbleEmissive:0xcc5500,
        iceColor:      0xfff5e6,
        iceEmissive:   0x662200,
        dropletColor:  0xff9900,
        envColor:      0xff9900,
        lightColor:    0xffea00
      },
      slice: {
        bubbleColor:   0xffd000,
        bubbleEmissive:0x993d00,
        iceColor:      0xfff0d0,
        iceEmissive:   0x4d1a00,
        dropletColor:  0xff8800,
        envColor:      0xff8800,
        lightColor:    0xffd000
      },
      frooti: {
        bubbleColor:   0xffea00,
        bubbleEmissive:0xcc8800,
        iceColor:      0xfffae0,
        iceEmissive:   0x332200,
        dropletColor:  0xffd700,
        envColor:      0xffd700,
        lightColor:    0xffea00
      },
      appyfizz: {
        bubbleColor:   0xff3366,
        bubbleEmissive:0x990026,
        iceColor:      0xffe6eb,
        iceEmissive:   0x4d0013,
        dropletColor:  0xff3366,
        envColor:      0x990026,
        lightColor:    0xff3366
      },
      tropicana: {
        bubbleColor:   0x33cc55,
        bubbleEmissive:0x00802b,
        iceColor:      0xfff0e6,
        iceEmissive:   0x4d1a00,
        dropletColor:  0xff5500,
        envColor:      0xff5500,
        lightColor:    0x33cc55
      },
      real: {
        bubbleColor:   0xf77f00,
        bubbleEmissive:0xd62828,
        iceColor:      0xffe6eb,
        iceEmissive:   0x6a040f,
        dropletColor:  0xd62828,
        envColor:      0xd62828,
        lightColor:    0xf77f00
      },
      sting: {
        bubbleColor:   0x00ffff,
        bubbleEmissive:0xff0055,
        iceColor:      0xe0ffff,
        iceEmissive:   0x880022,
        dropletColor:  0xff0055,
        envColor:      0xff0055,
        lightColor:    0x00ffff
      },
      monster: {
        bubbleColor:   0x00f3ff,
        bubbleEmissive:0x0088cc,
        iceColor:      0xf0fbff,
        iceEmissive:   0x004466,
        dropletColor:  0xffffff,
        envColor:      0x00f3ff,
        lightColor:    0x00f3ff
      }
    };

    this.particles = [];
    this.clock = new THREE.Clock();

    this._init();
  }

  _init() {
    // ─── Scene & Camera ────────────────────────────────────────────────────────
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(42, this.width / this.height, 0.1, 200);
    this.camera.position.set(0, 0, 22);

    // ─── Renderer ──────────────────────────────────────────────────────────────
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setClearColor(0x000000, 0); // transparent background

    // ─── Lighting ──────────────────────────────────────────────────────────────
    const ambient = new THREE.AmbientLight(0xffffff, 2.0);
    this.scene.add(ambient);

    this.keyLight = new THREE.PointLight(0xffffff, 3.5, 80);
    this.keyLight.position.set(6, 8, 12);
    this.scene.add(this.keyLight);

    this.fillLight = new THREE.PointLight(0x6688ff, 1.5, 60);
    this.fillLight.position.set(-8, -4, 10);
    this.scene.add(this.fillLight);

    this.rimLight = new THREE.DirectionalLight(0xffffff, 0.8);
    this.rimLight.position.set(-5, 5, -8);
    this.scene.add(this.rimLight);

    // ─── Spawn particles ───────────────────────────────────────────────────────
    this._createIngredients();

    // ─── Events ────────────────────────────────────────────────────────────────
    window.addEventListener('resize', () => this._onResize());
    window.addEventListener('mousemove', (e) => this._onMouseMove(e));
    window.addEventListener('touchmove', (e) => {
      if (e.touches.length > 0) this._onMouseMove(e.touches[0]);
    }, { passive: true });

    // ─── Kick off render loop ──────────────────────────────────────────────────
    this._animate();
  }

  // ─── Material Factories ──────────────────────────────────────────────────────

  _makIceMat() {
    return new THREE.MeshStandardMaterial({
      color: this.themes[this.theme].iceColor,
      emissive: this.themes[this.theme].iceEmissive,
      emissiveIntensity: 0.15,
      metalness: 0.05,
      roughness: 0.08,
      transparent: true,
      opacity: 0.72,
      side: THREE.DoubleSide
    });
  }

  _makEdgeMat() {
    return new THREE.LineBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.55,
      linewidth: 1
    });
  }

  _makBubbleMat() {
    const t = this.themes[this.theme];
    return new THREE.MeshStandardMaterial({
      color: t.bubbleColor,
      emissive: t.bubbleEmissive,
      emissiveIntensity: 0.4,
      metalness: 0.15,
      roughness: 0.05,
      transparent: true,
      opacity: 0.55,
      side: THREE.FrontSide
    });
  }

  _makDropletMat() {
    const t = this.themes[this.theme];
    return new THREE.MeshStandardMaterial({
      color: t.dropletColor,
      emissive: t.bubbleEmissive,
      emissiveIntensity: 0.2,
      metalness: 0.7,
      roughness: 0.1,
      transparent: true,
      opacity: 0.82
    });
  }

  // ─── Create Ice Cubes, Bubbles, Droplets ─────────────────────────────────────

  _createIngredients() {
    this._iceGroup   = new THREE.Group();
    this._bubbleGroup = new THREE.Group();
    this._dropGroup  = new THREE.Group();
    this.scene.add(this._iceGroup, this._bubbleGroup, this._dropGroup);

    // A — Ice cubes
    for (let i = 0; i < 9; i++) {
      const s = 0.75 + Math.random() * 0.8;
      const geom = new THREE.BoxGeometry(s, s, s, 2, 2, 2);

      // Subtle vertex jitter for irregular ice chunk look
      const pos = geom.attributes.position;
      for (let j = 0; j < pos.count; j++) {
        pos.setXYZ(j,
          pos.getX(j) + (Math.random() - 0.5) * 0.07,
          pos.getY(j) + (Math.random() - 0.5) * 0.07,
          pos.getZ(j) + (Math.random() - 0.5) * 0.07
        );
      }
      geom.computeVertexNormals();

      const iceMesh = new THREE.Mesh(geom, this._makIceMat());

      // Wireframe edge glow on top of ice cube
      const edgeGeom = new THREE.EdgesGeometry(geom);
      const edgeLine = new THREE.LineSegments(edgeGeom, this._makEdgeMat());
      iceMesh.add(edgeLine);

      this._iceGroup.add(iceMesh);
      this._addParticle(iceMesh, 'ice', {
        orbitRadius: 4.0 + Math.random() * 5.0,
        yRange: 5.5,
        baseScale: 1.0
      });
    }

    // B — Carbonation bubbles
    const sphereGeom = new THREE.SphereGeometry(1, 20, 20);
    for (let i = 0; i < 55; i++) {
      const r = 0.1 + Math.random() * 0.38;
      const mesh = new THREE.Mesh(sphereGeom, this._makBubbleMat());
      mesh.scale.setScalar(r);
      this._bubbleGroup.add(mesh);
      this._addParticle(mesh, 'bubble', {
        orbitRadius: 2.8 + Math.random() * 7.0,
        yRange: 6.5,
        baseScale: r
      });
    }

    // C — Water droplets / liquid splashes
    for (let i = 0; i < 16; i++) {
      const r = 0.08 + Math.random() * 0.2;
      const mesh = new THREE.Mesh(sphereGeom, this._makDropletMat());
      mesh.scale.set(r, r * 1.4, r);
      this._dropGroup.add(mesh);
      this._addParticle(mesh, 'droplet', {
        orbitRadius: 3.0 + Math.random() * 4.5,
        yRange: 5.0,
        baseScale: r
      });
    }
  }

  _addParticle(mesh, type, opts) {
    const angle = Math.random() * Math.PI * 2;
    const rad = opts.orbitRadius;
    const yRange = opts.yRange;

    const x0 = Math.cos(angle) * rad;
    const y0 = (Math.random() - 0.5) * yRange * 2;
    const z0 = Math.sin(angle) * rad * 0.5 + (Math.random() - 0.5) * 2.5;

    mesh.position.set(x0, y0, z0);

    this.particles.push({
      mesh,
      type,
      basePos: new THREE.Vector3(x0, y0, z0),
      velocity: new THREE.Vector3(),
      rotSpeed: new THREE.Vector3(
        (Math.random() - 0.5) * 1.8,
        (Math.random() - 0.5) * 1.8,
        (Math.random() - 0.5) * 1.8
      ),
      floatSpeedY: 0.55 + Math.random() * 1.1,
      floatSpeedX: 0.3 + Math.random() * 0.6,
      floatAmpY:   0.3 + Math.random() * 0.5,
      floatAmpX:   0.18 + Math.random() * 0.28,
      phaseY: Math.random() * Math.PI * 2,
      phaseX: Math.random() * Math.PI * 2,
      baseScale: opts.baseScale,
      mass: type === 'ice' ? 2.5 : type === 'droplet' ? 1.0 : 0.4
    });
  }

  // ─── Events ──────────────────────────────────────────────────────────────────

  _onResize() {
    if (!this.stage) return;
    const rect = this.stage.getBoundingClientRect();
    this.width = rect.width;
    this.height = rect.height;
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.width, this.height);
  }

  _onMouseMove(e) {
    const rect = this.canvas.getBoundingClientRect();
    if (rect.width === 0) return;
    const x =  ((e.clientX - rect.left)  / rect.width)  * 2 - 1;
    const y = -((e.clientY - rect.top)   / rect.height) * 2 + 1;
    this.mouse.set(x, y);
    this.mouseRaycaster.setFromCamera(this.mouse, this.camera);
    const hit = new THREE.Vector3();
    if (this.mouseRaycaster.ray.intersectPlane(this.interactionPlane, hit)) {
      this.mouseWorldPos.copy(hit);
    }
  }

  // ─── Public API ──────────────────────────────────────────────────────────────

  /**
   * 720° Click: implosion → explosion sequence
   */
  triggerImplosion() {
    if (this.imploding) return;
    this.imploding = true;

    this.particles.forEach((p, idx) => {
      const origScale = p.baseScale;

      // Phase 1: Implode toward center
      gsap.to(p.mesh.position, {
        x: (Math.random() - 0.5) * 0.6,
        y: (Math.random() - 0.5) * 0.8,
        z: (Math.random() - 0.5) * 0.5,
        duration: 0.30,
        ease: 'power3.in',
        onComplete: () => {
          // Phase 2: Explode outward
          const burst = 1.35 + Math.random() * 0.35;
          gsap.to(p.mesh.position, {
            x: p.basePos.x * burst,
            y: p.basePos.y * burst + (Math.random() - 0.5) * 2.2,
            z: p.basePos.z * burst,
            duration: 0.42,
            ease: 'back.out(2.5)',
            onComplete: () => {
              // Phase 3: Drift back to anti-gravity orbit
              gsap.to(p.mesh.position, {
                x: p.basePos.x, y: p.basePos.y, z: p.basePos.z,
                duration: 0.75,
                ease: 'power2.out',
                onComplete: () => {
                  if (idx === this.particles.length - 1) this.imploding = false;
                }
              });
            }
          });
        }
      });

      // Squash & stretch on scale
      const scl = p.type === 'ice' ? origScale : origScale;
      gsap.to(p.mesh.scale, {
        x: scl * 0.25, y: scl * 0.25, z: scl * 0.25,
        duration: 0.30, ease: 'power2.in',
        onComplete: () => {
          gsap.to(p.mesh.scale, {
            x: scl * 1.3, y: scl * 1.3, z: scl * 1.3,
            duration: 0.38, ease: 'back.out(2.0)',
            onComplete: () => {
              gsap.to(p.mesh.scale, { x: scl, y: scl, z: scl, duration: 0.45 });
            }
          });
        }
      });
    });
  }

  toggleAntiGravity(enabled) {
    this.antiGravityActive = enabled;
  }

  setTheme(key) {
    if (!this.themes[key]) return;
    this.theme = key;
    const t = this.themes[key];

    this.keyLight.color.setHex(t.lightColor);

    this.particles.forEach(p => {
      if (p.type === 'ice') {
        p.mesh.material.color.setHex(t.iceColor);
        p.mesh.material.emissive.setHex(t.iceEmissive);
        // Update child edge lines color
        p.mesh.children.forEach(child => {
          if (child.isMesh === false && child.material) {
            child.material.color.setHex(key === 'classic' ? 0xff9999 : 0xffffff);
          }
        });
      } else if (p.type === 'bubble') {
        p.mesh.material.color.setHex(t.bubbleColor);
        p.mesh.material.emissive.setHex(t.bubbleEmissive);
      } else if (p.type === 'droplet') {
        p.mesh.material.color.setHex(t.dropletColor);
        p.mesh.material.emissive.setHex(t.bubbleEmissive);
      }
      p.mesh.material.needsUpdate = true;
    });
  }

  // ─── Render Loop ─────────────────────────────────────────────────────────────

  _animate() {
    requestAnimationFrame(() => this._animate());

    const dt = Math.min(this.clock.getDelta(), 0.05);
    const t  = this.clock.getElapsedTime();

    if (!this.imploding) {
      const repelRadius = 4.5;
      const repelStrength = 9.0;

      for (const p of this.particles) {
        if (this.antiGravityActive) {
          // Sine-wave anti-gravity orbit
          const floatY = Math.sin(t * p.floatSpeedY + p.phaseY) * p.floatAmpY;
          const floatX = Math.cos(t * p.floatSpeedX + p.phaseX) * p.floatAmpX;
          const floatZ = Math.sin(t * 0.4 + p.phaseX * 1.3) * 0.18;

          const tx = p.basePos.x + floatX;
          const ty = p.basePos.y + floatY;
          const tz = p.basePos.z + floatZ;

          // Spring toward target
          p.velocity.x += (tx - p.mesh.position.x) * 4.8 * dt;
          p.velocity.y += (ty - p.mesh.position.y) * 4.8 * dt;
          p.velocity.z += (tz - p.mesh.position.z) * 4.8 * dt;

          // Cursor repelling forcefield
          const dist = p.mesh.position.distanceTo(this.mouseWorldPos);
          if (dist < repelRadius && dist > 0.05) {
            const push = new THREE.Vector3()
              .subVectors(p.mesh.position, this.mouseWorldPos)
              .normalize();
            const force = (1.0 - dist / repelRadius) * (repelStrength / p.mass);
            p.velocity.addScaledVector(push, force * dt);
          }
        } else {
          // Gravity off — drift gently to resting positions at bottom
          const restY = -6.5 + Math.abs(p.basePos.x) * 0.2;
          p.velocity.y += (restY - p.mesh.position.y) * 3.5 * dt;
          p.velocity.x += (0 - p.mesh.position.x) * 1.2 * dt;
        }

        // Fluid damping (air resistance)
        p.velocity.multiplyScalar(0.91);

        // Integrate position
        p.mesh.position.x += p.velocity.x * 5 * dt;
        p.mesh.position.y += p.velocity.y * 5 * dt;
        p.mesh.position.z += p.velocity.z * 5 * dt;

        // Organic tumbling rotation
        p.mesh.rotation.x += p.rotSpeed.x * dt;
        p.mesh.rotation.y += p.rotSpeed.y * dt;
        p.mesh.rotation.z += p.rotSpeed.z * dt;

        // Subtle pulsing emissive on bubbles for extra sparkle
        if (p.type === 'bubble') {
          const pulse = 0.3 + 0.2 * Math.sin(t * 3.5 + p.phaseY);
          p.mesh.material.emissiveIntensity = pulse;
          p.mesh.material.opacity = 0.45 + 0.15 * Math.sin(t * 2.2 + p.phaseX);
        }
      }
    }

    this.renderer.render(this.scene, this.camera);
  }
}

window.AntiGravityPhysicsEngine = AntiGravityPhysicsEngine;
