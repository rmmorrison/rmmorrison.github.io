// Nebula shader — domain-warped fBm with mouse warp + click ripples.
// Light enough for integrated GPUs: ~5 octaves, single fragment pass.

(function () {
  const VERT = `
    attribute vec2 a_pos;
    void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
  `;

  const FRAG = `
    precision highp float;

    uniform vec2  u_res;
    uniform float u_time;
    uniform vec2  u_mouse;        // 0..1 normalized
    uniform float u_mouseAmt;     // 0..1 lerped pressure (idle decay)
    uniform vec4  u_ripples[6];   // xy=pos(0..1), z=startTime, w=strength
    uniform float u_speed;
    uniform float u_intensity;
    uniform float u_hueShift;
    uniform float u_grain;
    uniform float u_mouseStrength;
    uniform vec3  u_colA;         // void / deep navy
    uniform vec3  u_colB;         // teal mid
    uniform vec3  u_colC;         // bright teal highlight
    uniform vec3  u_colD;         // magenta accent

    // hash + value-noise (cheaper than simplex on integrated GPUs)
    float hash(vec2 p) {
      p = fract(p * vec2(123.34, 456.21));
      p += dot(p, p + 45.32);
      return fract(p.x * p.y);
    }
    float noise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      vec2 u = f * f * (3.0 - 2.0 * f);
      float a = hash(i);
      float b = hash(i + vec2(1.0, 0.0));
      float c = hash(i + vec2(0.0, 1.0));
      float d = hash(i + vec2(1.0, 1.0));
      return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
    }
    float fbm(vec2 p) {
      float v = 0.0;
      float a = 0.5;
      mat2 rot = mat2(0.8, -0.6, 0.6, 0.8);
      for (int i = 0; i < 5; i++) {
        v += a * noise(p);
        p = rot * p * 2.02;
        a *= 0.5;
      }
      return v;
    }

    // hsv->rgb for hue shifting the final composite
    vec3 hueShift(vec3 c, float h) {
      const vec3 k = vec3(0.57735);
      float cosA = cos(h);
      return c * cosA + cross(k, c) * sin(h) + k * dot(k, c) * (1.0 - cosA);
    }

    void main() {
      vec2 uv = gl_FragCoord.xy / u_res.xy;
      vec2 p = uv;
      p.x *= u_res.x / u_res.y;

      float t = u_time * 0.05 * u_speed;

      // mouse-driven warp center
      vec2 m = u_mouse;
      m.x *= u_res.x / u_res.y;
      vec2 toMouse = p - m;
      float md = length(toMouse);
      // softer falloff + smaller overall contribution — cursor is a gentle influence, not a magnet
      float mouseField = exp(-md * 1.4) * u_mouseAmt * u_mouseStrength;

      // ripples — each contributes a radial sin wave that decays with age
      float ripple = 0.0;
      for (int i = 0; i < 6; i++) {
        vec4 r = u_ripples[i];
        if (r.w > 0.001) {
          vec2 rp = r.xy;
          rp.x *= u_res.x / u_res.y;
          float age = u_time - r.z;
          if (age > 0.0 && age < 4.0) {
            float d = length(p - rp);
            float wave = sin(d * 14.0 - age * 6.0) * exp(-d * 2.5) * exp(-age * 1.2);
            ripple += wave * r.w;
          }
        }
      }

      // domain warp — two layers of fbm offset each other
      vec2 q = vec2(
        fbm(p + vec2(0.0, t)),
        fbm(p + vec2(5.2, -t * 0.8))
      );

      vec2 warp = q + mouseField * normalize(toMouse + 0.0001) * 0.12 + ripple * 0.15;

      vec2 r2 = vec2(
        fbm(p + 4.0 * warp + vec2(1.7, 9.2) + t),
        fbm(p + 4.0 * warp + vec2(8.3, 2.8) - t * 0.6)
      );

      float f = fbm(p + 4.0 * r2 + ripple * 0.4);

      // density shaping — push contrast so we get those black voids
      float density = smoothstep(0.15, 0.95, f);
      density = pow(density, 1.4 / max(u_intensity, 0.2));

      // magenta accent appears where r2 has a particular signature — bright streaks
      float accentMask = smoothstep(0.62, 0.95, length(r2)) * smoothstep(0.5, 0.9, f);
      accentMask += mouseField * 0.15;
      accentMask = clamp(accentMask, 0.0, 1.0);

      // base teal gradient — highlight contribution kept low so bright peaks don't fight foreground text
      vec3 col = mix(u_colA, u_colB, density);
      col = mix(col, u_colC, smoothstep(0.65, 0.95, density) * 0.45);
      // subtle secondary tone (no magenta)
      col = mix(col, u_colD, accentMask * 0.25);

      // starfield — sparse, only in dark voids
      float starField = 0.0;
      vec2 starP = uv * vec2(u_res.x / u_res.y, 1.0) * 800.0;
      float sh = hash(floor(starP));
      if (sh > 0.996) {
        vec2 sf = fract(starP) - 0.5;
        float twinkle = 0.5 + 0.5 * sin(u_time * 2.0 + sh * 30.0);
        starField = smoothstep(0.5, 0.0, length(sf)) * twinkle * (1.0 - density);
      }
      col += vec3(starField);

      // ripple highlight
      col += vec3(0.4, 0.6, 0.9) * max(ripple, 0.0) * 0.3;

      // hue shift
      col = hueShift(col, u_hueShift);

      // subtle grain (cheap)
      float g = (hash(gl_FragCoord.xy + u_time) - 0.5) * u_grain;
      col += g;

      // gentle vignette — stronger at edges to keep corners legible
      float vig = smoothstep(1.2, 0.3, length(uv - 0.5));
      col *= mix(0.65, 1.0, vig);

      // global darken — keeps the wallpaper as a backdrop, not a foreground
      col *= 0.78;

      gl_FragColor = vec4(col, 1.0);
    }
  `;

  function compile(gl, type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      console.error("shader compile error", gl.getShaderInfoLog(s));
    }
    return s;
  }

  window.initNebulaShader = function (canvas, getParams) {
    const gl =
      canvas.getContext("webgl", { antialias: false, alpha: false, premultipliedAlpha: false }) ||
      canvas.getContext("experimental-webgl");
    if (!gl) {
      console.warn("WebGL not available");
      return null;
    }

    const vs = compile(gl, gl.VERTEX_SHADER, VERT);
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
    const prog = gl.createProgram();
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      console.error("link error", gl.getProgramInfoLog(prog));
    }
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW
    );
    const aPos = gl.getAttribLocation(prog, "a_pos");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const U = {
      res: gl.getUniformLocation(prog, "u_res"),
      time: gl.getUniformLocation(prog, "u_time"),
      mouse: gl.getUniformLocation(prog, "u_mouse"),
      mouseAmt: gl.getUniformLocation(prog, "u_mouseAmt"),
      ripples: gl.getUniformLocation(prog, "u_ripples[0]"),
      speed: gl.getUniformLocation(prog, "u_speed"),
      intensity: gl.getUniformLocation(prog, "u_intensity"),
      hueShift: gl.getUniformLocation(prog, "u_hueShift"),
      grain: gl.getUniformLocation(prog, "u_grain"),
      mouseStrength: gl.getUniformLocation(prog, "u_mouseStrength"),
      colA: gl.getUniformLocation(prog, "u_colA"),
      colB: gl.getUniformLocation(prog, "u_colB"),
      colC: gl.getUniformLocation(prog, "u_colC"),
      colD: gl.getUniformLocation(prog, "u_colD"),
    };

    // Internal state
    const state = {
      mouseTarget: [0.5, 0.5],
      mouse: [0.5, 0.5],
      mouseAmtTarget: 0,
      mouseAmt: 0,
      ripples: new Float32Array(6 * 4), // 6 ripples, vec4 each
      ripplePtr: 0,
      startTime: performance.now(),
      lastT: 0,
      raf: 0,
      paused: false,
    };

    function resize() {
      // Lower DPR cap on small screens — keeps fragment cost manageable on phones
      const isSmall = window.matchMedia && window.matchMedia("(max-width: 720px)").matches;
      const dpr = Math.min(window.devicePixelRatio || 1, isSmall ? 1.0 : 1.5);
      const w = Math.floor(canvas.clientWidth * dpr);
      const h = Math.floor(canvas.clientHeight * dpr);
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        gl.viewport(0, 0, w, h);
      }
    }

    function onMove(e) {
      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = 1 - (e.clientY - rect.top) / rect.height;
      state.mouseTarget = [x, y];
      state.mouseAmtTarget = 1;
    }
    function onLeave() {
      state.mouseAmtTarget = 0;
    }
    function onClick(e) {
      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = 1 - (e.clientY - rect.top) / rect.height;
      const t = (performance.now() - state.startTime) / 1000;
      const idx = state.ripplePtr % 6;
      const o = idx * 4;
      state.ripples[o + 0] = x;
      state.ripples[o + 1] = y;
      state.ripples[o + 2] = t;
      state.ripples[o + 3] = 1.0;
      state.ripplePtr++;
    }

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerleave", onLeave);
    window.addEventListener("pointerdown", onClick);
    window.addEventListener("resize", resize);

    function render() {
      if (state.paused) {
        state.raf = requestAnimationFrame(render);
        return;
      }
      resize();
      const t = (performance.now() - state.startTime) / 1000;
      const dt = Math.min(0.05, t - state.lastT);
      state.lastT = t;

      // ease mouse toward target (smooth feel)
      state.mouse[0] += (state.mouseTarget[0] - state.mouse[0]) * Math.min(1, dt * 6);
      state.mouse[1] += (state.mouseTarget[1] - state.mouse[1]) * Math.min(1, dt * 6);
      state.mouseAmt += (state.mouseAmtTarget - state.mouseAmt) * Math.min(1, dt * 3);

      // age out ripple strength
      for (let i = 0; i < 6; i++) {
        const o = i * 4;
        const age = t - state.ripples[o + 2];
        if (age > 4) state.ripples[o + 3] = 0;
      }

      const p = getParams();

      gl.uniform2f(U.res, canvas.width, canvas.height);
      gl.uniform1f(U.time, t);
      gl.uniform2f(U.mouse, state.mouse[0], state.mouse[1]);
      gl.uniform1f(U.mouseAmt, state.mouseAmt);
      gl.uniform4fv(U.ripples, state.ripples);
      gl.uniform1f(U.speed, p.speed);
      gl.uniform1f(U.intensity, p.intensity);
      gl.uniform1f(U.hueShift, p.hueShift);
      gl.uniform1f(U.grain, p.grain);
      gl.uniform1f(U.mouseStrength, p.mouseStrength);
      gl.uniform3fv(U.colA, p.colA);
      gl.uniform3fv(U.colB, p.colB);
      gl.uniform3fv(U.colC, p.colC);
      gl.uniform3fv(U.colD, p.colD);

      gl.drawArrays(gl.TRIANGLES, 0, 6);
      state.raf = requestAnimationFrame(render);
    }
    render();

    return {
      destroy() {
        cancelAnimationFrame(state.raf);
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerleave", onLeave);
        window.removeEventListener("pointerdown", onClick);
        window.removeEventListener("resize", resize);
      },
      pause(v) {
        state.paused = v;
      },
    };
  };
})();
