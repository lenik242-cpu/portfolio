"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

/**
 * Liquid Shader — source 21st.dev « InteractiveNebulaShader », ADAPTÉ à la V4 :
 *  - contenu dans le hero (absolute), jamais `fixed` global ;
 *  - palette obsidienne / bleu froid / platine (pas de teal/violet/néon) ;
 *  - sans interaction curseur, très lent, très discret ;
 *  - DPR ≤ 1.5, pause quand l'onglet est caché ;
 *  - désactivé en mobile et reduced-motion (le hero garde son dégradé CSS).
 * Un seul canvas WebGL du site.
 */
export function LiquidShader({ className = "" }: { className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [disabled, setDisabled] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const mobile = window.matchMedia("(max-width: 767px)").matches;
    if (reduced || mobile) {
      setDisabled(true);
      return;
    }
    const container = containerRef.current;
    if (!container) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: "low-power" });
    } catch {
      setDisabled(true);
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const clock = new THREE.Clock();

    const vertexShader = `
      varying vec2 vUv;
      void main() { vUv = uv; gl_Position = vec4(position, 1.0); }
    `;

    // Liquide plein-cadre : fbm domain-warp, obsidienne → nuit froide #101A2B →
    // platine #71859A, bleu #4C7DFF rare. Matière remplissant tout le hero
    // (le nebula ray-marché rendait un cadre quasi noir → invisible).
    const fragmentShader = `
      precision mediump float;
      uniform vec2 iResolution;
      uniform float iTime;
      float hash(vec2 p){ p=fract(p*vec2(123.34,345.45)); p+=dot(p,p+34.345); return fract(p.x*p.y); }
      float noise(vec2 p){ vec2 i=floor(p),f=fract(p); vec2 u=f*f*(3.0-2.0*f);
        return mix(mix(hash(i),hash(i+vec2(1.0,0.0)),u.x),mix(hash(i+vec2(0.0,1.0)),hash(i+vec2(1.0,1.0)),u.x),u.y); }
      float fbm(vec2 p){ float v=0.0,a=0.5; for(int i=0;i<5;i++){ v+=a*noise(p); p=p*2.02+vec2(11.0,7.0); a*=0.5; } return v; }
      void main(){
        vec2 uv = gl_FragCoord.xy / iResolution;
        vec2 p = uv * vec2(iResolution.x/max(iResolution.y,1.0), 1.0) * 2.0;
        float t = iTime * 0.05;
        vec2 q = vec2(fbm(p + vec2(0.0, t)), fbm(p + vec2(5.2, 1.3) - t));
        vec2 r = vec2(fbm(p + q*2.0 + vec2(1.7, 9.2) + t*0.5), fbm(p + q*2.0 + vec2(8.3, 2.8) - t*0.4));
        float f = fbm(p + r*2.0);
        vec3 col = mix(vec3(0.031,0.035,0.051), vec3(0.063,0.102,0.169), smoothstep(0.2,0.7,f));
        col = mix(col, vec3(0.443,0.522,0.604), smoothstep(0.55,0.98,f) * 0.6);
        col += vec3(0.30,0.49,1.00) * smoothstep(0.75,1.0, r.x*0.5 + f*0.5) * 0.18;
        float vg = smoothstep(1.2, 0.35, length(uv-0.5));
        col *= mix(0.7, 1.0, vg);
        gl_FragColor = vec4(col, 1.0);
      }
    `;

    const uniforms = {
      iTime: { value: 0 },
      iResolution: { value: new THREE.Vector2() },
    };
    const material = new THREE.ShaderMaterial({ vertexShader, fragmentShader, uniforms });
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
    scene.add(mesh);

    const onResize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      renderer.setSize(w, h);
      uniforms.iResolution.value.set(w * renderer.getPixelRatio(), h * renderer.getPixelRatio());
    };
    window.addEventListener("resize", onResize);
    onResize();

    const render = () => {
      uniforms.iTime.value = clock.getElapsedTime() * 0.22; // très lent
      renderer.render(scene, camera);
    };
    // Ne tourne que si l'onglet est visible ET le hero est à l'écran.
    let hidden = document.hidden;
    let inView = true;
    const update = () =>
      renderer.setAnimationLoop(!hidden && inView ? render : null);
    update();

    const onVis = () => {
      hidden = document.hidden;
      update();
    };
    document.addEventListener("visibilitychange", onVis);
    const io = new IntersectionObserver(
      ([e]) => {
        inView = e.isIntersecting;
        update();
      },
      { threshold: 0 }
    );
    io.observe(container);

    return () => {
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVis);
      io.disconnect();
      renderer.setAnimationLoop(null);
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
      material.dispose();
      mesh.geometry.dispose();
      renderer.dispose();
    };
  }, []);

  if (disabled) return null;

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className={`absolute inset-0 ${className}`}
      style={{ opacity: 0.34 }}
    />
  );
}

export default LiquidShader;
