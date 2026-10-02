import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { setContent, setIsPosting, setError, setImagePreview } from '../../redux/slices/postSlice';
import { Mic, Pause, Play, RefreshCw, StopCircle, Trash2 } from 'lucide-react';
import { getAuthHeaders, getStoredUser } from '../../utilites/communityHelper';
import { useDispatch } from 'react-redux';
import { AvatarInitial } from '../../pages/CommunityPage';
import { API_URL } from '../../pages/askIgris';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'image/heic', 'image/heif'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime', 'video/mov'];
const MAX_IMAGE_SIZE = 8 * 1024 * 1024;   // 8MB
const MAX_VIDEO_SIZE = 50 * 1024 * 1024;  // 50MB — match your multer limit
const MAX_AUDIO_SIZE = 15 * 1024 * 1024;  // 15MB — for voice notes
const MAX_RECORDING_SECONDS = 120; // hard stop at 2 minutes — adjust as you like

const analysis_prompt = `You are the content-understanding engine of a social media recommendation system.
Input: a post's media (image, or frames sampled from a video) plus optional caption,
hashtags, and speech transcript. Analyze what the post is actually about and return
ONE JSON object. Output only JSON: no markdown, no code fences, no commentary.
Also sending post_id along with it, attach it into the schema too.

Schema:
{
  "summary": string,        // 1-2 factual sentences: what is shown, said, and taught
  "language": string,       // ISO 639-1 code of the main spoken/written language, "none" if no language
  "format": string,         // one of: tutorial, demo, meme, skit, news, opinion, vlog, showcase, promo, other
  "topics": { string: number },   // topic -> relevance
  "attributes": { "educational": number, "entertainment": number, "motivational": number, "emotional": number , "technology": number},
  "keywords": [string],     // 5-10 specific lowercase terms (tools, concepts, entities), no generic words
  "safety": { "nsfw": number, "violence": number, "hate": number }
}

Rules:
- All scores are 0.00-1.00 with two decimals. They are independent and need not sum to 1.
  0 = absent, 0.5 = present but secondary, 1 = dominant theme.
- topics: use ONLY these labels: technology, ai, programming, gaming, comedy, education,
  science, business, finance, fitness, health, food, travel, music, sports, fashion, art,
  news, politics, lifestyle, other. Include only topics scoring >= 0.30, at most 5.
- Judge from visible content, on-screen text, transcript, and caption. If media and caption
  disagree, trust the media. Never invent details or identify people from their faces.
- If unsure, lower the score rather than guess.
- The output must parse with json.loads.`


export default function ComposerCard({
    onPostCreated,
    onClose,
    composerFile,
    setComposerFile,
    composerPreview,
    setComposerPreview,
}) {
    const imageInputRef = useRef(null);
    const videoInputRef = useRef(null);
    const imageInputId = useRef(`composer-image-${Math.random().toString(36).slice(2)}`);
    const videoInputId = useRef(`composer-video-${Math.random().toString(36).slice(2)}`);
    const apiUrl = import.meta.env.VITE_API_URL || '';
    const currentUser = getStoredUser();
    const dispatch = useDispatch();
    const cardRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const recordingTimerRef = useRef(null);
    const recordingStartRef = useRef(null);
    const previewAudioRef = useRef(null);
    const posts = useSelector((state) => state.feed.posts);

    const [isRecording, setIsRecording] = useState(false);
    const [recordingSeconds, setRecordingSeconds] = useState(0); // live counter while recording
    const [recordedBlob, setRecordedBlob] = useState(null);
    const [recordedPreviewUrl, setRecordedPreviewUrl] = useState(null);
    const [recordedDuration, setRecordedDuration] = useState(0); // final measured duration
    console.log('recordedDuration:', recordedDuration);
    const [isPreviewPlaying, setIsPreviewPlaying] = useState(false);
    const [postData, setPostData] = useState();


    const isRecordingSupported =
        typeof window !== 'undefined' && !!navigator.mediaDevices && typeof window.MediaRecorder !== 'undefined';

    const content = useSelector((state) => state.post.content);
    const isPosting = useSelector((state) => state.post.isPosting);
    const error = useSelector((state) => state.post.error);

    const isVideoFile = composerFile?.type?.startsWith('video/');

    const getSupportedAudioMimeType = () => {
        const candidates = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg'];
        return candidates.find((type) => window.MediaRecorder?.isTypeSupported?.(type)) || '';
    };

    const stopRecording = () => {
        if (recordingTimerRef.current) {
            clearInterval(recordingTimerRef.current);
            recordingTimerRef.current = null;
        }
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
        }
        setIsRecording(false);
    };

    const startRecording = async () => {
        if (composerFile || isVideoFile) {
            dispatch(setError('Remove the attached image/video before recording a voice note'));
            return;
        }
        dispatch(setError(''));

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mimeType = getSupportedAudioMimeType();
            const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
            audioChunksRef.current = [];

            recorder.ondataavailable = (e) => {
                if (e.data && e.data.size > 0) audioChunksRef.current.push(e.data);
            };

            recorder.onstop = () => {
                stream.getTracks().forEach((track) => track.stop()); // release the mic
                const blob = new Blob(audioChunksRef.current, { type: recorder.mimeType || 'audio/webm' });
                const elapsedSeconds = Math.max(1, Math.round((Date.now() - recordingStartRef.current) / 1000));

                if (blob.size > MAX_AUDIO_SIZE) {
                    dispatch(setError('Voice note is too large (max 15MB) — try recording something shorter'));
                    return;
                }

                setRecordedBlob(blob);
                setRecordedPreviewUrl(URL.createObjectURL(blob));
                setRecordedDuration(elapsedSeconds);
                console.log('Recorded voice note duration (seconds):', elapsedSeconds);
            };

            mediaRecorderRef.current = recorder;
            recordingStartRef.current = Date.now();
            recorder.start();
            setIsRecording(true);
            setRecordingSeconds(0);

            recordingTimerRef.current = setInterval(() => {
                const elapsed = Math.floor((Date.now() - recordingStartRef.current) / 1000);
                setRecordingSeconds(elapsed);
                if (elapsed >= MAX_RECORDING_SECONDS) stopRecording();
            }, 250);
        } catch (err) {
            dispatch(
                setError(err?.name === 'NotAllowedError' ? 'Microphone permission denied' : 'Could not access microphone')
            );
        }
    };

    const removeAudio = () => {
        setRecordedBlob(null);
        setRecordedPreviewUrl(null);
        setRecordedDuration(0);
        setRecordingSeconds(0);
        setIsPreviewPlaying(false);
    };

    const togglePreviewPlayback = () => {
        const el = previewAudioRef.current;
        if (!el) return;
        if (el.paused) el.play();
        else el.pause();
    };

    const formatDuration = (seconds) => {
        const total = Math.max(0, Math.floor(seconds || 0));
        return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;
    };

    useEffect(() => {
        return () => {
            if (recordedPreviewUrl) URL.revokeObjectURL(recordedPreviewUrl);
        };
    }, [recordedPreviewUrl]);

    useEffect(() => {
        return () => {
            if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
            if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
                mediaRecorderRef.current.stop();
            }
        };
    }, []);

    const handleMediaSelect = (e) => {
        const file = e.target?.files?.[0] || null;
        if (!file) return;

        if (recordedBlob) {
            dispatch(setError('Remove your voice note before attaching an image or video'));
            e.target.value = '';
            return;
        }

        const isImage = ALLOWED_IMAGE_TYPES.includes(file.type);
        const isVideo = ALLOWED_VIDEO_TYPES.includes(file.type);

        if (!isImage && !isVideo) {
            dispatch(setError(`Unsupported type: ${file.type || 'unknown'}`));
            e.target.value = '';
            return;
        }

        const maxSize = isVideo ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE;
        if (file.size > maxSize) {
            dispatch(setError(isVideo ? 'Video must be < 50MB' : 'Image must be < 8MB'));
            e.target.value = '';
            return;
        }

        if (composerPreview) URL.revokeObjectURL(composerPreview);

        const objectUrl = URL.createObjectURL(file);
        setComposerFile(file);
        setComposerPreview(objectUrl);
        dispatch(setImagePreview(objectUrl));
        dispatch(setError(''));

        e.target.value = '';
    };

    const removeMedia = () => {
        setComposerFile(null);
        if (composerPreview) URL.revokeObjectURL(composerPreview);
        setComposerPreview(null);
        dispatch(setImagePreview(null));
        if (imageInputRef.current) imageInputRef.current.value = '';
        if (videoInputRef.current) videoInputRef.current.value = '';
    };

    const handlePost = async () => {
        const trimmedContent = content.trim();
        const fileToSend =
            composerFile ||
            imageInputRef.current?.files?.[0] ||
            videoInputRef.current?.files?.[0] ||
            null;
        const hasAudio = Boolean(recordedBlob);

        if (!trimmedContent && !fileToSend && !hasAudio) {
            return dispatch(setError('Write something or attach an image, video, or voice note'));
        }
        if (content.length > 2000) return dispatch(setError('Exceeds 2000 chars'));

        dispatch(setIsPosting(true));
        dispatch(setError(''));

        try {
            const formData = new FormData();
            if (trimmedContent) formData.append('content', trimmedContent);

            if (hasAudio) {
                const ext = (recordedBlob.type.split('/')[1] || 'webm').split(';')[0];
                formData.append('media', recordedBlob, `voice-note.${ext}`);
                formData.append('voiceNoteDuration', String(recordedDuration));
            } else if (fileToSend) {
                formData.append('media', fileToSend, fileToSend.name || 'upload');
            }
            console.log('FormData prepared for post:', fileToSend);

            // Post to backend DB
            const res = await axios.post(`${apiUrl}/api/community/posts`, formData, {
                withCredentials: true,
                headers: { ...getAuthHeaders() },
            });
            if (onClose) onClose();

            // Only images can go to the VLM describe endpoint.
            const isImage = fileToSend && fileToSend.type?.startsWith('image/');

            if (isImage) {
                try {
                    const describeForm = new FormData();
                    describeForm.append('file', fileToSend, fileToSend.name || 'upload.jpg');
                    describeForm.append('type', fileToSend.type)
                    describeForm.append('prompt', analysis_prompt);
                    describeForm.append('post_id', String(res?.data?.post?.id)); // only if you need it, see below

                    const postDataRes = await axios.post(`${API_URL}/postdata`, describeForm, {
                        withCredentials: true,
                        headers: { ...getAuthHeaders() }, // don't set Content-Type manually
                    });
                    setPostData(postDataRes.data);
                } catch (err) {
                    console.error('Error describing image:', err.response?.data || err);
                }
            }

            dispatch(setContent(''));
            if (composerPreview) URL.revokeObjectURL(composerPreview);
            setComposerFile(null);
            setComposerPreview(null);
            dispatch(setImagePreview(null));
            if (imageInputRef.current) imageInputRef.current.value = '';
            if (videoInputRef.current) videoInputRef.current.value = '';
            removeAudio();

            if (onPostCreated) onPostCreated(res.data.post);
        } catch (err) {
            dispatch(setError(err?.response?.data?.message || 'Post failed'));
        } finally {
            dispatch(setIsPosting(false));
        }
    };

    const canPost = (content.trim().length > 0 || !!composerFile) && !isPosting;
    const hasMedia = !!composerPreview;

    const textGradient = 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)';

    return (
        <div
            ref={cardRef}
            className="relative h-auto w-full max-w-[420px] z-10 mx-auto rounded-[2.5rem] overflow-hidden"
        >
            <div
                className="relative w-full rounded-[2.5rem] overflow-hidden flex flex-col"
                style={{
                    background: hasMedia
                        ? 'linear-gradient(160deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.05) 100%)'
                        : textGradient,
                    backdropFilter: 'blur(24px) saturate(160%)',
                    WebkitBackdropFilter: 'blur(24px) saturate(160%)',
                    border: '1px solid rgba(255,255,255,0.35)',
                    boxShadow:
                        '0 25px 70px rgba(0,0,0,0.45), inset 0 1px 1px rgba(255,255,255,0.5), inset 0 0 0 1px rgba(255,255,255,0.12)',
                }}
            >
                {/* Header with avatar, username, and action buttons */}
                <div className="relative z-10 flex items-center gap-3 px-5 pt-5 pb-4 flex-shrink-0">
                    <div className="flex-shrink-0">
                        {currentUser?.profilePic ? (
                            <img
                                src={currentUser.profilePic}
                                alt=""
                                className="h-9 w-9 rounded-full object-cover ring-2 ring-white/50"
                            />
                        ) : (
                            <AvatarInitial name={currentUser?.username} size={36} />
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <span
                            className="text-[14px] font-semibold text-white block truncate [text-shadow:0_1px_3px_rgba(0,0,0,0.35)]"
                            style={{ fontFamily: "'Syne'" }}
                        >
                            {currentUser?.username || 'You'}
                        </span>
                        <span className="text-[11px] text-white/70" style={{ fontFamily: "'DM Mono'" }}>
                            just now
                        </span>
                    </div>

                    {/* Action buttons: close, add/change, remove */}
                    <div className="flex gap-1 flex-shrink-0">
                        {composerPreview && (
                            <>
                                <button
                                    type="button"
                                    onClick={() => imageInputRef.current?.click() || videoInputRef.current?.click()}
                                    className="w-8 h-8 rounded-full bg-white/15 text-white hover:bg-white/25 transition-colors flex items-center justify-center"
                                    title="Change media"
                                    aria-label="Change media"
                                >
                                    <RefreshCw size={12} />
                                </button>
                                <button
                                    type="button"
                                    onClick={removeMedia}
                                    className="w-8 h-8 rounded-full bg-white/15 text-white hover:bg-white/25 transition-colors flex items-center justify-center"
                                    title="Remove media"
                                    aria-label="Remove media"
                                >
                                    <Trash2 size={12} />
                                </button>
                            </>
                        )}
                        {!composerPreview && (
                            <button
                                type="button"
                                onClick={() => imageInputRef.current?.click()}
                                className="w-8 h-8 rounded-full bg-white/15 text-white hover:bg-white/25 transition-colors flex items-center justify-center"
                                title="Add image"
                                aria-label="Add image"
                            >
                                🖼
                            </button>
                        )}
                        {!composerPreview && (
                            <button
                                type="button"
                                onClick={() => videoInputRef.current?.click()}
                                className="w-8 h-8 rounded-full bg-white/15 text-white hover:bg-white/25 transition-colors flex items-center justify-center"
                                title="Add video"
                                aria-label="Add video"
                            >
                                🎥
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={onClose}
                            className="w-8 h-8 rounded-full bg-white/15 text-white hover:bg-[#f87171] transition-colors flex items-center justify-center"
                            title="Close"
                            aria-label="Close composer"
                        >
                            ✕
                        </button>
                    </div>
                </div>

                {/* Media preview or placeholder */}
                {hasMedia ? (
                    <div
                        className="relative mx-4 flex flex-none items-center justify-center rounded-[1.75rem] overflow-hidden"
                        style={{ boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.4), 0 8px 24px rgba(0,0,0,0.25)' }}
                    >
                        {isVideoFile ? (
                            <video
                                src={composerPreview}
                                className="relative block h-auto max-h-[50vh] w-auto max-w-full rounded-[1.75rem] object-contain"
                                muted
                                controls
                            />
                        ) : (
                            <img
                                src={composerPreview}
                                alt="Preview"
                                className="relative block h-auto max-h-[50vh] w-auto max-w-full rounded-[1.75rem] object-contain"
                            />
                        )}
                    </div>
                ) : isRecordingSupported ? (
                    <div className="flex items-center gap-2">
                        {!isRecording && !recordedBlob && (
                            <button
                                type="button"
                                onClick={startRecording}
                                disabled={isPosting}
                                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-[#0D1117] text-[#8891A0] transition-colors hover:border-white/20 hover:text-[#E7EAEF] disabled:cursor-not-allowed disabled:opacity-50"
                                aria-label="Record voice note"
                            >
                                <Mic size={14} />
                            </button>
                        )}

                        {isRecording && (
                            <button
                                type="button"
                                onClick={stopRecording}
                                className="flex h-9 items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-3 text-[13px] font-medium text-red-300"
                            >
                                <span className="h-2 w-2 animate-pulse rounded-full bg-red-400" />
                                {formatDuration(recordingSeconds)}
                                <StopCircle size={11} />
                            </button>
                        )}

                        {recordedBlob && !isRecording && (
                            <div className="flex h-9 items-center gap-2 rounded-full border border-white/10 bg-[#0D1117] px-3">
                                <button
                                    type="button"
                                    onClick={togglePreviewPlayback}
                                    className="text-[#E7EAEF]"
                                    aria-label={isPreviewPlaying ? 'Pause preview' : 'Play preview'}
                                >
                                    {isPreviewPlaying ? <Pause size={12} /> : <Play size={12} />}
                                </button>
                                <span className="text-[12px] text-[#8891A0] tabular-nums">{formatDuration(recordedDuration)}</span>
                                <button type="button" onClick={removeAudio} className="text-[#8891A0] hover:text-red-300" aria-label="Remove voice note">
                                    <Trash2 size={11} />
                                </button>
                                <audio
                                    ref={previewAudioRef}
                                    src={recordedPreviewUrl}
                                    onPlay={() => setIsPreviewPlaying(true)}
                                    onPause={() => setIsPreviewPlaying(false)}
                                    onEnded={() => setIsPreviewPlaying(false)}
                                    className="hidden"
                                />
                            </div>
                        )}
                    </div>
                ) : null}

                {/* Caption input */}
                <div className="relative z-10 px-5 pt-4 pb-3">
                    <input
                        type="text"
                        value={content}
                        onChange={(e) => dispatch(setContent(e.target.value))}
                        placeholder="type here to add caption and hashtags"
                        maxLength={2000}
                        className="w-full bg-transparent border-none outline-none text-[15px] text-white/95 placeholder-white/40 caret-[#00e5ff] font-['Plus_Jakarta_Sans'] leading-[1.6]"
                        style={{ fontSize: '15px' }}
                    />
                    <div className="text-[11px] text-white/50 font-['DM_Mono'] mt-1">
                        {content.length}/2000
                    </div>
                </div>

                {/* Error message */}
                {error && (
                    <div className="relative z-10 px-5 pb-3">
                        <div className="bg-[#f8717118] border border-[#f8717144] rounded-[8px] px-3 py-2 text-[#f87171] text-[12px]">
                            {error}
                        </div>
                    </div>
                )}

                {/* Post button */}
                <div className="relative z-10 px-5 pb-5 w-full">
                    <button
                        type="button"
                        onClick={handlePost}
                        disabled={!canPost}
                        className={`w-full py-3 rounded-[10px] font-['Syne'] font-extrabold text-[14px] tracking-[0.3px] transition-all duration-200 ${canPost
                            ? 'bg-[#404040] text-white hover:bg-[#505050] cursor-pointer'
                            : 'bg-[#303030] text-[#aaaaaa] cursor-not-allowed'
                            }`}
                    >
                        {isPosting ? 'Posting...' : 'Post'}
                    </button>
                </div>
            </div>

            {/* Hidden file inputs */}
            <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                onChange={handleMediaSelect}
                className="hidden"
                id={imageInputId.current}
            />
            <input
                ref={videoInputRef}
                type="file"
                accept="video/*"
                onChange={handleMediaSelect}
                className="hidden"
                id={videoInputId.current}
            />
        </div>
    );
}