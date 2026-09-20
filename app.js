/**
 * ANTI-GRAVITY 3D CONTROLLER & INTERACTION ENGINE
 * Manages Model-Viewer camera choreography, 720° spin with motion-blur,
 * materials & lighting, audio synthesis, and brand catalog transitions.
 */

class AntiGravityApp {
  constructor() {
    this.modelViewer = document.getElementById('coke-model');
    this.physicsCanvas = document.getElementById('physics-canvas');
    this.shockwave = document.querySelector('.shockwave-ring');
    this.speedLines = document.querySelector('.speed-lines');

    // UI Elements
    this.titleEl = document.getElementById('product-title');
    this.flavorEl = document.getElementById('flavor-subtitle');
    this.descEl = document.getElementById('product-description');
    this.volumeEl = document.getElementById('spec-volume');
    this.caloriesEl = document.getElementById('spec-calories');
    this.servingEl = document.getElementById('spec-serving');
    this.sugarEl = document.getElementById('spec-sugar');
    this.btnSpin = document.getElementById('btn-spin');
    this.btnAntiGrav = document.getElementById('btn-antigravity');
    this.btnAudio = document.getElementById('btn-audio');
    this.btnNext = document.getElementById('btn-next-brand');
    this.btnClassic = document.getElementById('variant-classic');
    this.btnDiet = document.getElementById('variant-diet');
    this.modal = document.getElementById('brand-catalog-modal');
    this.modalClose = document.getElementById('modal-close');

    // State
    this.currentVariant = 'fanta';
    this.isSpinning = false;
    this.audioEnabled = false;
    this.antiGravityEnabled = true;
    this.currentOrbitAngle = 45;

    // Audio synthesizer
    this.audioCtx = null;

    // Product Specifications
    this.brandData = {
      classic: {
        title: "Coca-Cola",
        tag: "01 / 11 Product",
        edition: "Original Taste",
        subtitle: "Classic Sparkling Cola Refreshment",
        desc: "The world's most iconic sparkling soft drink. Crafted with secret natural flavors to awaken your senses with its crisp, uplifting effervescence.",
        volume: "355 ml",
        calories: "140 kcal",
        serving: "3°C Frost",
        sugar: "39g Cane",
        colors: {
          inner: "#e61c24",
          mid: "#61070b",
          outer: "#080304",
          accent: "#e61c24",
          glow: "rgba(230, 28, 36, 0.45)",
          text: "#ff8a8e"
        },
        metallic: 0.85,
        roughness: 0.22,
        exposure: 1.25
      },
      diet: {
        title: "Diet Coke",
        tag: "01 / 11 Product",
        edition: "Silver Frost Edition",
        subtitle: "Crisp & Light • Zero Sugar • Bold Refreshment",
        desc: "The legendary zero-calorie, zero-sugar soft drink. Clad in brushed aluminum and ice-cold condensation, delivering that unmistakable light crisp sensation.",
        volume: "355 ml",
        calories: "0 kcal",
        serving: "2°C Ice Cold",
        sugar: "0g Sugar",
        colors: {
          inner: "#808a94",
          mid: "#1d2328",
          outer: "#0b0d0f",
          accent: "#d1121b",
          glow: "rgba(209, 18, 27, 0.35)",
          text: "#ff7075"
        },
        metallic: 0.94,
        roughness: 0.16,
        exposure: 1.35
      },
      fanta: {
        title: "Fanta Orange",
        tag: "02 / 11 Product",
        edition: "Orange Sparkling",
        subtitle: "Bright • Bubbly • Bold Orange Fizz",
        desc: "Bright, bubbly, and instantly refreshing. Packed with bold fruity orange flavor and vibrant fizz.",
        volume: "350 ml",
        calories: "160 kcal",
        serving: "100% Citrus",
        sugar: "Sparkling",
        colors: {
          inner: "#ff6600",
          mid: "#993300",
          outer: "#1a0800",
          accent: "#ffcc00",
          glow: "rgba(255, 102, 0, 0.5)",
          text: "#ffe0a3"
        },
        metallic: 0.65,
        roughness: 0.28,
        exposure: 1.3
      },
      sprite: {
        title: "Sprite",
        tag: "03 / 11 Product",
        edition: "Lemon-Lime Sparkling",
        subtitle: "Crisp • Clean • Intense Citrus Fizz",
        desc: "Crisp, clean, and intensely refreshing. Blended with real lemon and lime flavors for an ice-cold burst of electrifying fizz.",
        volume: "350 ml",
        calories: "140 kcal",
        serving: "Lemon-Lime",
        sugar: "0g Zero",
        colors: {
          inner: "#00b140",
          mid: "#004d1a",
          outer: "#001a09",
          accent: "#80e000",
          glow: "rgba(0, 177, 64, 0.5)",
          text: "#a8ff3e"
        },
        metallic: 0.72,
        roughness: 0.18,
        exposure: 1.3
      },
      maaza: {
        title: "Maaza",
        tag: "04 / 11 Product",
        edition: "Alphonso Mango Indulgence",
        subtitle: "Rich • Thick • Authentic Tropical Mango",
        desc: "Rich, thick, and bursting with real Alphonso mango pulp. The ultimate authentic tropical mango indulgence in every drop.",
        volume: "250 ml",
        calories: "128 kcal",
        serving: "Alphonso Mango",
        sugar: "Real Pulp",
        colors: {
          inner: "#ff9900",
          mid: "#cc5500",
          outer: "#2e1000",
          accent: "#ffea00",
          glow: "rgba(255, 153, 0, 0.55)",
          text: "#ffea00"
        },
        metallic: 0.55,
        roughness: 0.32,
        exposure: 1.3
      },
      slice: {
        title: "Slice",
        tag: "05 / 11 Product",
        edition: "Thick Mango Drink",
        subtitle: "Velvety • Golden • Hand-Picked Nectar",
        desc: "Indulge in the thick, luscious taste of hand-picked Neelam & Alphonso mangoes for an unforgettably rich fruit experience.",
        volume: "250 ml",
        calories: "135 kcal",
        serving: "Juicy Nectar",
        sugar: "Rich Pulp",
        colors: {
          inner: "#ff8800",
          mid: "#993d00",
          outer: "#260f00",
          accent: "#ffd000",
          glow: "rgba(255, 136, 0, 0.55)",
          text: "#ffd000"
        },
        metallic: 0.60,
        roughness: 0.25,
        exposure: 1.3
      },
      frooti: {
        title: "Frooti",
        tag: "06 / 11 Product",
        edition: "Fresh Mango Drink",
        subtitle: "Juicy • Fun • Energetic Mango Punch",
        desc: "India’s favorite mango drink, offering a juicy, fun, and energetic mango punch packed with real mango pulp.",
        volume: "200 ml",
        calories: "110 kcal",
        serving: "Mango Nectar",
        sugar: "Fresh Pulp",
        colors: {
          inner: "#ffd700",
          mid: "#cc8800",
          outer: "#1e1300",
          accent: "#ffea00",
          glow: "rgba(255, 215, 0, 0.55)",
          text: "#ffea00"
        },
        metallic: 0.50,
        roughness: 0.35,
        exposure: 1.3
      },
      appyfizz: {
        title: "Appy Fizz",
        tag: "07 / 11 Product",
        edition: "Sparkling Apple Drink",
        subtitle: "Crisp • Bubbly • Sleek Midnight Apple",
        desc: "The cool drink with a crisp bite. A bubbly, sparkling real apple juice drink that delivers a sleek, refreshing sensation.",
        volume: "250 ml",
        calories: "120 kcal",
        serving: "Sparkling Apple",
        sugar: "Crisp Fizz",
        colors: {
          inner: "#990026",
          mid: "#4d0013",
          outer: "#110004",
          accent: "#ff3366",
          glow: "rgba(255, 51, 102, 0.55)",
          text: "#ff3366"
        },
        metallic: 0.85,
        roughness: 0.15,
        exposure: 1.35
      },
      tropicana: {
        title: "Tropicana",
        tag: "08 / 11 Product",
        edition: "100% Pure Orange",
        subtitle: "Sun-Ripened • Pure Citrus • Natural Vitamin C",
        desc: "100% pure orange juice crafted with no added sugar or preservatives. Packed with natural Vitamin C for an invigorating start.",
        volume: "250 ml",
        calories: "110 kcal",
        serving: "100% Juice",
        sugar: "Zero Added",
        colors: {
          inner: "#ff5500",
          mid: "#992200",
          outer: "#1c0700",
          accent: "#33cc55",
          glow: "rgba(255, 85, 0, 0.55)",
          text: "#33cc55"
        },
        metallic: 0.60,
        roughness: 0.28,
        exposure: 1.3
      },
      real: {
        title: "Réal Mixed Fruit",
        tag: "09 / 11 Product",
        edition: "Wholesome 9 Fruits",
        subtitle: "Multi-Fruit • Rich Blend • Whole Family Goodness",
        desc: "A delicious blend of 9 rich fruits in every pack. Crafted to provide whole family nutrition and wholesome fruit goodness.",
        volume: "200 ml",
        calories: "115 kcal",
        serving: "9 Fruits Blend",
        sugar: "Natural Nectar",
        colors: {
          inner: "#d62828",
          mid: "#6a040f",
          outer: "#1e0005",
          accent: "#f77f00",
          glow: "rgba(214, 40, 40, 0.55)",
          text: "#f77f00"
        },
        metallic: 0.65,
        roughness: 0.24,
        exposure: 1.3
      },
      sting: {
        title: "Sting Energy",
        tag: "10 / 11 Product",
        edition: "Electrifying Energy Surge",
        subtitle: "Intense • High Energy • Caffeine & Taurine",
        desc: "Electrify your senses with an intense burst of energy, caffeine, and taurine packed into a red berry formulation.",
        volume: "250 ml",
        calories: "140 kcal",
        serving: "Caffeine + Ginseng",
        sugar: "Energy Boost",
        colors: {
          inner: "#ff0055",
          mid: "#880022",
          outer: "#1a0005",
          accent: "#00ffff",
          glow: "rgba(0, 255, 255, 0.6)",
          text: "#00ffff"
        },
        metallic: 0.90,
        roughness: 0.12,
        exposure: 1.4
      },
      monster: {
        title: "Monster Ultra",
        tag: "11 / 11 Product",
        edition: "Ultra White Zero Sugar",
        subtitle: "Zero Sugar • Light Crisp Citrus • Unleashed Focus",
        desc: "Zero sugar, light crisp citrus taste, and unleashed energy. Engineered for peak athletic performance and maximum focus.",
        volume: "500 ml",
        calories: "0 kcal",
        serving: "Taurine + B-Complex",
        sugar: "Zero Sugar",
        colors: {
          inner: "#2e3b4e",
          mid: "#121824",
          outer: "#05080f",
          accent: "#00f3ff",
          glow: "rgba(0, 243, 255, 0.65)",
          text: "#00f3ff"
        },
        metallic: 0.95,
        roughness: 0.10,
        exposure: 1.45
      }
    };

    this.init();
  }

  init() {
    // 1. Initialize Physics Engine (pass stage container for correct sizing)
    const stageEl = document.getElementById('stage-viewport');
    if (window.AntiGravityPhysicsEngine) {
      this.physics = new window.AntiGravityPhysicsEngine(this.physicsCanvas, stageEl);
      this.physics.setTheme(this.currentVariant);
    }

    // 2. Setup Model Viewer properties & material tuning
    this.setupModelViewer();

    // 3. Bind UI interactions
    this.bindEvents();

    // 4. Initial Theme apply
    this.applyBrandVariant(this.currentVariant);
  }

  setupModelViewer() {
    // Tune metallic and roughness when 3D model loads
    this.modelViewer.addEventListener('load', () => {
      this.tuneModelMaterials();
    });

    // Track pointer start to distinguish click vs drag — only spin on clean click
    let _pointerStartX = 0, _pointerStartY = 0;
    this.modelViewer.addEventListener('pointerdown', (e) => {
      _pointerStartX = e.clientX;
      _pointerStartY = e.clientY;
    });
    this.modelViewer.addEventListener('click', (e) => {
      const dx = Math.abs(e.clientX - _pointerStartX);
      const dy = Math.abs(e.clientY - _pointerStartY);
      if (dx < 6 && dy < 6) {
        this.trigger720Spin();
      }
    });
  }

  tuneModelMaterials() {
    try {
      const model = this.modelViewer.model;
      if (!model || !model.materials) return;

      const variant = this.brandData[this.currentVariant];
      model.materials.forEach(mat => {
        if (mat.pbrMetallicRoughness) {
          mat.pbrMetallicRoughness.setMetallicFactor(variant.metallic);
          mat.pbrMetallicRoughness.setRoughnessFactor(variant.roughness);
        }
      });
      this.modelViewer.exposure = variant.exposure;
    } catch (err) {
      console.warn("Model material tuning: ", err);
    }
  }

  bindEvents() {
    // 720° Spin Button
    this.btnSpin.addEventListener('click', () => {
      this.trigger720Spin();
    });

    // Anti-Gravity Physics Toggle
    this.btnAntiGrav.addEventListener('click', () => {
      this.antiGravityEnabled = !this.antiGravityEnabled;
      if (this.physics) {
        this.physics.toggleAntiGravity(this.antiGravityEnabled);
      }
      this.btnAntiGrav.classList.toggle('active-toggle', this.antiGravityEnabled);
      this.btnAntiGrav.querySelector('.btn-label').textContent = 
        this.antiGravityEnabled ? "Anti-Gravity: ON" : "Anti-Gravity: OFF";
      this.playBeep(this.antiGravityEnabled ? 520 : 320);
    });

    // Coke variants remain available from the catalog.
    this.btnClassic.addEventListener('click', () => this.applyBrandVariant('classic'));
    this.btnDiet.addEventListener('click', () => this.applyBrandVariant('diet'));

    // Audio SFX Toggle
    this.btnAudio.addEventListener('click', () => {
      this.toggleAudio();
    });

    // Camera Zoom Controls
    document.getElementById('btn-zoom-in')?.addEventListener('click', () => this.adjustCameraZoom(-0.4));
    document.getElementById('btn-zoom-out')?.addEventListener('click', () => this.adjustCameraZoom(0.4));
    document.getElementById('btn-reset-view')?.addEventListener('click', () => this.resetCameraView());

    // Next Product / 11 Brand Catalog Modal
    this.btnNext.addEventListener('click', () => {
      this.openCatalogModal();
    });

    this.modalClose.addEventListener('click', () => {
      this.closeCatalogModal();
    });

    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) this.closeCatalogModal();
    });

    // Catalog items click
    document.querySelectorAll('.catalog-item').forEach(item => {
      item.addEventListener('click', () => {
        const brand = item.dataset.brand;
        if (brand === 'coke') {
          this.applyBrandVariant('diet');
          this.closeCatalogModal();
        } else if (brand === 'fanta') {
          this.applyBrandVariant('fanta');
          this.closeCatalogModal();
        } else if (brand === 'sprite') {
          this.applyBrandVariant('sprite');
          this.closeCatalogModal();
        } else if (brand === 'maaza' || brand === 'drpepper') {
          this.applyBrandVariant('maaza');
          this.closeCatalogModal();
        } else if (brand === 'slice' || brand === 'mountaindew') {
          this.applyBrandVariant('slice');
          this.closeCatalogModal();
        } else if (brand === 'frooti' || brand === 'monster') {
          this.applyBrandVariant('frooti');
          this.closeCatalogModal();
        } else if (brand === 'appyfizz' || brand === 'redbull') {
          this.applyBrandVariant('appyfizz');
          this.closeCatalogModal();
        } else if (brand === 'tropicana' || brand === 'pepsi') {
          this.applyBrandVariant('tropicana');
          this.closeCatalogModal();
        } else if (brand === 'real' || brand === 'sevenup') {
          this.applyBrandVariant('real');
          this.closeCatalogModal();
        } else if (brand === 'sting' || brand === 'sanpellegrino') {
          this.applyBrandVariant('sting');
          this.closeCatalogModal();
        } else if (brand === 'monster' || brand === 'schweppes') {
          this.applyBrandVariant('monster');
          this.closeCatalogModal();
        } else {
          alert(`Selected ${item.querySelector('.catalog-name').textContent}!\nComing soon in the next step.`);
        }
      });
    });
  }

  /**
   * Apply Brand Colors & Spec details
   */
  applyBrandVariant(variantKey) {
    this.currentVariant = variantKey;
    const data = this.brandData[variantKey];

    // Toggle active buttons
    if (variantKey === 'classic') {
      this.btnClassic.classList.add('active');
      this.btnDiet.classList.remove('active');
      if (this.modelViewer.getAttribute('src') !== 'assets/coca_cola.glb') {
        this.modelViewer.src = 'assets/coca_cola.glb';
      }
    } else if (variantKey === 'diet') {
      this.btnDiet.classList.add('active');
      this.btnClassic.classList.remove('active');
      if (this.modelViewer.getAttribute('src') !== 'assets/diet_coke.glb') {
        this.modelViewer.src = 'assets/diet_coke.glb';
      }
    } else if (variantKey === 'fanta') {
      this.btnDiet.classList.remove('active');
      this.btnClassic.classList.remove('active');
      if (this.modelViewer.getAttribute('src') !== 'assets/deit_soda2.glb') {
        this.modelViewer.src = 'assets/deit_soda2.glb';
      }
    } else if (variantKey === 'sprite') {
      this.btnDiet.classList.remove('active');
      this.btnClassic.classList.remove('active');
      if (this.modelViewer.getAttribute('src') !== 'assets/deit_soda2.glb') {
        this.modelViewer.src = 'assets/deit_soda2.glb';
      }
    } else if (variantKey === 'maaza') {
      this.btnDiet.classList.remove('active');
      this.btnClassic.classList.remove('active');
      if (this.modelViewer.getAttribute('src') !== 'assets/deit_soda2.glb') {
        this.modelViewer.src = 'assets/deit_soda2.glb';
      }
    } else if (variantKey === 'slice') {
      this.btnDiet.classList.remove('active');
      this.btnClassic.classList.remove('active');
      if (this.modelViewer.getAttribute('src') !== 'assets/deit_soda2.glb') {
        this.modelViewer.src = 'assets/deit_soda2.glb';
      }
    } else if (variantKey === 'frooti') {
      this.btnDiet.classList.remove('active');
      this.btnClassic.classList.remove('active');
      if (this.modelViewer.getAttribute('src') !== 'assets/deit_soda2.glb') {
        this.modelViewer.src = 'assets/deit_soda2.glb';
      }
    } else if (variantKey === 'appyfizz') {
      this.btnDiet.classList.remove('active');
      this.btnClassic.classList.remove('active');
      if (this.modelViewer.getAttribute('src') !== 'assets/deit_soda2.glb') {
        this.modelViewer.src = 'assets/deit_soda2.glb';
      }
    } else if (variantKey === 'tropicana') {
      this.btnDiet.classList.remove('active');
      this.btnClassic.classList.remove('active');
      if (this.modelViewer.getAttribute('src') !== 'assets/deit_soda2.glb') {
        this.modelViewer.src = 'assets/deit_soda2.glb';
      }
    } else if (variantKey === 'real') {
      this.btnDiet.classList.remove('active');
      this.btnClassic.classList.remove('active');
      if (this.modelViewer.getAttribute('src') !== 'assets/deit_soda2.glb') {
        this.modelViewer.src = 'assets/deit_soda2.glb';
      }
    } else if (variantKey === 'sting') {
      this.btnDiet.classList.remove('active');
      this.btnClassic.classList.remove('active');
      if (this.modelViewer.getAttribute('src') !== 'assets/deit_soda2.glb') {
        this.modelViewer.src = 'assets/deit_soda2.glb';
      }
    } else if (variantKey === 'monster') {
      this.btnDiet.classList.remove('active');
      this.btnClassic.classList.remove('active');
      if (this.modelViewer.getAttribute('src') !== 'assets/diet_coke.glb') {
        this.modelViewer.src = 'assets/diet_coke.glb';
      }
    }

    // Update Text
    this.titleEl.textContent = data.title;
    this.flavorEl.textContent = data.subtitle;
    this.descEl.textContent = data.desc;
    this.volumeEl.textContent = data.volume;
    this.caloriesEl.textContent = data.calories;
    this.servingEl.textContent = data.serving;
    this.sugarEl.textContent = data.sugar;
    document.querySelector('[data-spec-label="flavor"]').textContent =
      (variantKey === 'monster') ? 'Formula' : (variantKey === 'sting') ? 'Active' : (variantKey === 'real') ? 'Blend' : (variantKey === 'tropicana') ? 'Purity' : (variantKey === 'appyfizz' || variantKey === 'frooti') ? 'Type' : (variantKey === 'maaza' || variantKey === 'slice') ? 'Blend' : (variantKey === 'fanta' || variantKey === 'sprite') ? 'Flavor' : 'Serving';
    document.querySelector('[data-spec-label="sparkle"]').textContent =
      (variantKey === 'monster') ? 'Performance' : (variantKey === 'sting') ? 'Surge' : (variantKey === 'real') ? 'Fruit Base' : (variantKey === 'tropicana') ? 'Sugars' : (variantKey === 'appyfizz') ? 'Carbonation' : (variantKey === 'frooti') ? 'Nectar' : (variantKey === 'maaza' || variantKey === 'slice') ? 'Texture' : (variantKey === 'fanta' || variantKey === 'sprite') ? 'Fizziness' : 'Sugar';
    document.querySelector('.brand-edition-pill').textContent = data.edition;
    document.querySelector('.brand-logo-text').textContent =
      variantKey === 'fanta' ? 'Fanta' : variantKey === 'sprite' ? 'Sprite' : variantKey === 'maaza' ? 'Maaza' : variantKey === 'slice' ? 'Slice' : variantKey === 'frooti' ? 'Frooti' : variantKey === 'appyfizz' ? 'Appy Fizz' : variantKey === 'tropicana' ? 'Tropicana' : variantKey === 'real' ? 'Réal' : variantKey === 'sting' ? 'Sting' : variantKey === 'monster' ? 'Monster' : 'Coca-Cola';
    document.querySelector('.tag-step').lastChild.textContent = ` ${data.tag}`;
    document.title = `${data.title} | Anti-Gravity 3D Showcase Experience`;

    // Swap floating citrus emoji theme
    this._updateFloatingElements(variantKey);

    // Update Next-Brand button label
    this._updateNextBrandBtn(variantKey);

    // Apply CSS Variables for background glow & theme
    const root = document.documentElement;
    root.style.setProperty('--bg-inner', data.colors.inner);
    root.style.setProperty('--bg-mid', data.colors.mid);
    root.style.setProperty('--bg-outer', data.colors.outer);
    root.style.setProperty('--accent-color', data.colors.accent);
    root.style.setProperty('--accent-glow', data.colors.glow);
    root.style.setProperty('--accent-text', data.colors.text);

    // Update Three.js physics colors
    if (this.physics) {
      this.physics.setTheme(variantKey);
    }

    // Update Model-Viewer metallic/roughness
    this.tuneModelMaterials();

    // Trigger gentle bounce
    gsap.fromTo(".info-panel > *", 
      { opacity: 0.7, y: 6 }, 
      { opacity: 1, y: 0, duration: 0.35, stagger: 0.04 }
    );
  }

  /**
   * Swap the floating emoji elements to match the current brand theme.
   */
  _updateFloatingElements(variantKey) {
    const slices = document.querySelectorAll('.citrus-slice');
    const emojiSets = {
      classic:    ['🥤', '❄️', '🫧'],
      diet:       ['🥤', '❄️', '🫧'],
      fanta:      ['🍊', '🍊', '🍊'],
      sprite:     ['🍋', '🍈', '🫧'],
      maaza:      ['🥭', '🍃', '🥭'],
      slice:      ['🥭', '✨', '🥭'],
      frooti:     ['🥭', '🍃', '🥭'],
      appyfizz:   ['🍎', '🍏', '✨'],
      tropicana:  ['🍊', '🍃', '💦'],
      real:       ['🍓', '🍊', '🍎'],
      sting:      ['⚡', '💥', '🍓'],
      monster:    ['❄️', '⚡', '💎']
    };
    const set = emojiSets[variantKey] || emojiSets.classic;
    slices.forEach((el, i) => {
      el.textContent = set[i] || set[0];
    });
  }

  /**
   * Update the footer Next-Brand CTA text based on the current product.
   */
  _updateNextBrandBtn(variantKey) {
    const btnEl = document.getElementById('btn-next-brand');
    if (!btnEl) return;
    const labels = {
      classic:    'Next: Product 02 Fanta Orange',
      diet:       'Next: Product 02 Fanta Orange',
      fanta:      'Next: Product 03 Sprite Lemon-Lime',
      sprite:     'Next: Product 04 Maaza — Mango',
      maaza:      'Next: Product 05 Slice — Mango',
      slice:      'Next: Product 06 Frooti — Mango',
      frooti:     'Next: Product 07 Appy Fizz — Apple',
      appyfizz:   'Next: Product 08 Tropicana — Orange',
      tropicana:  'Next: Product 09 Réal — Mixed Fruit',
      real:       'Next: Product 10 Sting — Energy',
      sting:      'Next: Product 11 Monster Ultra White',
      monster:    '🔄 Restart Showcase: Product 01 Coca-Cola'
    };
    const span = btnEl.querySelector('span');
    if (span) span.textContent = labels[variantKey] || 'Next Product';
  }

  /**
   * 720° Motion Spin with Camera Orbit, Implosion Physics & Motion Blur
   */
  trigger720Spin() {
    if (this.isSpinning) return;
    this.isSpinning = true;

    // 1. Trigger audio whoosh & fizzy pop
    this.playWhooshSound();

    // 2. Trigger Anti-Gravity Implosion & Explosion in Three.js
    if (this.physics) {
      this.physics.triggerImplosion();
    }

    // 3. Shockwave & Speed-Lines FX
    this.triggerVisualEffects();

    // 4. Animate Model-Viewer Camera Orbit 720 degrees
    const currentOrbit = this.modelViewer.getCameraOrbit();
    const currentThetaDeg = (currentOrbit.theta * 180 / Math.PI);
    const targetThetaDeg = currentThetaDeg + 720;
    const phiDeg = (currentOrbit.phi * 180 / Math.PI);
    const radiusM = currentOrbit.radius;

    const animObj = { deg: currentThetaDeg };

    gsap.to(animObj, {
      deg: targetThetaDeg,
      duration: 1.35,
      ease: "power2.inOut",
      onUpdate: () => {
        this.modelViewer.cameraOrbit = `${animObj.deg}deg ${phiDeg}deg ${radiusM}m`;
      },
      onComplete: () => {
        this.isSpinning = false;
        this.currentOrbitAngle = targetThetaDeg % 360;
      }
    });

    // Slight scale punch on the can
    gsap.fromTo(this.modelViewer, 
      { scale: 0.95 }, 
      { scale: 1, duration: 1.35, ease: "elastic.out(1, 0.4)" }
    );
  }

  triggerVisualEffects() {
    // Shockwave ring animation
    gsap.killTweensOf(this.shockwave);
    gsap.set(this.shockwave, { scale: 0.1, opacity: 0.9 });
    gsap.to(this.shockwave, {
      scale: 2.2,
      opacity: 0,
      duration: 0.85,
      ease: "power2.out"
    });

    // Speed lines
    this.speedLines.classList.add('active');
    setTimeout(() => {
      this.speedLines.classList.remove('active');
    }, 1100);
  }

  adjustCameraZoom(deltaRadius) {
    const orbit = this.modelViewer.getCameraOrbit();
    const thetaDeg = (orbit.theta * 180 / Math.PI);
    const phiDeg = (orbit.phi * 180 / Math.PI);
    const newRadius = Math.max(1.2, Math.min(4.5, orbit.radius + deltaRadius));

    gsap.to(this.modelViewer, {
      duration: 0.4,
      ease: "power2.out",
      onUpdate: () => {
        this.modelViewer.cameraOrbit = `${thetaDeg}deg ${phiDeg}deg ${newRadius}m`;
      }
    });
  }

  resetCameraView() {
    gsap.to(this.modelViewer, {
      duration: 0.6,
      ease: "power2.inOut",
      onUpdate: () => {
        this.modelViewer.cameraOrbit = `225deg 75deg 2.5m`;
      }
    });
  }

  /**
   * High-Tech Web Audio Synthesizer (No external audio file dependencies)
   */
  initAudioContext() {
    if (!this.audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.audioCtx = new AudioContext();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  toggleAudio() {
    this.initAudioContext();
    this.audioEnabled = !this.audioEnabled;
    this.btnAudio.style.color = this.audioEnabled ? "var(--accent-color)" : "inherit";
    this.btnAudio.style.borderColor = this.audioEnabled ? "var(--accent-color)" : "rgba(255,255,255,0.15)";
    if (this.audioEnabled) {
      this.playFizzLoop();
    }
  }

  playBeep(freq = 440) {
    if (!this.audioEnabled || !this.audioCtx) return;
    try {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);
      gain.gain.setValueAtTime(0.12, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.15);
    } catch (e) {}
  }

  playWhooshSound() {
    if (!this.audioEnabled || !this.audioCtx) return;
    try {
      // Noise buffer for atmospheric whoosh
      const bufferSize = this.audioCtx.sampleRate * 0.9;
      const buffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = this.audioCtx.createBufferSource();
      noise.buffer = buffer;

      // Bandpass filter with sweep
      const filter = this.audioCtx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.setValueAtTime(200, this.audioCtx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(1200, this.audioCtx.currentTime + 0.4);
      filter.frequency.exponentialRampToValueAtTime(150, this.audioCtx.currentTime + 0.9);
      filter.Q.value = 3.0;

      const gain = this.audioCtx.createGain();
      gain.gain.setValueAtTime(0.01, this.audioCtx.currentTime);
      gain.gain.linearRampToValueAtTime(0.35, this.audioCtx.currentTime + 0.35);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.9);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.audioCtx.destination);

      noise.start();
    } catch (e) {}
  }

  playFizzLoop() {
    this.playBeep(880);
  }

  openCatalogModal() {
    this.modal.classList.add('open');
  }

  closeCatalogModal() {
    this.modal.classList.remove('open');
  }
}

// ─── Boot Sequence ──────────────────────────────────────────────────────────────
window.addEventListener('DOMContentLoaded', () => {
  const overlay = document.getElementById('loading-overlay');

  // Init the app
  window.antiGravityApp = new AntiGravityApp();

  // Dismiss loading overlay when model-viewer fires its first load event
  const mv = document.getElementById('coke-model');
  const dismissLoader = () => {
    if (!overlay) return;
    gsap.to(overlay, {
      opacity: 0,
      duration: 0.6,
      ease: 'power2.out',
      onComplete: () => {
        overlay.style.display = 'none';
      }
    });

    // Entrance animations
    gsap.fromTo('.top-bar',
      { opacity: 0, y: -20 },
      { opacity: 1, y: 0, duration: 0.55, ease: 'power2.out', delay: 0.1 }
    );
    gsap.fromTo('.info-panel',
      { opacity: 0, x: 40 },
      { opacity: 1, x: 0, duration: 0.65, ease: 'power3.out', delay: 0.15 }
    );
    gsap.fromTo('.stage-hint',
      { opacity: 0, y: 10 },
      { opacity: 1, y: 0, duration: 0.55, ease: 'power2.out', delay: 0.45 }
    );
  };

  mv.addEventListener('load', dismissLoader, { once: true });

  // Fallback: dismiss loader after 5 seconds even if model is slow
  setTimeout(() => {
    if (overlay && overlay.style.display !== 'none') {
      dismissLoader();
    }
  }, 5000);
});
