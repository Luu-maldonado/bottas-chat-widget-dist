import * as K from "react";
import Q, { useRef as O, useState as g, useEffect as C, useCallback as j } from "react";
import X from "react-dom";
function Z(r) {
  return r && r.__esModule && Object.prototype.hasOwnProperty.call(r, "default") ? r.default : r;
}
var A = { exports: {} }, b = {};
/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var B;
function ee() {
  if (B) return b;
  B = 1;
  var r = Q, e = Symbol.for("react.element"), t = Symbol.for("react.fragment"), o = Object.prototype.hasOwnProperty, l = r.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner, s = { key: !0, ref: !0, __self: !0, __source: !0 };
  function i(a, n, u) {
    var d, v = {}, f = null, y = null;
    u !== void 0 && (f = "" + u), n.key !== void 0 && (f = "" + n.key), n.ref !== void 0 && (y = n.ref);
    for (d in n) o.call(n, d) && !s.hasOwnProperty(d) && (v[d] = n[d]);
    if (a && a.defaultProps) for (d in n = a.defaultProps, n) v[d] === void 0 && (v[d] = n[d]);
    return { $$typeof: e, type: a, key: f, ref: y, props: v, _owner: l.current };
  }
  return b.Fragment = t, b.jsx = i, b.jsxs = i, b;
}
var N;
function te() {
  return N || (N = 1, A.exports = ee()), A.exports;
}
var c = te(), k = {}, q;
function ne() {
  if (q) return k;
  q = 1;
  var r = X;
  return k.createRoot = r.createRoot, k.hydrateRoot = r.hydrateRoot, k;
}
var se = ne();
const oe = /* @__PURE__ */ Z(se);
function I() {
  return I = Object.assign ? Object.assign.bind() : function(r) {
    for (var e = 1; e < arguments.length; e++) {
      var t = arguments[e];
      for (var o in t) ({}).hasOwnProperty.call(t, o) && (r[o] = t[o]);
    }
    return r;
  }, I.apply(null, arguments);
}
function ae(r) {
  const e = new Uint8Array(r);
  return window.btoa(String.fromCharCode(...e));
}
function re(r) {
  const e = window.atob(r), t = e.length, o = new Uint8Array(t);
  for (let l = 0; l < t; l++) o[l] = e.charCodeAt(l);
  return o.buffer;
}
const ie = new Blob([`
      const TARGET_SAMPLE_RATE = 16000;
      class RawAudioProcessor extends AudioWorkletProcessor {
        constructor() {
          super();
          this.buffer = []; // Initialize an empty buffer
          this.bufferSize = TARGET_SAMPLE_RATE / 4; // Define the threshold for buffer size to be ~0.25s

          if (globalThis.LibSampleRate && sampleRate !== TARGET_SAMPLE_RATE) {
            globalThis.LibSampleRate.create(1, sampleRate, TARGET_SAMPLE_RATE).then(resampler => {
              this.resampler = resampler;
            });
          }
        }
        process(inputs, outputs) {
          const input = inputs[0]; // Get the first input node
          if (input.length > 0) {
            let channelData = input[0]; // Get the first channel's data

            // Resample the audio if necessary
            if (this.resampler) {
              channelData = this.resampler.full(channelData);
            }

            // Add channel data to the buffer
            this.buffer.push(...channelData);
            // Get max volume 
            let sum = 0.0;
            for (let i = 0; i < channelData.length; i++) {
              sum += channelData[i] * channelData[i];
            }
            const maxVolume = Math.sqrt(sum / channelData.length);
            // Check if buffer size has reached or exceeded the threshold
            if (this.buffer.length >= this.bufferSize) {
              const float32Array = new Float32Array(this.buffer)
              let pcm16Array = new Int16Array(float32Array.length);

              // Iterate through the Float32Array and convert each sample to PCM16
              for (let i = 0; i < float32Array.length; i++) {
                // Clamp the value to the range [-1, 1]
                let sample = Math.max(-1, Math.min(1, float32Array[i]));
            
                // Scale the sample to the range [-32768, 32767] and store it in the Int16Array
                pcm16Array[i] = sample < 0 ? sample * 32768 : sample * 32767;
              }
            
              // Send the buffered data to the main script
              this.port.postMessage([pcm16Array, maxVolume]);
            
              // Clear the buffer after sending
              this.buffer = [];
            }
          }
          return true; // Continue processing
        }
      }
      registerProcessor("raw-audio-processor", RawAudioProcessor);
  `], { type: "application/javascript" }), le = URL.createObjectURL(ie);
class D {
  static async create(e) {
    let t = null, o = null;
    try {
      const i = navigator.mediaDevices.getSupportedConstraints().sampleRate;
      t = new window.AudioContext(i ? { sampleRate: e } : {});
      const a = t.createAnalyser();
      i || await t.audioWorklet.addModule("https://cdn.jsdelivr.net/npm/@alexanderolsen/libsamplerate-js@2.1.2/dist/libsamplerate.worklet.js"), await t.audioWorklet.addModule(le), o = await navigator.mediaDevices.getUserMedia({ audio: { sampleRate: { ideal: e }, echoCancellation: { ideal: !0 }, noiseSuppression: { ideal: !0 } } });
      const n = t.createMediaStreamSource(o), u = new AudioWorkletNode(t, "raw-audio-processor");
      return n.connect(a), a.connect(u), new D(t, a, u, o);
    } catch (i) {
      var l, s;
      throw (l = o) == null || l.getTracks().forEach((a) => a.stop()), (s = t) == null || s.close(), i;
    }
  }
  constructor(e, t, o, l) {
    this.context = void 0, this.analyser = void 0, this.worklet = void 0, this.inputStream = void 0, this.context = e, this.analyser = t, this.worklet = o, this.inputStream = l;
  }
  async close() {
    this.inputStream.getTracks().forEach((e) => e.stop()), await this.context.close();
  }
}
const ce = new Blob([`
      class AudioConcatProcessor extends AudioWorkletProcessor {
        constructor() {
          super();
          this.buffers = []; // Initialize an empty buffer
          this.cursor = 0;
          this.currentBuffer = null;
          this.wasInterrupted = false;
          this.finished = false;

          this.port.onmessage = ({ data }) => {
            switch (data.type) {
              case "buffer":
                this.wasInterrupted = false;
                this.buffers.push(new Int16Array(data.buffer));
                break;
              case "interrupt":
                this.wasInterrupted = true;
                break;
              case "clearInterrupted":
                if (this.wasInterrupted) {
                  this.wasInterrupted = false;
                  this.buffers = [];
                  this.currentBuffer = null;
                }
            }
          };
        }
        process(_, outputs) {
          let finished = false;
          const output = outputs[0][0];
          for (let i = 0; i < output.length; i++) {
            if (!this.currentBuffer) {
              if (this.buffers.length === 0) {
                finished = true;
                break;
              }
              this.currentBuffer = this.buffers.shift();
              this.cursor = 0;
            }

            output[i] = this.currentBuffer[this.cursor] / 32768;
            this.cursor++;

            if (this.cursor >= this.currentBuffer.length) {
              this.currentBuffer = null;
            }
          }

          if (this.finished !== finished) {
            this.finished = finished;
            this.port.postMessage({ type: "process", finished });
          }

          return true; // Continue processing
        }
      }

      registerProcessor("audio-concat-processor", AudioConcatProcessor);
    `], { type: "application/javascript" }), ue = URL.createObjectURL(ce);
let de = class W {
  static async create(e) {
    let t = null;
    try {
      t = new AudioContext({ sampleRate: e });
      const l = t.createAnalyser(), s = t.createGain();
      s.connect(l), l.connect(t.destination), await t.audioWorklet.addModule(ue);
      const i = new AudioWorkletNode(t, "audio-concat-processor");
      return i.connect(s), new W(t, l, s, i);
    } catch (l) {
      var o;
      throw (o = t) == null || o.close(), l;
    }
  }
  constructor(e, t, o, l) {
    this.context = void 0, this.analyser = void 0, this.gain = void 0, this.worklet = void 0, this.context = e, this.analyser = t, this.gain = o, this.worklet = l;
  }
  async close() {
    await this.context.close();
  }
};
function z(r) {
  return !!r.type;
}
let he = class U {
  static async create(e) {
    let t = null;
    try {
      var o;
      const s = (o = e.origin) != null ? o : "wss://api.elevenlabs.io", i = e.signedUrl ? e.signedUrl : s + "/v1/convai/conversation?agent_id=" + e.agentId, a = ["convai"];
      e.authorization && a.push(`bearer.${e.authorization}`), t = new WebSocket(i, a);
      const n = await new Promise((v, f) => {
        t.addEventListener("open", () => {
          var y;
          const m = { type: "conversation_initiation_client_data" };
          var _, w, x, R;
          e.overrides && (m.conversation_config_override = { agent: { prompt: (_ = e.overrides.agent) == null ? void 0 : _.prompt, first_message: (w = e.overrides.agent) == null ? void 0 : w.firstMessage, language: (x = e.overrides.agent) == null ? void 0 : x.language }, tts: { voice_id: (R = e.overrides.tts) == null ? void 0 : R.voiceId } }), e.customLlmExtraBody && (m.custom_llm_extra_body = e.customLlmExtraBody), (y = t) == null || y.send(JSON.stringify(m));
        }, { once: !0 }), t.addEventListener("error", f), t.addEventListener("close", f), t.addEventListener("message", (y) => {
          const m = JSON.parse(y.data);
          z(m) && (m.type === "conversation_initiation_metadata" ? v(m.conversation_initiation_metadata_event) : console.warn("First received message is not conversation metadata."));
        }, { once: !0 });
      }), u = n.conversation_id, d = parseInt(n.agent_output_audio_format.replace("pcm_", ""));
      return new U(t, u, d);
    } catch (s) {
      var l;
      throw (l = t) == null || l.close(), s;
    }
  }
  constructor(e, t, o) {
    this.socket = void 0, this.conversationId = void 0, this.sampleRate = void 0, this.socket = e, this.conversationId = t, this.sampleRate = o;
  }
  close() {
    this.socket.close();
  }
  sendMessage(e) {
    this.socket.send(JSON.stringify(e));
  }
};
const pe = { clientTools: {} }, fe = { onConnect: () => {
}, onDebug: () => {
}, onDisconnect: () => {
}, onError: () => {
}, onMessage: () => {
}, onModeChange: () => {
}, onStatusChange: () => {
} };
class F {
  static async startSession(e) {
    const t = I({}, pe, fe, e);
    t.onStatusChange({ status: "connecting" });
    let o = null, l = null, s = null;
    try {
      return o = await D.create(16e3), l = await he.create(e), s = await de.create(l.sampleRate), new F(t, l, o, s);
    } catch (u) {
      var i, a, n;
      throw t.onStatusChange({ status: "disconnected" }), (i = l) == null || i.close(), await ((a = o) == null ? void 0 : a.close()), await ((n = s) == null ? void 0 : n.close()), u;
    }
  }
  constructor(e, t, o, l) {
    var s = this;
    this.options = void 0, this.connection = void 0, this.input = void 0, this.output = void 0, this.lastInterruptTimestamp = 0, this.mode = "listening", this.status = "connecting", this.inputFrequencyData = void 0, this.outputFrequencyData = void 0, this.volume = 1, this.endSession = async function() {
      s.status === "connected" && (s.updateStatus("disconnecting"), s.connection.close(), await s.input.close(), await s.output.close(), s.updateStatus("disconnected"));
    }, this.updateMode = (i) => {
      i !== this.mode && (this.mode = i, this.options.onModeChange({ mode: i }));
    }, this.updateStatus = (i) => {
      i !== this.status && (this.status = i, this.options.onStatusChange({ status: i }));
    }, this.onEvent = async function(i) {
      try {
        const n = JSON.parse(i.data);
        if (!z(n)) return;
        switch (n.type) {
          case "interruption":
            n.interruption_event && (s.lastInterruptTimestamp = n.interruption_event.event_id), s.fadeOutAudio();
            break;
          case "agent_response":
            s.options.onMessage({ source: "ai", message: n.agent_response_event.agent_response });
            break;
          case "user_transcript":
            s.options.onMessage({ source: "user", message: n.user_transcription_event.user_transcript });
            break;
          case "internal_tentative_agent_response":
            s.options.onDebug({ type: "tentative_agent_response", response: n.tentative_agent_response_internal_event.tentative_agent_response });
            break;
          case "client_tool_call":
            if (s.options.clientTools.hasOwnProperty(n.client_tool_call.tool_name)) {
              try {
                var a;
                const u = (a = await s.options.clientTools[n.client_tool_call.tool_name](n.client_tool_call.parameters)) != null ? a : "Client tool execution successful.";
                s.connection.sendMessage({ type: "client_tool_result", tool_call_id: n.client_tool_call.tool_call_id, result: u, is_error: !1 });
              } catch (u) {
                s.onError("Client tool execution failed with following error: " + (u == null ? void 0 : u.message), { clientToolName: n.client_tool_call.tool_name }), s.connection.sendMessage({ type: "client_tool_result", tool_call_id: n.client_tool_call.tool_call_id, result: "Client tool execution failed: " + (u == null ? void 0 : u.message), is_error: !0 });
              }
              break;
            }
            if (s.options.onUnhandledClientToolCall) {
              s.options.onUnhandledClientToolCall(n.client_tool_call);
              break;
            }
            s.onError(`Client tool with name ${n.client_tool_call.tool_name} is not defined on client`, { clientToolName: n.client_tool_call.tool_name }), s.connection.sendMessage({ type: "client_tool_result", tool_call_id: n.client_tool_call.tool_call_id, result: `Client tool with name ${n.client_tool_call.tool_name} is not defined on client`, is_error: !0 });
            break;
          case "audio":
            s.lastInterruptTimestamp <= n.audio_event.event_id && (s.addAudioBase64Chunk(n.audio_event.audio_base_64), s.updateMode("speaking"));
            break;
          case "ping":
            s.connection.sendMessage({ type: "pong", event_id: n.ping_event.event_id });
            break;
          default:
            s.options.onDebug(n);
        }
      } catch {
        return void s.onError("Failed to parse event data", { event: i });
      }
    }, this.onInputWorkletMessage = (i) => {
      this.status === "connected" && this.connection.sendMessage({ user_audio_chunk: ae(i.data[0].buffer) });
    }, this.onOutputWorkletMessage = ({ data: i }) => {
      i.type === "process" && this.updateMode(i.finished ? "listening" : "speaking");
    }, this.addAudioBase64Chunk = async function(i) {
      s.output.gain.gain.value = s.volume, s.output.worklet.port.postMessage({ type: "clearInterrupted" }), s.output.worklet.port.postMessage({ type: "buffer", buffer: re(i) });
    }, this.fadeOutAudio = async function() {
      s.updateMode("listening"), s.output.worklet.port.postMessage({ type: "interrupt" }), s.output.gain.gain.exponentialRampToValueAtTime(1e-4, s.output.context.currentTime + 2), setTimeout(() => {
        s.output.gain.gain.value = s.volume, s.output.worklet.port.postMessage({ type: "clearInterrupted" });
      }, 2e3);
    }, this.onError = (i, a) => {
      console.error(i, a), this.options.onError(i, a);
    }, this.calculateVolume = (i) => {
      if (i.length === 0) return 0;
      let a = 0;
      for (let n = 0; n < i.length; n++) a += i[n] / 255;
      return a /= i.length, a < 0 ? 0 : a > 1 ? 1 : a;
    }, this.getId = () => this.connection.conversationId, this.setVolume = ({ volume: i }) => {
      this.volume = i;
    }, this.getInputByteFrequencyData = () => (this.inputFrequencyData != null || (this.inputFrequencyData = new Uint8Array(this.input.analyser.frequencyBinCount)), this.input.analyser.getByteFrequencyData(this.inputFrequencyData), this.inputFrequencyData), this.getOutputByteFrequencyData = () => (this.outputFrequencyData != null || (this.outputFrequencyData = new Uint8Array(this.output.analyser.frequencyBinCount)), this.output.analyser.getByteFrequencyData(this.outputFrequencyData), this.outputFrequencyData), this.getInputVolume = () => this.calculateVolume(this.getInputByteFrequencyData()), this.getOutputVolume = () => this.calculateVolume(this.getOutputByteFrequencyData()), this.options = e, this.connection = t, this.input = o, this.output = l, this.options.onConnect({ conversationId: t.conversationId }), this.connection.socket.addEventListener("message", (i) => {
      this.onEvent(i);
    }), this.connection.socket.addEventListener("error", (i) => {
      this.updateStatus("disconnected"), this.onError("Socket error", i);
    }), this.connection.socket.addEventListener("close", () => {
      this.updateStatus("disconnected"), this.options.onDisconnect();
    }), this.input.worklet.port.onmessage = this.onInputWorkletMessage, this.output.worklet.port.onmessage = this.onOutputWorkletMessage, this.updateStatus("connected");
  }
}
function T() {
  return T = Object.assign ? Object.assign.bind() : function(r) {
    for (var e = 1; e < arguments.length; e++) {
      var t = arguments[e];
      for (var o in t) ({}).hasOwnProperty.call(t, o) && (r[o] = t[o]);
    }
    return r;
  }, T.apply(null, arguments);
}
function me(r) {
  const e = O(null), t = O(null), [o, l] = g("disconnected"), [s, i] = g("listening");
  return C(() => () => {
    var a;
    (a = e.current) == null || a.endSession();
  }, []), { startSession: async (a) => {
    if (e.current) return e.current.getId();
    if (t.current) return (await t.current).getId();
    try {
      return t.current = F.startSession(T({}, r ?? {}, a ?? {}, { onModeChange: ({ mode: n }) => {
        i(n);
      }, onStatusChange: ({ status: n }) => {
        l(n);
      } })), e.current = await t.current, e.current.getId();
    } finally {
      t.current = null;
    }
  }, endSession: async () => {
    const a = e.current;
    e.current = null, await (a == null ? void 0 : a.endSession());
  }, setVolume: ({ volume: a }) => {
    var n;
    (n = e.current) == null || n.setVolume({ volume: a });
  }, getInputByteFrequencyData: () => {
    var a;
    return (a = e.current) == null ? void 0 : a.getInputByteFrequencyData();
  }, getOutputByteFrequencyData: () => {
    var a;
    return (a = e.current) == null ? void 0 : a.getOutputByteFrequencyData();
  }, getInputVolume: () => {
    var a, n;
    return (a = (n = e.current) == null ? void 0 : n.getInputVolume()) != null ? a : 0;
  }, getOutputVolume: () => {
    var a, n;
    return (a = (n = e.current) == null ? void 0 : n.getOutputVolume()) != null ? a : 0;
  }, status: o, isSpeaking: s === "speaking" };
}
var ge = {
  cm: !0,
  mm: !0,
  in: !0,
  px: !0,
  pt: !0,
  pc: !0,
  em: !0,
  ex: !0,
  ch: !0,
  rem: !0,
  vw: !0,
  vh: !0,
  vmin: !0,
  vmax: !0,
  "%": !0
};
function ve(r) {
  if (typeof r == "number")
    return {
      value: r,
      unit: "px"
    };
  var e, t = (r.match(/^[0-9.]*/) || "").toString();
  t.includes(".") ? e = parseFloat(t) : e = parseInt(t, 10);
  var o = (r.match(/[^0-9]*$/) || "").toString();
  return ge[o] ? {
    value: e,
    unit: o
  } : (console.warn("React Spinners: ".concat(r, " is not a valid css value. Defaulting to ").concat(e, "px.")), {
    value: e,
    unit: "px"
  });
}
function P(r) {
  var e = ve(r);
  return "".concat(e.value).concat(e.unit);
}
var ye = function(r, e, t) {
  var o = "react-spinners-".concat(r, "-").concat(t);
  if (typeof window > "u" || !window.document)
    return o;
  var l = document.createElement("style");
  document.head.appendChild(l);
  var s = l.sheet, i = `
    @keyframes `.concat(o, ` {
      `).concat(e, `
    }
  `);
  return s && s.insertRule(i, 0), o;
}, S = function() {
  return S = Object.assign || function(r) {
    for (var e, t = 1, o = arguments.length; t < o; t++) {
      e = arguments[t];
      for (var l in e) Object.prototype.hasOwnProperty.call(e, l) && (r[l] = e[l]);
    }
    return r;
  }, S.apply(this, arguments);
}, _e = function(r, e) {
  var t = {};
  for (var o in r) Object.prototype.hasOwnProperty.call(r, o) && e.indexOf(o) < 0 && (t[o] = r[o]);
  if (r != null && typeof Object.getOwnPropertySymbols == "function")
    for (var l = 0, o = Object.getOwnPropertySymbols(r); l < o.length; l++)
      e.indexOf(o[l]) < 0 && Object.prototype.propertyIsEnumerable.call(r, o[l]) && (t[o[l]] = r[o[l]]);
  return t;
}, we = ye("ClipLoader", "0% {transform: rotate(0deg) scale(1)} 50% {transform: rotate(180deg) scale(0.8)} 100% {transform: rotate(360deg) scale(1)}", "clip");
function be(r) {
  var e = r.loading, t = e === void 0 ? !0 : e, o = r.color, l = o === void 0 ? "#000000" : o, s = r.speedMultiplier, i = s === void 0 ? 1 : s, a = r.cssOverride, n = a === void 0 ? {} : a, u = r.size, d = u === void 0 ? 35 : u, v = _e(r, ["loading", "color", "speedMultiplier", "cssOverride", "size"]), f = S({ background: "transparent !important", width: P(d), height: P(d), borderRadius: "100%", border: "2px solid", borderTopColor: l, borderBottomColor: "transparent", borderLeftColor: l, borderRightColor: l, display: "inline-block", animation: "".concat(we, " ").concat(0.75 / i, "s 0s infinite linear"), animationFillMode: "both" }, n);
  return t ? K.createElement("span", S({ style: f }, v)) : null;
}
const Ce = () => {
  const [r, e] = g(!1), t = O(null), [o, l] = g(!1), [s, i] = g(!0), [a, n] = g(!1), [u, d] = g(!1), [v, f] = g({}), [y, m] = g({}), [_, w] = g("blink"), [x, R] = g(!1), [M, L] = g(!1), h = me({
    onConnect: () => console.log("Connected"),
    onDisconnect: () => console.log("Disconnected"),
    onMessage: (p) => console.log("Message:", p),
    onError: (p) => console.error("Error:", p)
  }), V = () => e((p) => !p), H = j(async () => {
    if (M)
      try {
        await h.startSession({ agentId: "wRHOMzkdlIaagOghaLt8" }), L(!1);
      } catch (p) {
        console.error("Error al reconectar entrada de audio:", p);
      }
    else
      h.isSpeaking ? await (async () => {
        for (; h.isSpeaking; )
          await new Promise((E) => setTimeout(E, 100));
        await h.endSession();
      })() : await h.endSession(), L(!0);
  }, [M, h]), $ = j(async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: !0 }), await h.startSession({ agentId: "wRHOMzkdlIaagOghaLt8" }), l(!0);
    } catch (p) {
      console.error("Failed to start conversation:", p);
    }
  }, [h]), J = j(async () => {
    await h.endSession(), l(!1), n(!1), d(!1);
  }, [h]);
  C(() => {
    i(!0);
    const p = setTimeout(() => i(!1), 2e3);
    return () => clearTimeout(p);
  }, []), C(() => {
    const p = setInterval(() => {
      !u && !a && (_ === "blink" ? (f({ transform: "scaleY(0.1)", transition: "transform 0.3s" }), m({ transform: "scaleY(0.1)", transition: "transform 0.3s" }), setTimeout(() => {
        f({ transform: "scaleY(1)", transition: "transform 0.3s" }), m({ transform: "scaleY(1)", transition: "transform 0.3s" });
      }, 300), w("wink")) : (f({ transform: "scaleY(0.1)", transition: "transform 0.3s" }), m({ transform: "scaleY(1)", transition: "transform 0.3s" }), setTimeout(() => {
        f({ transform: "scaleY(1)", transition: "transform 0.3s" }), m({ transform: "scaleY(1)", transition: "transform 0.3s" });
      }, 300), w("blink")));
    }, Math.random() * 5e3 + 2e3);
    return () => clearInterval(p);
  }, [u, a, _]), C(() => {
    h.isSpeaking ? (d(!0), n(!1)) : (d(!1), n(!0));
  }, [h.isSpeaking]), C(() => {
    (h.status === "disconnected" || h.status === "disconnecting") && (d(!1), n(!1));
  }, [h.status]);
  const Y = async () => $(), G = () => J();
  return /* @__PURE__ */ c.jsxs("div", { className: "chatWidgetContainer", children: [
    /* @__PURE__ */ c.jsx("button", { className: "chatToggle", onClick: V, "aria-label": "Toggle chat", children: /* @__PURE__ */ c.jsx("div", { className: "waveform", children: [...Array(6)].map((p, E) => /* @__PURE__ */ c.jsx("div", { className: "bar" }, E)) }) }),
    r && /* @__PURE__ */ c.jsxs("div", { ref: t, className: "chatWindow", children: [
      /* @__PURE__ */ c.jsx("div", { className: "chatHeader", children: /* @__PURE__ */ c.jsxs("div", { className: "headerContent", children: [
        /* @__PURE__ */ c.jsx("h2", { children: "Bottas" }),
        /* @__PURE__ */ c.jsx("button", { className: "closeBtn", onClick: V, "aria-label": "Close chat", children: "×" })
      ] }) }),
      /* @__PURE__ */ c.jsxs("div", { className: "chatContent", children: [
        s && /* @__PURE__ */ c.jsx("div", { className: "loading" }),
        /* @__PURE__ */ c.jsxs("div", { className: `faceContainer ${s ? "" : "loaded"}`, children: [
          /* @__PURE__ */ c.jsxs("div", { className: "eyesContainer", children: [
            /* @__PURE__ */ c.jsx("div", { className: "eye", style: { ...v } }),
            x && /* @__PURE__ */ c.jsx("div", { className: "spinner", children: /* @__PURE__ */ c.jsx(be, { color: "#FFFFFF", size: 16 }) }),
            /* @__PURE__ */ c.jsx("div", { className: "eye", style: { ...y } })
          ] }),
          /* @__PURE__ */ c.jsxs("div", { className: "mustacheBowtieContainer", children: [
            /* @__PURE__ */ c.jsx("div", { className: `mustache ${u ? "mustacheTalking" : ""}` }),
            /* @__PURE__ */ c.jsx("div", { className: `bowtie ${u ? "" : "bowtieWiggle"}` })
          ] })
        ] }),
        /* @__PURE__ */ c.jsx("div", { className: "buttonContainer", children: o ? /* @__PURE__ */ c.jsxs(c.Fragment, { children: [
          /* @__PURE__ */ c.jsxs("button", { className: "togglePanel", onClick: G, children: [
            " ",
            /* @__PURE__ */ c.jsx("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 384 512", width: "18", height: "18", children: /* @__PURE__ */ c.jsx("path", { d: "M192 0C139 0 96 43 96 96V256c0 53 43 96 96 96s96-43 96-96V96c0-53-43-96-96-96zM64 216c0-13.3-10.7-24-24-24s-24 10.7-24 24v40c0 89.1 66.2 162.7 152 174.4V464H120c-13.3 0-24 10.7-24 24s10.7 24 24 24h144c13.3 0 24-10.7 24-24s-10.7-24-24-24H216V430.4c85.8-11.7 152-85.3 152-174.4V216c0-13.3-10.7-24-24-24s-24 10.7-24 24v40c0 70.7-57.3 128-128 128s-128-57.3-128-128V216z" }) })
          ] }),
          /* @__PURE__ */ c.jsx("button", { className: "togglePanel", onClick: H, children: /* @__PURE__ */ c.jsx("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 512 512", width: "18", height: "18", children: /* @__PURE__ */ c.jsx(
            "path",
            {
              d: M ? "M256 0C220.65 0 192 28.65 192 64V448C192 483.35 220.65 512 256 512C291.35 512 320 483.35 320 448V64C320 28.65 291.35 0 256 0zM0 192C0 156.65 28.65 128 64 128H128L192 192V320L128 384H64C28.65 384 0 355.35 0 320V192zM448 192V320C448 355.35 476.65 384 512 384C547.35 384 576 355.35 576 320V192C576 156.65 547.35 128 512 128C476.65 128 448 156.65 448 192z" : "M215.03 71.1L151.02 0H32C14.33 0 0 14.33 0 32V352C0 369.7 14.33 384 32 384H151.02L215.03 455.9C227.4 470.3 247.8 480 268.5 480C309.1 480 352 435.8 352 392V88C352 44.2 309.1 0 268.5 0C247.8 0 227.4 9.7 215.03 71.1zM48 288V96H152L200 151.1V232L152 287.1H48z"
            }
          ) }) })
        ] }) : /* @__PURE__ */ c.jsx("button", { className: "togglePanel", onClick: Y, children: /* @__PURE__ */ c.jsx("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 384 512", width: "25", height: "25", children: /* @__PURE__ */ c.jsx("path", { d: "M192 0C139 0 96 43 96 96V256c0 53 43 96 96 96s96-43 96-96V96c0-53-43-96-96-96zM64 216c0-13.3-10.7-24-24-24s-24 10.7-24 24v40c0 89.1 66.2 162.7 152 174.4V464H120c-13.3 0-24 10.7-24 24s10.7 24 24 24h144c13.3 0 24-10.7 24-24s-10.7-24-24-24H216V430.4c85.8-11.7 152-85.3 152-174.4V216c0-13.3-10.7-24-24-24s-24 10.7-24 24v40c0 70.7-57.3 128-128 128s-128-57.3-128-128V216z" }) }) }) })
      ] })
    ] })
  ] });
};
class xe extends HTMLElement {
  connectedCallback() {
    const e = document.createElement("div");
    this.appendChild(e), oe.createRoot(e).render(/* @__PURE__ */ c.jsx(Ce, {}));
  }
}
customElements.get("bottas-chat-widget") || customElements.define("bottas-chat-widget", xe);
