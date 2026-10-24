import React, { useEffect, useRef } from "react";
import { Mic, MicOff, Phone, PhoneOff, Video, VideoOff } from "lucide-react";

function MediaEl({ stream, muted = false, video = true, className = "" }) {
    const ref = useRef(null);
    useEffect(() => {
        if (ref.current) ref.current.srcObject = stream || null;
    }, [stream]);
    return video ? (
        <video ref={ref} autoPlay playsInline muted={muted} className={className} />
    ) : (
        <audio ref={ref} autoPlay />
    );
}

const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

function RoundBtn({ onClick, active, danger, success, label, children }) {
    const color = danger
        ? "bg-rose-600 hover:bg-rose-500 text-white"
        : success
            ? "bg-emerald-600 hover:bg-emerald-500 text-white"
            : active
                ? "bg-slate-100 text-black"
                : "bg-slate-800 hover:bg-slate-700 text-slate-100";
    return (
        <button
            onClick={onClick}
            aria-label={label}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${color}`}
        >
            {children}
        </button>
    );
}

export function CallOverlay({
    call, muted, camOff, seconds, localStream, remoteStream,
    onAccept, onReject, onEnd, onToggleMute, onToggleCam,
}) {
    if (!call) return null;

    const isVideo = call.type === "video";
    const incoming = call.status === "incoming";
    const active = call.status === "active";
    const name = call.peer?.name || "Unknown";
    const showRemoteVideo = isVideo && !!remoteStream && (active || call.status === "connecting");

    const statusText = incoming
        ? `Incoming ${isVideo ? "video" : "voice"} call`
        : call.status === "calling"
            ? "Calling…"
            : call.status === "connecting"
                ? "Connecting…"
                : fmt(seconds);

    return (
        <div className="fixed inset-0 z-[200] bg-black text-slate-100 flex flex-col">
            {/* remote audio for voice calls (video element carries audio on video calls) */}
            {!isVideo && remoteStream && <MediaEl stream={remoteStream} video={false} />}

            {showRemoteVideo && (
                <MediaEl stream={remoteStream} className="absolute inset-0 w-full h-full object-cover" />
            )}
            {showRemoteVideo && <div className="absolute inset-0 bg-black/30" />}

            {/* centre: avatar + name */}
            <div className="relative flex-1 flex flex-col items-center justify-center gap-4 px-6">
                {!showRemoteVideo && (
                    <div className="relative">
                        {(incoming || call.status === "calling") && (
                            <span className="absolute inset-0 rounded-full bg-slate-600/40 animate-ping" />
                        )}
                        {call.peer?.profilePic ? (
                            <img src={call.peer.profilePic} alt={name} className="relative w-28 h-28 rounded-full object-cover border border-slate-700" />
                        ) : (
                            <div className="relative w-28 h-28 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-4xl font-bold">
                                {name.charAt(0).toUpperCase()}
                            </div>
                        )}
                    </div>
                )}
                <div className="text-center drop-shadow">
                    <div className="text-2xl font-bold">{name}</div>
                    <div className="text-sm text-slate-400 mt-1">{statusText}</div>
                </div>
            </div>

            {/* local preview */}
            {isVideo && localStream && !incoming && (
                <div className="absolute top-4 right-4 w-28 h-40 md:w-36 md:h-52 rounded-2xl overflow-hidden border border-slate-700 bg-slate-900 shadow-2xl">
                    <MediaEl stream={localStream} muted className="w-full h-full object-cover scale-x-[-1]" />
                    {camOff && <div className="absolute inset-0 bg-slate-900 flex items-center justify-center"><VideoOff className="w-6 h-6 text-slate-500" /></div>}
                </div>
            )}

            {/* controls */}
            <div className="relative pb-10 pt-4 flex items-center justify-center gap-5">
                {incoming ? (
                    <>
                        <RoundBtn danger onClick={onReject} label="Decline"><PhoneOff className="w-6 h-6" /></RoundBtn>
                        <RoundBtn success onClick={onAccept} label="Accept">
                            {isVideo ? <Video className="w-6 h-6" /> : <Phone className="w-6 h-6" />}
                        </RoundBtn>
                    </>
                ) : (
                    <>
                        <RoundBtn active={muted} onClick={onToggleMute} label={muted ? "Unmute" : "Mute"}>
                            {muted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                        </RoundBtn>
                        {isVideo && (
                            <RoundBtn active={camOff} onClick={onToggleCam} label="Toggle camera">
                                {camOff ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
                            </RoundBtn>
                        )}
                        <RoundBtn danger onClick={onEnd} label="End call"><PhoneOff className="w-6 h-6" /></RoundBtn>
                    </>
                )}
            </div>
        </div>
    );
}