(function(u,_){typeof exports=="object"&&typeof module<"u"?_(require("react"),require("react-dom")):typeof define=="function"&&define.amd?define(["react","react-dom"],_):(u=typeof globalThis<"u"?globalThis:u||self,_(u.React,u.ReactDOM))})(this,function(u,_){"use strict";function z(a){const e=Object.create(null,{[Symbol.toStringTag]:{value:"Module"}});if(a){for(const t in a)if(t!=="default"){const s=Object.getOwnPropertyDescriptor(a,t);Object.defineProperty(e,t,s.get?s:{enumerable:!0,get:()=>a[t]})}}return e.default=a,Object.freeze(e)}const U=z(u);function H(a){return a&&a.__esModule&&Object.prototype.hasOwnProperty.call(a,"default")?a.default:a}var M={exports:{}},w={};/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var R;function $(){if(R)return w;R=1;var a=u,e=Symbol.for("react.element"),t=Symbol.for("react.fragment"),s=Object.prototype.hasOwnProperty,l=a.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,o={key:!0,ref:!0,__self:!0,__source:!0};function i(r,n,d){var h,v={},m=null,y=null;d!==void 0&&(m=""+d),n.key!==void 0&&(m=""+n.key),n.ref!==void 0&&(y=n.ref);for(h in n)s.call(n,h)&&!o.hasOwnProperty(h)&&(v[h]=n[h]);if(r&&r.defaultProps)for(h in n=r.defaultProps,n)v[h]===void 0&&(v[h]=n[h]);return{$$typeof:e,type:r,key:m,ref:y,props:v,_owner:l.current}}return w.Fragment=t,w.jsx=i,w.jsxs=i,w}var F;function J(){return F||(F=1,M.exports=$()),M.exports}var c=J(),k={},L;function Y(){if(L)return k;L=1;var a=_;return k.createRoot=a.createRoot,k.hydrateRoot=a.hydrateRoot,k}var G=Y();const K=H(G);function E(){return E=Object.assign?Object.assign.bind():function(a){for(var e=1;e<arguments.length;e++){var t=arguments[e];for(var s in t)({}).hasOwnProperty.call(t,s)&&(a[s]=t[s])}return a},E.apply(null,arguments)}function Q(a){const e=new Uint8Array(a);return window.btoa(String.fromCharCode(...e))}function X(a){const e=window.atob(a),t=e.length,s=new Uint8Array(t);for(let l=0;l<t;l++)s[l]=e.charCodeAt(l);return s.buffer}const Z=new Blob([`
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
  `],{type:"application/javascript"}),ee=URL.createObjectURL(Z);class O{static async create(e){let t=null,s=null;try{const i=navigator.mediaDevices.getSupportedConstraints().sampleRate;t=new window.AudioContext(i?{sampleRate:e}:{});const r=t.createAnalyser();i||await t.audioWorklet.addModule("https://cdn.jsdelivr.net/npm/@alexanderolsen/libsamplerate-js@2.1.2/dist/libsamplerate.worklet.js"),await t.audioWorklet.addModule(ee),s=await navigator.mediaDevices.getUserMedia({audio:{sampleRate:{ideal:e},echoCancellation:{ideal:!0},noiseSuppression:{ideal:!0}}});const n=t.createMediaStreamSource(s),d=new AudioWorkletNode(t,"raw-audio-processor");return n.connect(r),r.connect(d),new O(t,r,d,s)}catch(i){var l,o;throw(l=s)==null||l.getTracks().forEach(r=>r.stop()),(o=t)==null||o.close(),i}}constructor(e,t,s,l){this.context=void 0,this.analyser=void 0,this.worklet=void 0,this.inputStream=void 0,this.context=e,this.analyser=t,this.worklet=s,this.inputStream=l}async close(){this.inputStream.getTracks().forEach(e=>e.stop()),await this.context.close()}}const te=new Blob([`
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
    `],{type:"application/javascript"}),ne=URL.createObjectURL(te);let se=class q{static async create(e){let t=null;try{t=new AudioContext({sampleRate:e});const l=t.createAnalyser(),o=t.createGain();o.connect(l),l.connect(t.destination),await t.audioWorklet.addModule(ne);const i=new AudioWorkletNode(t,"audio-concat-processor");return i.connect(o),new q(t,l,o,i)}catch(l){var s;throw(s=t)==null||s.close(),l}}constructor(e,t,s,l){this.context=void 0,this.analyser=void 0,this.gain=void 0,this.worklet=void 0,this.context=e,this.analyser=t,this.gain=s,this.worklet=l}async close(){await this.context.close()}};function V(a){return!!a.type}let oe=class W{static async create(e){let t=null;try{var s;const o=(s=e.origin)!=null?s:"wss://api.elevenlabs.io",i=e.signedUrl?e.signedUrl:o+"/v1/convai/conversation?agent_id="+e.agentId,r=["convai"];e.authorization&&r.push(`bearer.${e.authorization}`),t=new WebSocket(i,r);const n=await new Promise((v,m)=>{t.addEventListener("open",()=>{var y;const g={type:"conversation_initiation_client_data"};var b,C,S,I;e.overrides&&(g.conversation_config_override={agent:{prompt:(b=e.overrides.agent)==null?void 0:b.prompt,first_message:(C=e.overrides.agent)==null?void 0:C.firstMessage,language:(S=e.overrides.agent)==null?void 0:S.language},tts:{voice_id:(I=e.overrides.tts)==null?void 0:I.voiceId}}),e.customLlmExtraBody&&(g.custom_llm_extra_body=e.customLlmExtraBody),(y=t)==null||y.send(JSON.stringify(g))},{once:!0}),t.addEventListener("error",m),t.addEventListener("close",m),t.addEventListener("message",y=>{const g=JSON.parse(y.data);V(g)&&(g.type==="conversation_initiation_metadata"?v(g.conversation_initiation_metadata_event):console.warn("First received message is not conversation metadata."))},{once:!0})}),d=n.conversation_id,h=parseInt(n.agent_output_audio_format.replace("pcm_",""));return new W(t,d,h)}catch(o){var l;throw(l=t)==null||l.close(),o}}constructor(e,t,s){this.socket=void 0,this.conversationId=void 0,this.sampleRate=void 0,this.socket=e,this.conversationId=t,this.sampleRate=s}close(){this.socket.close()}sendMessage(e){this.socket.send(JSON.stringify(e))}};const ae={clientTools:{}},re={onConnect:()=>{},onDebug:()=>{},onDisconnect:()=>{},onError:()=>{},onMessage:()=>{},onModeChange:()=>{},onStatusChange:()=>{}};class j{static async startSession(e){const t=E({},ae,re,e);t.onStatusChange({status:"connecting"});let s=null,l=null,o=null;try{return s=await O.create(16e3),l=await oe.create(e),o=await se.create(l.sampleRate),new j(t,l,s,o)}catch(d){var i,r,n;throw t.onStatusChange({status:"disconnected"}),(i=l)==null||i.close(),await((r=s)==null?void 0:r.close()),await((n=o)==null?void 0:n.close()),d}}constructor(e,t,s,l){var o=this;this.options=void 0,this.connection=void 0,this.input=void 0,this.output=void 0,this.lastInterruptTimestamp=0,this.mode="listening",this.status="connecting",this.inputFrequencyData=void 0,this.outputFrequencyData=void 0,this.volume=1,this.endSession=async function(){o.status==="connected"&&(o.updateStatus("disconnecting"),o.connection.close(),await o.input.close(),await o.output.close(),o.updateStatus("disconnected"))},this.updateMode=i=>{i!==this.mode&&(this.mode=i,this.options.onModeChange({mode:i}))},this.updateStatus=i=>{i!==this.status&&(this.status=i,this.options.onStatusChange({status:i}))},this.onEvent=async function(i){try{const n=JSON.parse(i.data);if(!V(n))return;switch(n.type){case"interruption":n.interruption_event&&(o.lastInterruptTimestamp=n.interruption_event.event_id),o.fadeOutAudio();break;case"agent_response":o.options.onMessage({source:"ai",message:n.agent_response_event.agent_response});break;case"user_transcript":o.options.onMessage({source:"user",message:n.user_transcription_event.user_transcript});break;case"internal_tentative_agent_response":o.options.onDebug({type:"tentative_agent_response",response:n.tentative_agent_response_internal_event.tentative_agent_response});break;case"client_tool_call":if(o.options.clientTools.hasOwnProperty(n.client_tool_call.tool_name)){try{var r;const d=(r=await o.options.clientTools[n.client_tool_call.tool_name](n.client_tool_call.parameters))!=null?r:"Client tool execution successful.";o.connection.sendMessage({type:"client_tool_result",tool_call_id:n.client_tool_call.tool_call_id,result:d,is_error:!1})}catch(d){o.onError("Client tool execution failed with following error: "+(d==null?void 0:d.message),{clientToolName:n.client_tool_call.tool_name}),o.connection.sendMessage({type:"client_tool_result",tool_call_id:n.client_tool_call.tool_call_id,result:"Client tool execution failed: "+(d==null?void 0:d.message),is_error:!0})}break}if(o.options.onUnhandledClientToolCall){o.options.onUnhandledClientToolCall(n.client_tool_call);break}o.onError(`Client tool with name ${n.client_tool_call.tool_name} is not defined on client`,{clientToolName:n.client_tool_call.tool_name}),o.connection.sendMessage({type:"client_tool_result",tool_call_id:n.client_tool_call.tool_call_id,result:`Client tool with name ${n.client_tool_call.tool_name} is not defined on client`,is_error:!0});break;case"audio":o.lastInterruptTimestamp<=n.audio_event.event_id&&(o.addAudioBase64Chunk(n.audio_event.audio_base_64),o.updateMode("speaking"));break;case"ping":o.connection.sendMessage({type:"pong",event_id:n.ping_event.event_id});break;default:o.options.onDebug(n)}}catch{return void o.onError("Failed to parse event data",{event:i})}},this.onInputWorkletMessage=i=>{this.status==="connected"&&this.connection.sendMessage({user_audio_chunk:Q(i.data[0].buffer)})},this.onOutputWorkletMessage=({data:i})=>{i.type==="process"&&this.updateMode(i.finished?"listening":"speaking")},this.addAudioBase64Chunk=async function(i){o.output.gain.gain.value=o.volume,o.output.worklet.port.postMessage({type:"clearInterrupted"}),o.output.worklet.port.postMessage({type:"buffer",buffer:X(i)})},this.fadeOutAudio=async function(){o.updateMode("listening"),o.output.worklet.port.postMessage({type:"interrupt"}),o.output.gain.gain.exponentialRampToValueAtTime(1e-4,o.output.context.currentTime+2),setTimeout(()=>{o.output.gain.gain.value=o.volume,o.output.worklet.port.postMessage({type:"clearInterrupted"})},2e3)},this.onError=(i,r)=>{console.error(i,r),this.options.onError(i,r)},this.calculateVolume=i=>{if(i.length===0)return 0;let r=0;for(let n=0;n<i.length;n++)r+=i[n]/255;return r/=i.length,r<0?0:r>1?1:r},this.getId=()=>this.connection.conversationId,this.setVolume=({volume:i})=>{this.volume=i},this.getInputByteFrequencyData=()=>(this.inputFrequencyData!=null||(this.inputFrequencyData=new Uint8Array(this.input.analyser.frequencyBinCount)),this.input.analyser.getByteFrequencyData(this.inputFrequencyData),this.inputFrequencyData),this.getOutputByteFrequencyData=()=>(this.outputFrequencyData!=null||(this.outputFrequencyData=new Uint8Array(this.output.analyser.frequencyBinCount)),this.output.analyser.getByteFrequencyData(this.outputFrequencyData),this.outputFrequencyData),this.getInputVolume=()=>this.calculateVolume(this.getInputByteFrequencyData()),this.getOutputVolume=()=>this.calculateVolume(this.getOutputByteFrequencyData()),this.options=e,this.connection=t,this.input=s,this.output=l,this.options.onConnect({conversationId:t.conversationId}),this.connection.socket.addEventListener("message",i=>{this.onEvent(i)}),this.connection.socket.addEventListener("error",i=>{this.updateStatus("disconnected"),this.onError("Socket error",i)}),this.connection.socket.addEventListener("close",()=>{this.updateStatus("disconnected"),this.options.onDisconnect()}),this.input.worklet.port.onmessage=this.onInputWorkletMessage,this.output.worklet.port.onmessage=this.onOutputWorkletMessage,this.updateStatus("connected")}}function A(){return A=Object.assign?Object.assign.bind():function(a){for(var e=1;e<arguments.length;e++){var t=arguments[e];for(var s in t)({}).hasOwnProperty.call(t,s)&&(a[s]=t[s])}return a},A.apply(null,arguments)}function ie(a){const e=u.useRef(null),t=u.useRef(null),[s,l]=u.useState("disconnected"),[o,i]=u.useState("listening");return u.useEffect(()=>()=>{var r;(r=e.current)==null||r.endSession()},[]),{startSession:async r=>{if(e.current)return e.current.getId();if(t.current)return(await t.current).getId();try{return t.current=j.startSession(A({},a??{},r??{},{onModeChange:({mode:n})=>{i(n)},onStatusChange:({status:n})=>{l(n)}})),e.current=await t.current,e.current.getId()}finally{t.current=null}},endSession:async()=>{const r=e.current;e.current=null,await(r==null?void 0:r.endSession())},setVolume:({volume:r})=>{var n;(n=e.current)==null||n.setVolume({volume:r})},getInputByteFrequencyData:()=>{var r;return(r=e.current)==null?void 0:r.getInputByteFrequencyData()},getOutputByteFrequencyData:()=>{var r;return(r=e.current)==null?void 0:r.getOutputByteFrequencyData()},getInputVolume:()=>{var r,n;return(r=(n=e.current)==null?void 0:n.getInputVolume())!=null?r:0},getOutputVolume:()=>{var r,n;return(r=(n=e.current)==null?void 0:n.getOutputVolume())!=null?r:0},status:s,isSpeaking:o==="speaking"}}var le={cm:!0,mm:!0,in:!0,px:!0,pt:!0,pc:!0,em:!0,ex:!0,ch:!0,rem:!0,vw:!0,vh:!0,vmin:!0,vmax:!0,"%":!0};function ce(a){if(typeof a=="number")return{value:a,unit:"px"};var e,t=(a.match(/^[0-9.]*/)||"").toString();t.includes(".")?e=parseFloat(t):e=parseInt(t,10);var s=(a.match(/[^0-9]*$/)||"").toString();return le[s]?{value:e,unit:s}:(console.warn("React Spinners: ".concat(a," is not a valid css value. Defaulting to ").concat(e,"px.")),{value:e,unit:"px"})}function N(a){var e=ce(a);return"".concat(e.value).concat(e.unit)}var ue=function(a,e,t){var s="react-spinners-".concat(a,"-").concat(t);if(typeof window>"u"||!window.document)return s;var l=document.createElement("style");document.head.appendChild(l);var o=l.sheet,i=`
    @keyframes `.concat(s,` {
      `).concat(e,`
    }
  `);return o&&o.insertRule(i,0),s},x=function(){return x=Object.assign||function(a){for(var e,t=1,s=arguments.length;t<s;t++){e=arguments[t];for(var l in e)Object.prototype.hasOwnProperty.call(e,l)&&(a[l]=e[l])}return a},x.apply(this,arguments)},de=function(a,e){var t={};for(var s in a)Object.prototype.hasOwnProperty.call(a,s)&&e.indexOf(s)<0&&(t[s]=a[s]);if(a!=null&&typeof Object.getOwnPropertySymbols=="function")for(var l=0,s=Object.getOwnPropertySymbols(a);l<s.length;l++)e.indexOf(s[l])<0&&Object.prototype.propertyIsEnumerable.call(a,s[l])&&(t[s[l]]=a[s[l]]);return t},he=ue("ClipLoader","0% {transform: rotate(0deg) scale(1)} 50% {transform: rotate(180deg) scale(0.8)} 100% {transform: rotate(360deg) scale(1)}","clip");function pe(a){var e=a.loading,t=e===void 0?!0:e,s=a.color,l=s===void 0?"#000000":s,o=a.speedMultiplier,i=o===void 0?1:o,r=a.cssOverride,n=r===void 0?{}:r,d=a.size,h=d===void 0?35:d,v=de(a,["loading","color","speedMultiplier","cssOverride","size"]),m=x({background:"transparent !important",width:N(h),height:N(h),borderRadius:"100%",border:"2px solid",borderTopColor:l,borderBottomColor:"transparent",borderLeftColor:l,borderRightColor:l,display:"inline-block",animation:"".concat(he," ").concat(.75/i,"s 0s infinite linear"),animationFillMode:"both"},n);return t?U.createElement("span",x({style:m},v)):null}const fe=()=>{const[a,e]=u.useState(!1),t=u.useRef(null),[s,l]=u.useState(!1),[o,i]=u.useState(!0),[r,n]=u.useState(!1),[d,h]=u.useState(!1),[v,m]=u.useState({}),[y,g]=u.useState({}),[b,C]=u.useState("blink"),[S,I]=u.useState(!1),[T,B]=u.useState(!1),p=ie({onConnect:()=>console.log("Connected"),onDisconnect:()=>console.log("Disconnected"),onMessage:f=>console.log("Message:",f),onError:f=>console.error("Error:",f)}),P=()=>e(f=>!f),ge=u.useCallback(async()=>{if(T)try{await p.startSession({agentId:"wRHOMzkdlIaagOghaLt8"}),B(!1)}catch(f){console.error("Error al reconectar entrada de audio:",f)}else p.isSpeaking?await(async()=>{for(;p.isSpeaking;)await new Promise(D=>setTimeout(D,100));await p.endSession()})():await p.endSession(),B(!0)},[T,p]),ve=u.useCallback(async()=>{try{await navigator.mediaDevices.getUserMedia({audio:!0}),await p.startSession({agentId:"wRHOMzkdlIaagOghaLt8"}),l(!0)}catch(f){console.error("Failed to start conversation:",f)}},[p]),ye=u.useCallback(async()=>{await p.endSession(),l(!1),n(!1),h(!1)},[p]);u.useEffect(()=>{i(!0);const f=setTimeout(()=>i(!1),2e3);return()=>clearTimeout(f)},[]),u.useEffect(()=>{const f=setInterval(()=>{!d&&!r&&(b==="blink"?(m({transform:"scaleY(0.1)",transition:"transform 0.3s"}),g({transform:"scaleY(0.1)",transition:"transform 0.3s"}),setTimeout(()=>{m({transform:"scaleY(1)",transition:"transform 0.3s"}),g({transform:"scaleY(1)",transition:"transform 0.3s"})},300),C("wink")):(m({transform:"scaleY(0.1)",transition:"transform 0.3s"}),g({transform:"scaleY(1)",transition:"transform 0.3s"}),setTimeout(()=>{m({transform:"scaleY(1)",transition:"transform 0.3s"}),g({transform:"scaleY(1)",transition:"transform 0.3s"})},300),C("blink")))},Math.random()*5e3+2e3);return()=>clearInterval(f)},[d,r,b]),u.useEffect(()=>{p.isSpeaking?(h(!0),n(!1)):(h(!1),n(!0))},[p.isSpeaking]),u.useEffect(()=>{(p.status==="disconnected"||p.status==="disconnecting")&&(h(!1),n(!1))},[p.status]);const _e=async()=>ve(),we=()=>ye();return c.jsxs("div",{className:"chatWidgetContainer",children:[c.jsx("button",{className:"chatToggle",onClick:P,"aria-label":"Toggle chat",children:c.jsx("div",{className:"waveform",children:[...Array(6)].map((f,D)=>c.jsx("div",{className:"bar"},D))})}),a&&c.jsxs("div",{ref:t,className:"chatWindow",children:[c.jsx("div",{className:"chatHeader",children:c.jsxs("div",{className:"headerContent",children:[c.jsx("h2",{children:"Bottas"}),c.jsx("button",{className:"closeBtn",onClick:P,"aria-label":"Close chat",children:"×"})]})}),c.jsxs("div",{className:"chatContent",children:[o&&c.jsx("div",{className:"loading"}),c.jsxs("div",{className:`faceContainer ${o?"":"loaded"}`,children:[c.jsxs("div",{className:"eyesContainer",children:[c.jsx("div",{className:"eye",style:{...v}}),S&&c.jsx("div",{className:"spinner",children:c.jsx(pe,{color:"#FFFFFF",size:16})}),c.jsx("div",{className:"eye",style:{...y}})]}),c.jsxs("div",{className:"mustacheBowtieContainer",children:[c.jsx("div",{className:`mustache ${d?"mustacheTalking":""}`}),c.jsx("div",{className:`bowtie ${d?"":"bowtieWiggle"}`})]})]}),c.jsx("div",{className:"buttonContainer",children:s?c.jsxs(c.Fragment,{children:[c.jsxs("button",{className:"togglePanel",onClick:we,children:[" ",c.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 384 512",width:"18",height:"18",children:c.jsx("path",{d:"M192 0C139 0 96 43 96 96V256c0 53 43 96 96 96s96-43 96-96V96c0-53-43-96-96-96zM64 216c0-13.3-10.7-24-24-24s-24 10.7-24 24v40c0 89.1 66.2 162.7 152 174.4V464H120c-13.3 0-24 10.7-24 24s10.7 24 24 24h144c13.3 0 24-10.7 24-24s-10.7-24-24-24H216V430.4c85.8-11.7 152-85.3 152-174.4V216c0-13.3-10.7-24-24-24s-24 10.7-24 24v40c0 70.7-57.3 128-128 128s-128-57.3-128-128V216z"})})]}),c.jsx("button",{className:"togglePanel",onClick:ge,children:c.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 512 512",width:"18",height:"18",children:c.jsx("path",{d:T?"M256 0C220.65 0 192 28.65 192 64V448C192 483.35 220.65 512 256 512C291.35 512 320 483.35 320 448V64C320 28.65 291.35 0 256 0zM0 192C0 156.65 28.65 128 64 128H128L192 192V320L128 384H64C28.65 384 0 355.35 0 320V192zM448 192V320C448 355.35 476.65 384 512 384C547.35 384 576 355.35 576 320V192C576 156.65 547.35 128 512 128C476.65 128 448 156.65 448 192z":"M215.03 71.1L151.02 0H32C14.33 0 0 14.33 0 32V352C0 369.7 14.33 384 32 384H151.02L215.03 455.9C227.4 470.3 247.8 480 268.5 480C309.1 480 352 435.8 352 392V88C352 44.2 309.1 0 268.5 0C247.8 0 227.4 9.7 215.03 71.1zM48 288V96H152L200 151.1V232L152 287.1H48z"})})})]}):c.jsx("button",{className:"togglePanel",onClick:_e,children:c.jsx("svg",{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 384 512",width:"25",height:"25",children:c.jsx("path",{d:"M192 0C139 0 96 43 96 96V256c0 53 43 96 96 96s96-43 96-96V96c0-53-43-96-96-96zM64 216c0-13.3-10.7-24-24-24s-24 10.7-24 24v40c0 89.1 66.2 162.7 152 174.4V464H120c-13.3 0-24 10.7-24 24s10.7 24 24 24h144c13.3 0 24-10.7 24-24s-10.7-24-24-24H216V430.4c85.8-11.7 152-85.3 152-174.4V216c0-13.3-10.7-24-24-24s-24 10.7-24 24v40c0 70.7-57.3 128-128 128s-128-57.3-128-128V216z"})})})})]})]})]})};class me extends HTMLElement{connectedCallback(){const e=document.createElement("div");this.appendChild(e),K.createRoot(e).render(c.jsx(fe,{}))}}customElements.get("bottas-chat-widget")||customElements.define("bottas-chat-widget",me)});
