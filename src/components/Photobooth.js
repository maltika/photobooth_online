import React, { useState, useRef, useEffect } from 'react';
import Webcam from 'react-webcam';

const frameOptions = [
    "/assets/frames/heart-frame.png",
    "/assets/frames/heart-frame-2.png",
    "/assets/frames/heart-frame-3.png",
    "/assets/frames/heart-frame-4.png",
];

const stickerOptions = [
    "/assets/stickers/leaf.png",
    "/assets/stickers/sparkles.png",

];

const videoConstraints = { width: 953, height: 599, facingMode: 'user' };
const SLOT_WIDTH = 953;
const SLOT_HEIGHT = 599;

export default function Photobooth() {
    const webcamRef = useRef(null);
    const canvasRef = useRef(null);
    const frameRef = useRef(null);

    const slots = [
        { x: 123, y: 78 },
        { x: 123, y: 697 },
        { x: 123, y: 1286 },
        { x: 123, y: 1885 },
    ];

    const [selectedFrame, setSelectedFrame] = useState(null);
    const [mode, setMode] = useState('Photo');

    return (
        <div style={centerCol}>
            {/* top bar with back btn and txt */}

            <div style={topBar}>
                {selectedFrame && (
                    <button
                        style={{
                            ...buttonStyle,
                            position: 'absolute',
                            left: 0,
                            top: 10,
                            height: 40,
                            padding: '0 16px',
                            lineHeight: '40px',
                            display: 'flex',
                            alignItems: 'center',
                        }}
                        //onClick={}
                    > ← Back </button>

                )}
                <h1 style={titleBar}>
                    {!selectedFrame
                        ? '₊✩‧₊˚ Select a frame౨ৎ ˚₊✩‧₊'
                        : mode === 'Photo'
                            ? '⋆｡‧˚ʚ Smile :)ɞ˚‧｡⋆'
                            : '. ݁₊ ⊹ . ݁Let’s decorate . ⊹ ₊ ݁.'}
                </h1>
            </div>
            <div style={mainContent}>
                {!selectedFrame ? (
                    <div style={{ display: 'flex', gap: 24 }}>
                        {frameOptions.map((src) => {
                            const isSelected = selectedFrame === src;

                            return (
                                <img
                                    key={src}
                                    src={src}
                                    slt="frame"
                                    onClick={() => setSelectedFrame(src)}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = "scale(1.08)";
                                        e.currentTarget.style.boxShadow = "0 12px 30 px rgba(255,122,162,0.45)";
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = "scale(1)";
                                        e.currentTarget.style.boxShadow = frameThumb.boxShadow;

                                    }}

                                    style={{
                                        ...frameThumb,
                                        transform: isSelected ? "scale(1.08)" : "scale(1)",
                                        transtion: "transfrom 0.25s ease, box-shadow 0.25s ease",
                                        boxShadow: isSelected ? "0 12px 30px  rgba(255,122,162,0.45)" : frameThumb.boxShadow,

                                    }}

                                />
                            )
                        })}
                    </div>
                ) : (
                    <div></div>
                )}
            </div>
        </div>
    )
}

// styles
const centerCol = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 20
};
const topBar = {
    width: 700,
    height: 60,
    position: "relative",
    marginBottom: 20,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
}
const buttonStyle = {
    padding: "10px 20px",
    fontSize: 20,
    cursor: "pointer",
    fontFamily: "CantikaCute",
    color: "#8c5b4a",
    border: "2px solid #8c5b4a",
    borderRadius: 8,
    background: "white"
};

const row = { display: "flex", gap: 40, alignItems: "flex-start" };
const frameThumb = {
    width: 180,
    cursor: "pointer",
    borderRadius: 12,
    boxShadow: "0 8px 8px rgba(0,0,0,0.15)"
};

const titleBar = {
    margin: 0,
    lineHeight: "60px",      // vertical center
    textAlign: "center",     // horizontal center
    width: "100%",            // occupy full width of top bar
}

const mainContent = {
    height: 600, // fixed content height
    width: 700,
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
}