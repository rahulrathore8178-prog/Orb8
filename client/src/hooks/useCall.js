import { useCallback, useEffect, useRef, useState } from "react";

const API = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/$/, "");

// One id per browser TAB (sessionStorage), so two tabs/browsers = two devices.
export function getDeviceId() {
    let id = sessionStorage.getItem("deviceId");
    if (!id) {
        id = "d-" + Math.random().toString(36).slice(2) + Date.now().toString(36);
        sessionStorage.setItem("deviceId", id);
    }
    return id;
}

async function api(path, method = "GET", body) {
    const res = await fetch(`${API}/api/calls${path}`, {
        method,
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        withCredentials: true,
        body: body ? JSON.stringify(body) : undefined,
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json.message || "Request failed");
    return json;
}

const END_TOASTS = {
    timeout: "No answer",
    declined: "Call declined",
    cancelled: "Call cancelled",
    disconnected: "Call disconnected",
    caller_disconnected: "Caller is no longer available",
};

export function useCall({ wsRef, showToast }) {
    const [call, setCall] = useState(null); // {callId,type,direction,peer,status}
    const [muted, setMuted] = useState(false);
    const [camOff, setCamOff] = useState(false);
    const [seconds, setSeconds] = useState(0);
    const [localStream, setLocalStream] = useState(null);
    const [remoteStream, setRemoteStream] = useState(null);

    const callRef = useRef(null);
    const pcRef = useRef(null);
    const localRef = useRef(null);
    const pendingOffer = useRef(null);
    const pendingIce = useRef([]);
    const toastRef = useRef(showToast);
    toastRef.current = showToast;

    const setCallState = (next) => {
        callRef.current = next;
        setCall(next);
    };

    const send = (type, callId, data) => {
        const ws = wsRef.current;
        if (ws && ws.readyState === 1) ws.send(JSON.stringify({ type, callId, data }));
    };

    const cleanup = useCallback(() => {
        if (pcRef.current) {
            pcRef.current.onicecandidate = null;
            pcRef.current.ontrack = null;
            pcRef.current.onconnectionstatechange = null;
            pcRef.current.close();
            pcRef.current = null;
        }
        localRef.current?.getTracks().forEach((t) => t.stop());
        localRef.current = null;
        pendingOffer.current = null;
        pendingIce.current = [];
        setLocalStream(null);
        setRemoteStream(null);
        setMuted(false);
        setCamOff(false);
        setSeconds(0);
        callRef.current = null;
        setCall(null);
    }, []);

    // call timer
    useEffect(() => {
        if (call?.status !== "active") return;
        const id = setInterval(() => setSeconds((s) => s + 1), 1000);
        return () => clearInterval(id);
    }, [call?.status]);

    // tab closed mid-call -> release camera/mic
    useEffect(() => () => cleanup(), [cleanup]);

    async function getMedia(type) {
        if (!navigator.mediaDevices?.getUserMedia) {
            throw new Error("Mic/camera need HTTPS (or localhost). Use a tunnel like ngrok on your phone.");
        }
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: { echoCancellation: true, noiseSuppression: true },
            video: type === "video" ? { facingMode: "user" } : false,
        });
        localRef.current = stream;
        setLocalStream(stream);
    }

    function createPc(callId, iceServers) {
        const pc = new RTCPeerConnection({ iceServers });
        pcRef.current = pc;
        localRef.current.getTracks().forEach((t) => pc.addTrack(t, localRef.current));
        pc.ontrack = (e) => setRemoteStream(e.streams[0]);
        pc.onicecandidate = (e) => {
            if (e.candidate) send("call-ice", callId, e.candidate.toJSON());
        };
        pc.onconnectionstatechange = () => {
            const s = pc.connectionState;
            if (s === "connected" && callRef.current) setCallState({ ...callRef.current, status: "active" });
            if (s === "failed") hangUp();
        };
        return pc;
    }

    async function flushIce() {
        const pc = pcRef.current;
        while (pc && pendingIce.current.length) {
            await pc.addIceCandidate(pendingIce.current.shift()).catch(() => { });
        }
    }

    async function handleOffer(callId, offer) {
        const pc = pcRef.current;
        await pc.setRemoteDescription(offer);
        await flushIce();
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        send("call-answer", callId, { type: answer.type, sdp: answer.sdp });
    }

    /* ---------------- actions ---------------- */
    async function startCall(peer, type) {
        if (callRef.current) return toastRef.current("You're already in a call");
        setCallState({ callId: null, type, direction: "outgoing", peer, status: "calling" });
        try {
            await getMedia(type);
            const res = await api("", "POST", { recipientId: peer.id, type, deviceId: getDeviceId() });
            setCallState({ ...callRef.current, callId: res.call.callId });
            createPc(res.call.callId, res.iceServers);
        } catch (e) {
            toastRef.current(e.message || "Could not start call");
            cleanup();
        }
    }

    async function acceptCall() {
        const c = callRef.current;
        if (!c) return;
        try {
            await getMedia(c.type);
            const res = await api(`/${c.callId}/accept`, "POST", { deviceId: getDeviceId() });
            setCallState({ ...callRef.current, status: "connecting" });
            createPc(c.callId, res.iceServers);
            if (pendingOffer.current) {
                const offer = pendingOffer.current;
                pendingOffer.current = null;
                await handleOffer(c.callId, offer);
            }
        } catch (e) {
            toastRef.current(e.message || "Could not answer call");
            api(`/${c.callId}/reject`, "POST").catch(() => { });
            cleanup();
        }
    }

    async function rejectCall() {
        const c = callRef.current;
        if (c?.callId) await api(`/${c.callId}/reject`, "POST").catch(() => { });
        cleanup();
    }

    async function hangUp() {
        const c = callRef.current;
        if (c?.callId) await api(`/${c.callId}/end`, "POST").catch(() => { });
        cleanup();
    }

    function toggleMute() {
        const next = !muted;
        localRef.current?.getAudioTracks().forEach((t) => (t.enabled = !next));
        setMuted(next);
    }

    function toggleCam() {
        const next = !camOff;
        localRef.current?.getVideoTracks().forEach((t) => (t.enabled = !next));
        setCamOff(next);
    }

    /* ------------- WebSocket events (call from socket.onmessage) ------------- */
    // Returns true if the message was a call event.
    function handleCallSignal(msg) {
        const pc = pcRef.current;
        switch (msg.type) {
            case "call-incoming": {
                if (callRef.current) return true; // busy
                const c = msg.call;
                setCallState({
                    callId: c.callId,
                    type: c.type,
                    direction: "incoming",
                    peer: { id: c.caller.id, name: c.caller.username, profilePic: c.caller.profilePic },
                    status: "incoming",
                });
                return true;
            }
            case "call-accepted": {
                // we are the caller: callee picked up, send the offer
                const c = callRef.current;
                if (!c || !pc) return true;
                setCallState({ ...c, status: "connecting" });
                pc.createOffer()
                    .then(async (offer) => {
                        await pc.setLocalDescription(offer);
                        send("call-offer", c.callId, { type: offer.type, sdp: offer.sdp });
                    })
                    .catch(() => hangUp());
                return true;
            }
            case "call-offer":
                if (pc) handleOffer(msg.callId, msg.data).catch(() => hangUp());
                else pendingOffer.current = msg.data; // accept still in flight
                return true;
            case "call-answer":
                pc?.setRemoteDescription(msg.data).then(flushIce).catch(() => hangUp());
                return true;
            case "call-ice":
                if (pc && pc.remoteDescription) pc.addIceCandidate(msg.data).catch(() => { });
                else pendingIce.current.push(msg.data);
                return true;
            case "call-handled": // answered on another device
                if (callRef.current?.status === "incoming") cleanup();
                return true;
            case "call-ended":
                if (callRef.current && (!callRef.current.callId || callRef.current.callId === msg.callId)) {
                    const t = END_TOASTS[msg.reason];
                    if (t) toastRef.current(t);
                    cleanup();
                }
                return true;
            default:
                return false;
        }
    }

    return {
        call, muted, camOff, seconds, localStream, remoteStream,
        startCall, acceptCall, rejectCall, endCall: hangUp,
        toggleMute, toggleCam, handleCallSignal,
    };
}