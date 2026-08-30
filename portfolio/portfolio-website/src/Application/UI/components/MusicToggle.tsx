import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import UIEventBus from '../EventBus';
import { Easing } from '../Animation';
// @ts-ignore
import musicOn from '../../../../static/textures/UI/music_on.svg';
// @ts-ignore
import musicOff from '../../../../static/textures/UI/music_off.svg';

interface MusicToggleProps {}

// ─────────────────────────────────────────────────────────────────────────────
// CUSTOMIZE: background music tracks.
//
// Drop your own .mp3 files into static/audio/radio/ and edit this list — the
// whole static/ folder is copied to the site root at build time, so the src is
// just its path relative to that root. Nothing else needs to change.
//
// These are deliberately NOT registered in Application/sources.ts: everything
// in that manifest is preloaded during the loading screen, and these files are
// several MB each. They load lazily on first play instead.
// ─────────────────────────────────────────────────────────────────────────────
const TRACKS = [
    { name: 'Elevator', src: 'audio/radio/elevator.mp3' },
    { name: 'Track 1', src: 'audio/radio/1.mp3' },
    { name: 'Track 2', src: 'audio/radio/2.mp3' },
    { name: 'Track 3', src: 'audio/radio/3.mp3' },
];

const OFF = -1;
const VOLUME = 0.35;

const MusicToggle: React.FC<MusicToggleProps> = ({}) => {
    const [isHovering, setIsHovering] = useState(false);
    const [isActive, setIsActive] = useState(false);
    const [trackIndex, setTrackIndex] = useState(OFF);
    const [muted, setMuted] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Cycle: off -> track 1 -> track 2 -> track 3 -> off
    const onMouseDownHandler = useCallback((event) => {
        setIsActive(true);
        event.preventDefault();
        setTrackIndex((prev) => (prev + 1 >= TRACKS.length ? OFF : prev + 1));
    }, []);

    const onMouseUpHandler = useCallback(() => {
        setIsActive(false);
    }, []);

    // The speaker icon silences the whole scene, so it silences music too.
    useEffect(() => {
        UIEventBus.on('muteToggle', (isMuted: boolean) => {
            setMuted(isMuted);
        });
    }, []);

    useEffect(() => {
        if (trackIndex === OFF) {
            audioRef.current?.pause();
            return;
        }

        if (!audioRef.current) {
            const audio = new Audio();
            audio.loop = true;
            audio.volume = VOLUME;
            audioRef.current = audio;
        }

        const audio = audioRef.current;
        const src = TRACKS[trackIndex].src;

        // Only reset src on an actual track change, so toggling mute doesn't
        // restart the track from the beginning.
        if (!audio.src.endsWith(src)) {
            audio.src = src;
        }

        if (muted) {
            audio.pause();
        } else {
            // Autoplay policies can still reject this; playback is user-initiated
            // so it normally resolves, and a rejection is not worth surfacing.
            audio.play().catch(() => {});
        }
    }, [trackIndex, muted]);

    useEffect(() => {
        return () => {
            audioRef.current?.pause();
            audioRef.current = null;
        };
    }, []);

    const playing = trackIndex !== OFF;

    return (
        <div
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            style={styles.container}
            onMouseDown={onMouseDownHandler}
            onMouseUp={onMouseUpHandler}
            className="icon-control-container"
            id="prevent-click"
            title={playing ? TRACKS[trackIndex].name : 'Music off'}
        >
            <motion.img
                id="prevent-click"
                src={playing ? musicOn : musicOff}
                style={{ opacity: isActive ? 0.2 : isHovering ? 0.8 : 1 }}
                width={window.innerWidth < 768 ? 8 : 10}
                animate={
                    isActive ? 'active' : isHovering ? 'hovering' : 'default'
                }
                variants={iconVars}
            />
        </div>
    );
};

const iconVars = {
    hovering: {
        opacity: 0.8,
        transition: {
            duration: 0.1,
            ease: 'easeOut',
        },
    },
    active: {
        scale: 0.8,
        opacity: 0.5,
        transition: {
            duration: 0.1,
            ease: Easing.expOut,
        },
    },
    default: {
        scale: 1,
        opacity: 1,
        transition: {
            duration: 0.2,
            ease: 'easeOut',
        },
    },
};

const styles: StyleSheetCSS = {
    container: {
        background: 'black',
        textAlign: 'center',
        display: 'flex',
        boxSizing: 'border-box',
        justifyContent: 'center',
        alignItems: 'center',
        cursor: 'pointer',
    },
};

export default MusicToggle;
