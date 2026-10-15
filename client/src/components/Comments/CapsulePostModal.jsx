import { useEffect, useRef, useState } from 'react';
import {
    FiX,
    FiHeart,
    FiMessageCircle,
    FiSend,
    FiBookmark,
    FiChevronLeft,
    FiChevronRight,
    FiCamera,
} from 'react-icons/fi';
import gsap from 'gsap';
import { setImagePreview } from '../../redux/slices/postSlice';
import { setError } from '../../redux/slices/capsuleSlice';
import { useDispatch } from 'react-redux';
import { apiUrl, getAuthHeaders } from '../../utilites/communityHelper';
import axios from 'axios';

export default function CapsulePostModal({ isOpen, onClose, onAddCapsule, story, onPrev, onNext }) {
    const dispatch = useDispatch();
    const [selectedImageFile, setSelectedImageFile] = useState(null);
    const [caption, setCaption] = useState('');
    const cardRef = useRef(null);
    const glowRef = useRef(null);
    const backdropRef = useRef(null);
    const fileInputRef = useRef(null);

    const handleImageSelect = (e) => {
        try {
            const file = e?.target?.files?.[0];
            if (!file) return;
            if (!['image/jpeg', 'image/png', 'image/webp', 'image/jpg'].includes(file.type)) {
                dispatch(setError('Only JPEG, PNG, WEBP allowed'));
                return;
            }
            setSelectedImageFile(file);
            dispatch(setImagePreview(URL.createObjectURL(file)));
            dispatch(setError(''));
        } catch (error) {
            console.error('Error selecting image:', error);
        }
    };

    const capsuleImagePreview = selectedImageFile
        ? URL.createObjectURL(selectedImageFile)
        : null;

    // Escape to close + body scroll lock while open
    useEffect(() => {
        if (!isOpen) return;
        const onKeyDown = (e) => {
            if (e.key === 'Escape') onClose?.();
            if (e.key === 'ArrowLeft') onPrev?.();
            if (e.key === 'ArrowRight') onNext?.();
        };
        document.addEventListener('keydown', onKeyDown);
        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', onKeyDown);
            document.body.style.overflow = prevOverflow;
        };
    }, [isOpen, onClose, onPrev, onNext]);

    // GSAP entrance
    useEffect(() => {
        if (!isOpen || !cardRef.current) return;
        const ctx = gsap.context(() => {
            gsap.fromTo(
                backdropRef.current,
                { opacity: 0 },
                { opacity: 1, duration: 0.35, ease: 'power2.out' }
            );
            gsap.fromTo(
                cardRef.current,
                { opacity: 0, scale: 0.86, y: 14 },
                { opacity: 1, scale: 1, y: 0, duration: 0.5, ease: 'expo.out' }
            );
            gsap.fromTo(
                glowRef.current,
                { opacity: 0 },
                { opacity: 1, duration: 0.7, delay: 0.05, ease: 'power2.out' }
            );
        });
        return () => ctx.revert();
    }, [isOpen]);

    if (!isOpen || !story) return null;

    return (
        <div
            ref={backdropRef}
            onClick={onClose}
            className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4 py-10"
            role="dialog"
            aria-modal="true"
            aria-label={`${story.author}'s story`}
        >
            {/* Prev / Next — only shown if handlers were passed in */}
            {onPrev && (
                <button
                    onClick={(e) => { e.stopPropagation(); onPrev(); }}
                    className="hidden sm:flex absolute left-6 md:left-16 top-1/2 -translate-y-1/2 h-11 w-11 items-center justify-center rounded-full bg-white/5 text-white/70 hover:bg-white/10 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/70"
                    aria-label="Previous story"
                >
                    <FiChevronLeft size={20} />
                </button>
            )}
            {onNext && (
                <button
                    onClick={(e) => { e.stopPropagation(); onNext(); }}
                    className="hidden sm:flex absolute right-6 md:right-16 top-1/2 -translate-y-1/2 h-11 w-11 items-center justify-center rounded-full bg-white/5 text-white/70 hover:bg-white/10 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/70"
                    aria-label="Next story"
                >
                    <FiChevronRight size={20} />
                </button>
            )}

            {/* Card + glow, stopPropagation so clicking inside doesn't close */}
            <div
                onClick={(e) => e.stopPropagation()}
                className="relative w-[min(400px,88vw)] h-[min(640px,82vh)]"
            >
                {/* Soft ambient halo behind the card — this is the "glow border" */}
                <div
                    ref={glowRef}
                    className="pointer-events-none absolute -inset-3 rounded-full blur-2xl opacity-0"
                    style={{
                        background:
                            'radial-gradient(closest-side, rgba(140,190,255,0.45), rgba(80,140,255,0.18) 55%, transparent 75%)',
                    }}
                />

                {/* The capsule itself */}
                <div
                    ref={cardRef}
                    className="relative h-165 w-110 rounded-full overflow-hidden bg-[#0d0d0d] flex flex-col items-center"
                    style={{
                        boxShadow:
                            '0 0 0 1px rgba(255,255,255,0.14), 0 0 50px 4px rgba(140,190,255,0.22), 0 20px 60px rgba(0,0,0,0.5)',
                        backgroundImage: capsuleImagePreview
                            ? `url('${capsuleImagePreview}')`
                            : undefined,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                    }}
                >
                    <button
                        onClick={onClose}
                        className="absolute top-6 right-8 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white/70 hover:text-white hover:bg-black/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/70"
                        aria-label="Close"
                    >
                        <FiX size={16} />
                    </button>

                    {/* Header — inset from the curve on purpose */}
                    <div className="flex flex-col z-10 items-center mt-5 shrink-0">
                        <div className="h-11 w-11 rounded-full overflow-hidden ring-2 ring-white/20 mb-2">
                            {story.avatar ? (
                                <img src={story.avatar} alt="" className="h-full w-full object-cover" />
                            ) : (
                                <div className="h-full w-full bg-[#2b2b2b] flex items-center justify-center text-[13px] text-zinc-200">
                                    {story.author?.[0]?.toUpperCase()}
                                </div>
                            )}
                        </div>
                        <p className="text-[13px] text-zinc-200">
                            <span className="font-medium">@{story.author}</span>
                        </p>
                    </div>

                    {/* Media — flexes to fill remaining space so the oval holds
              its shape regardless of caption length */}
                    {/* <div className="flex-1 min-h-0 w-full px-7 mt-4">
             <div
        className="absolute inset-0 bg-cover bg-center transition-opacity duration-700"
        style={{
          backgroundImage: story.image
            ? `url('${story.image}')`
            : "url('https://plus.unsplash.com/premium_photo-1717680106576-f10f7e9ce626?q=80&w=722&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')",
        }}
      />
          </div> */}

                    {/* Caption — clamped so it can't push the actions row into the curve */}
                    {story.caption && (
                        <p className="shrink-0 px-10 pt-3 text-center text-[13px] leading-[1.5] text-zinc-300 line-clamp-2">
                            {story.caption}
                        </p>
                    )}

                    {/* Actions */}
                    {!selectedImageFile ? (
                        <div className="shrink-0 flex flex-col items-center z-10 gap-6 mt-50 pb-5">
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/jpeg,image/png,image/webp,image/jpg"
                                className="hidden"
                                onChange={handleImageSelect}
                            />
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="text-white/80 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/70 rounded-full"
                                aria-label="Upload image"
                            >
                                <FiCamera size={40} />
                            </button>
                            <div className="text-white text-center px-6">
                                <h1>Share something with us...</h1>
                            </div>
                        </div>
                    ) : (
                        <div className="shrink-0 w-full px-6 z-10 mt-110 pb-5 flex flex-col items-center gap-3">
                            <input
                                value={caption}
                                onChange={(e) => setCaption(e.target.value)}
                                placeholder="Write a caption..."
                                rows={3}
                                className="w-full rounded-2xl max-w-90 border border-white/20 bg-black/50 px-3 py-2 text-sm text-white placeholder:text-zinc-400 outline-none backdrop-blur-sm"
                            />
                            <button
                                type="button"
                                onClick={async () => {
                                    try {
                                        await onAddCapsule(selectedImageFile, caption);
                                        // parent will close modal; clear local preview
                                        setSelectedImageFile(null);
                                        setCaption('');
                                        dispatch(setImagePreview(null));
                                    } catch (err) {
                                        const msg = err?.response?.data?.message || err.message || 'Failed to post capsule';
                                        dispatch(setError(msg));
                                        console.error('CapsulePostModal post error', err);
                                    }
                                }}
                                className="rounded-full bg-white/90 px-4 py-2 text-sm font-medium text-black transition hover:bg-white"
                            >
                                Post Capsule
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}