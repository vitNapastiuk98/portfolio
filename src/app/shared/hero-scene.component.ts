import { isPlatformBrowser } from '@angular/common';
import {
  afterNextRender,
  Component,
  DestroyRef,
  inject,
  PLATFORM_ID,
  viewChild,
} from '@angular/core';
import type { ElementRef } from '@angular/core';
import type { BufferGeometry, Group, Material, Mesh } from 'three';

@Component({
  selector: 'app-hero-scene',
  template: `
    <div
      #host
      class="scene-host"
      role="img"
      aria-label="Procedural architectural signal lattice representing connected software systems"
    >
      <div class="scene-fallback" aria-hidden="true"></div>
    </div>
  `,
  host: { class: 'hero-scene' },
})
export class HeroSceneComponent {
  private readonly host = viewChild.required<ElementRef<HTMLDivElement>>('host');
  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    afterNextRender(() => {
      if (!isPlatformBrowser(this.platformId)) return;
      const reduced =
        typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduced || !this.supportsWebGl()) return;
      void this.mountScene().catch(() => {
        if (this.destroyRef.destroyed) return;
        const host = this.host().nativeElement;
        host.classList.remove('has-webgl');
        host.querySelector('canvas')?.remove();
      });
    });
  }

  private supportsWebGl(): boolean {
    if (typeof WebGLRenderingContext === 'undefined') return false;
    try {
      const canvas = document.createElement('canvas');
      return Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl'));
    } catch {
      return false;
    }
  }

  private async mountScene(): Promise<void> {
    const THREE = await import('three');
    const host = this.host().nativeElement;
    if (!host.isConnected) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(31, 1, 0.1, 100);
    camera.position.set(0.15, 0.08, 10.5);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;
    host.appendChild(renderer.domElement);

    const rig = new THREE.Group();
    rig.rotation.set(-0.12, -0.28, -0.07);
    scene.add(rig);

    const steel = new THREE.MeshStandardMaterial({
      color: 0x8190a4,
      metalness: 0.88,
      roughness: 0.2,
    });
    const signal = new THREE.MeshPhysicalMaterial({
      color: 0xd85663,
      emissive: 0x471b25,
      emissiveIntensity: 0.75,
      metalness: 0.58,
      roughness: 0.2,
      clearcoat: 0.72,
    });
    const glass = new THREE.MeshPhysicalMaterial({
      color: 0x6d89aa,
      transparent: true,
      opacity: 0.085,
      roughness: 0.08,
      transmission: 0.15,
      side: THREE.DoubleSide,
    });
    const line = new THREE.LineBasicMaterial({
      color: 0xb4c0d0,
      transparent: true,
      opacity: 0.38,
    });

    const beamGeometry = new THREE.BoxGeometry(1, 1, 1);
    const portals: Group[] = [];
    for (let index = 0; index < 5; index += 1) {
      const portal = new THREE.Group();
      const width = 3.25 + index * 0.2;
      const height = 4.05 + index * 0.1;
      const thickness = 0.075;

      const top = new THREE.Mesh(beamGeometry, steel);
      top.scale.set(width, thickness, thickness);
      top.position.y = height / 2;
      const bottom = top.clone();
      bottom.position.y = -height / 2;
      const left = new THREE.Mesh(beamGeometry, steel);
      left.scale.set(thickness, height, thickness);
      left.position.x = -width / 2;
      const right = left.clone();
      right.position.x = width / 2;
      portal.add(top, bottom, left, right);
      portal.position.set((index - 2) * 0.32, Math.sin(index) * 0.07, (2 - index) * 0.72);
      portal.rotation.z = (index - 2) * 0.055;
      portal.rotation.y = (index - 2) * -0.025;
      rig.add(portal);
      portals.push(portal);
    }

    const membrane = new THREE.Mesh(new THREE.PlaneGeometry(3.15, 3.9), glass);
    membrane.position.set(0.42, -0.1, 0.18);
    membrane.rotation.z = -0.04;
    rig.add(membrane);

    const signalCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-2.55, -1.62, 2.15),
      new THREE.Vector3(-1.2, -0.84, 1.25),
      new THREE.Vector3(-0.65, 0.96, 0.48),
      new THREE.Vector3(0.74, 1.24, -0.35),
      new THREE.Vector3(1.43, -0.25, -1.28),
      new THREE.Vector3(2.35, 1.5, -2.2),
    ]);
    rig.add(new THREE.Mesh(new THREE.TubeGeometry(signalCurve, 96, 0.052, 10, false), signal));

    const core = new THREE.Mesh(new THREE.OctahedronGeometry(0.62, 1), signal);
    core.position.set(-0.48, 0.62, 0.38);
    rig.add(core);

    const coreWire = new THREE.LineSegments(
      new THREE.EdgesGeometry(new THREE.OctahedronGeometry(0.92, 1)),
      line,
    );
    coreWire.position.copy(core.position);
    coreWire.rotation.set(0.4, 0.3, -0.2);
    rig.add(coreWire);

    const spine = new THREE.Mesh(new THREE.BoxGeometry(0.1, 5.2, 0.1), steel);
    spine.position.set(0.2, 0.05, 1.18);
    spine.rotation.z = -0.16;
    rig.add(spine);

    scene.add(new THREE.HemisphereLight(0x93a5bd, 0x070b12, 2.0));
    const key = new THREE.DirectionalLight(0xf3dce0, 6.2);
    key.position.set(4.5, 5, 7);
    scene.add(key);
    const rim = new THREE.PointLight(0x6f9bd1, 19, 18);
    rim.position.set(-4.5, -1.5, 4);
    scene.add(rim);
    const warm = new THREE.PointLight(0xd85663, 12, 10);
    warm.position.set(1.8, 1.2, 1.4);
    scene.add(warm);

    let frame = 0;
    let running = true;
    let pointerX = 0;
    let pointerY = 0;
    const clock = new THREE.Clock();

    const resize = (): void => {
      const { clientWidth, clientHeight } = host;
      renderer.setSize(clientWidth, clientHeight, false);
      camera.aspect = clientWidth / Math.max(clientHeight, 1);
      camera.updateProjectionMatrix();
    };

    const move = (event: PointerEvent): void => {
      pointerX = (event.clientX / innerWidth - 0.5) * 0.18;
      pointerY = (event.clientY / innerHeight - 0.5) * 0.1;
    };

    const render = (): void => {
      if (!running) return;
      const elapsed = clock.getElapsedTime();
      rig.rotation.y +=
        (-0.28 + pointerX + Math.sin(elapsed * 0.18) * 0.025 - rig.rotation.y) * 0.025;
      rig.rotation.x +=
        (-0.12 + pointerY + Math.sin(elapsed * 0.24) * 0.012 - rig.rotation.x) * 0.025;
      portals.forEach((portal, index) => {
        portal.position.y +=
          (Math.sin(elapsed * 0.38 + index * 0.65) * 0.035 - portal.position.y) * 0.018;
      });
      core.rotation.x += 0.006;
      core.rotation.y += 0.008;
      coreWire.rotation.y -= 0.003;
      renderer.render(scene, camera);
      frame = requestAnimationFrame(render);
    };

    const intersection = new IntersectionObserver(([entry]) => {
      running = entry.isIntersecting && !document.hidden;
      cancelAnimationFrame(frame);
      if (running) {
        clock.start();
        frame = requestAnimationFrame(render);
      }
    });
    const visibility = (): void => {
      running = !document.hidden && host.getBoundingClientRect().bottom > 0;
      cancelAnimationFrame(frame);
      if (running) frame = requestAnimationFrame(render);
    };
    const resizeObserver = new ResizeObserver(resize);

    resizeObserver.observe(host);
    intersection.observe(host);
    addEventListener('pointermove', move, { passive: true });
    document.addEventListener('visibilitychange', visibility);
    resize();
    renderer.render(scene, camera);
    host.classList.add('has-webgl');
    frame = requestAnimationFrame(render);

    this.destroyRef.onDestroy(() => {
      running = false;
      cancelAnimationFrame(frame);
      intersection.disconnect();
      resizeObserver.disconnect();
      removeEventListener('pointermove', move);
      document.removeEventListener('visibilitychange', visibility);

      const geometries = new Set<BufferGeometry>();
      const materials = new Set<Material>();
      scene.traverse((object) => {
        const mesh = object as Mesh;
        if (mesh.geometry) geometries.add(mesh.geometry);
        const objectMaterial = mesh.material;
        if (objectMaterial) {
          const objectMaterials = Array.isArray(objectMaterial) ? objectMaterial : [objectMaterial];
          objectMaterials.forEach((material) => materials.add(material));
        }
      });
      geometries.forEach((geometry) => geometry.dispose());
      materials.forEach((material) => material.dispose());
      renderer.dispose();
      renderer.domElement.remove();
    });
  }
}
