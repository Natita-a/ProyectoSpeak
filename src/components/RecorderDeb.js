import React, { useEffect, useRef, useState } from "react";
import { FaMicrophone, FaMicrophoneSlash } from "react-icons/fa";
import { useLocation } from "react-router-dom";
import '../styles/RecorderDeb.css';
import LoaderMicrofonoOndas from "./Loader";

export default function RecorderDeb() {
  const location = useLocation();
  const practicaId = location.state?.practica_hecha_id || 1;
  const tiempoInicialMinutos = location.state?.tiempo || 5;

  const localVideoRef = useRef(null);
  const localStreamRef = useRef(null);
  const wsRef = useRef(null);
  const intervalId = useRef(null);
  const remoteVideoRefs = useRef({});
  const connectionsRef = useRef({});
  const pendingCandidatesRef = useRef({});

  const [peers, setPeersState] = useState({});
  const peersRef = useRef(peers);
  const updatePeers = (updater) => {
    setPeersState(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      peersRef.current = next;
      return next;
    });
  };

  const [time, setTime] = useState(tiempoInicialMinutos * 60);
  const [cargando, setCargando] = useState(false);
  const [mensajeGuardado, setMensajeGuardado] = useState('');
  const [arePeersMuted, setArePeersMuted] = useState(true); // peers muteados inicialmente

  /** --- MEDIA STREAM --- */
  const initializeMediaStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true }
      });
      localStreamRef.current = stream;
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;

      // Loopback: mostrar tu propio video como remoto
      handleRemoteTrack("Tú", new MediaStream(stream.getTracks()), null);

      console.log("✅ MediaStream inicializado:", stream.getTracks().length);
      return stream;
    } catch (err) {
      console.error(err);
      setMensajeGuardado("Error al acceder a la cámara/micrófono.");
      return null;
    }
  };

  /** --- REMOTE TRACK --- */
  const handleRemoteTrack = (peerUsername, stream, peerConnection) => {
    updatePeers(prev => ({
      ...prev,
      [peerUsername]: { ...prev[peerUsername], remoteStream: stream, connection: peerConnection, muted: true }
    }));
    if (peerConnection) connectionsRef.current[peerUsername] = peerConnection;

    const videoEl = remoteVideoRefs.current[peerUsername];
    if (videoEl && stream) {
      try {
        videoEl.srcObject = stream;
        videoEl.onloadedmetadata = () => videoEl.play().catch(() => {});
        setTimeout(() => videoEl.play().catch(() => {}), 200);
      } catch (err) { console.warn(err); }
    }
  };

  const formatTime = (seconds) => {
    const h = String(Math.floor(seconds / 3600)).padStart(2,'0');
    const m = String(Math.floor((seconds % 3600)/60)).padStart(2,'0');
    const s = String(seconds % 60).padStart(2,'0');
    return `${h}:${m}:${s}`;
  };

  /** --- WebSocket & WebRTC --- */
  useEffect(() => {
    const start = async () => {
      const stream = await initializeMediaStream();
      if (!stream) return;

      const token = localStorage.getItem('access_token');
      if (!token) return setMensajeGuardado("Error de autenticación.");

      const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
      const wsUrl = `${protocol}://localhost:8000/ws/speakup/${practicaId}/?token=${encodeURIComponent(token)}`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log("✅ WS conectado");
        ws.send(JSON.stringify({ action: 'webrtc_ready' }));
      };

      ws.onmessage = async (event) => {
        try {
          const data = JSON.parse(event.data);
          const { action, sender_channel, sdp, candidate } = data;

          if (action === 'webrtc_peer_ready') {
            await createOffer(sender_channel);
          } else if (action === 'webrtc_offer') {
            await createAnswer(sender_channel, sdp);
          } else if (action === 'webrtc_answer') {
            const peer = peersRef.current[sender_channel]?.connection;
            if (peer && peer.signalingState === 'have-local-offer') {
              await peer.setRemoteDescription(new RTCSessionDescription(sdp));
              processPendingCandidates(peer, sender_channel);
            }
          } else if (action === 'webrtc_ice_candidate') {
            await handleIceCandidate(sender_channel, candidate);
          }
        } catch(err) { console.error(err); }
      };
    };
    start();

    return () => {
      if (wsRef.current) wsRef.current.close();
      if (localStreamRef.current) localStreamRef.current.getTracks().forEach(t => t.stop());
      Object.values(connectionsRef.current).forEach(pc => pc.close());
      clearInterval(intervalId.current);
    };
  }, [practicaId]);

  /** --- PEER CONNECTION --- */
  const createPeerConnection = (peerUsername) => {
    const pc = new RTCPeerConnection({ iceServers:[{urls:"stun:stun.l.google.com:19302"}] });
    if (!pendingCandidatesRef.current[peerUsername]) pendingCandidatesRef.current[peerUsername] = [];
    localStreamRef.current.getTracks().forEach(track => pc.addTrack(track, localStreamRef.current));

    pc.ontrack = (e) => handleRemoteTrack(peerUsername, e.streams[0], pc);
    pc.onicecandidate = (e) => {
      if (e.candidate && wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ action:'webrtc_ice_candidate', message:{candidate:e.candidate, target_channel:peerUsername}}));
      }
    };
    return pc;
  };

  const createOffer = async (peerUsername) => {
    if (peersRef.current[peerUsername]?.connection) return;
    const pc = createPeerConnection(peerUsername);
    const dc = pc.createDataChannel("chat");
    dc.onopen = () => console.log("DataChannel abierto");
    dc.onmessage = e => console.log("Mensaje:", e.data);

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    wsRef.current.send(JSON.stringify({ action:'webrtc_offer', message:{sdp:offer, target_channel:peerUsername}}));
    updatePeers(prev => ({ ...prev, [peerUsername]: { connection: pc, channel: dc, hasRemoteDescription:false, muted:true } }));
  };

  const createAnswer = async (peerUsername, offerSdp) => {
    const pc = createPeerConnection(peerUsername);
    pc.ondatachannel = e => {
      const dc = e.channel;
      dc.onopen = () => console.log("DataChannel abierto (answer)");
      dc.onmessage = e => console.log("Mensaje:", e.data);
      updatePeers(prev => ({ ...prev, [peerUsername]: { ...prev[peerUsername], connection: pc, channel: dc, hasRemoteDescription:true, muted:true } }));
    };

    await pc.setRemoteDescription(new RTCSessionDescription(offerSdp));
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    wsRef.current.send(JSON.stringify({ action:'webrtc_answer', message:{sdp:answer, target_channel:peerUsername}}));
    updatePeers(prev => ({ ...prev, [peerUsername]: { ...prev[peerUsername], connection: pc, hasRemoteDescription:true, muted:true } }));
    processPendingCandidates(pc, peerUsername);
  };

  const handleIceCandidate = async (peerUsername, candidate) => {
    const pc = peersRef.current[peerUsername]?.connection;
    if (!pc?.remoteDescription?.type) {
      pendingCandidatesRef.current[peerUsername].push(candidate);
    } else {
      await pc.addIceCandidate(new RTCIceCandidate(candidate));
    }
  };

  const processPendingCandidates = async (pc, peerUsername) => {
    const pending = pendingCandidatesRef.current[peerUsername] || [];
    for (const c of pending) await pc.addIceCandidate(new RTCIceCandidate(c));
    pendingCandidatesRef.current[peerUsername] = [];
  };

  /** --- TEMPORIZADOR --- */
  useEffect(() => {
    intervalId.current = setInterval(() => setTime(t => t > 0 ? t-1 : 0), 1000);
    return () => clearInterval(intervalId.current);
  }, []);

  /** --- MUTE PEERS --- */
  const toggleMutePeers = () => {
    const newMuteState = !arePeersMuted;
    setArePeersMuted(newMuteState);

    Object.keys(peersRef.current).forEach(peerUsername => {
      const peer = peersRef.current[peerUsername];
      if (peer?.remoteStream) {
        peer.remoteStream.getAudioTracks().forEach(track => track.enabled = !newMuteState);
      }
    });

    updatePeers(prev => {
      const updated = { ...prev };
      Object.keys(updated).forEach(key => {
        if (updated[key]) {
          updated[key] = { ...updated[key], muted: newMuteState };
        }
      });
      return updated;
    });
  };

  if (cargando) return <LoaderMicrofonoOndas loaderOpen={true} />;

  return (
    <div className="recorder-container">
      <div className="top-panel">
        {/* Video local */}
        <div style={{position:'relative'}}>
          <video ref={localVideoRef} autoPlay muted className="top-panel-video local-video"/>
        </div>

        {/* Mostrar máximo 2 peers */}
        {Object.keys(peers).slice(0, 1).map(p => (
          <div key={p} style={{position:'relative'}}>
            <video ref={el => remoteVideoRefs.current[p]=el} autoPlay className="top-panel-video remote-video"/>
          </div>
        ))}
      </div>

      <div className="bottom-panel">
        <h2 className="timer">{formatTime(time)}</h2>
        <div className="button-container">
          {/* Botón verde: mute/desmute solo peers */}
          <button
            onClick={toggleMutePeers}
            className="mute-button"
            title={arePeersMuted ? "Activar audio de peers" : "Silenciar audio de peers"}
          >
            {arePeersMuted ? <FaMicrophoneSlash /> : <FaMicrophone />}
          </button>
        </div>

        {mensajeGuardado && (
          <div style={{ marginTop: '10px', color: 'red' }}>
            {mensajeGuardado}
          </div>
        )}
      </div>
    </div>
  );
}
