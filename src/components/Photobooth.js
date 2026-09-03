import React, { useRef, useState, useEffect, useCallback } from "react";
import Webcam from "react-webcam";

const frameOptions = [
    "/assets/frames/frame-1.PNG",
    "/assets/frames/frame-4.PNG",
    "/assets/frames/frame-8.PNG",
    "/assets/frames/frame-12.PNG",
];

const stickerOptions = [
    "/assets/stickers/leaf.png",
    "/assets/stickers/sparkles.png",
    "/assets/stickers/star-black.PNG",
    "/assets/stickers/star-blue.PNG",
    "/assets/stickers/star-pink.PNG",
];

const videoConstraints = { width: 963, height: 678, facingMode: "user" };
const SLOT_WIDTH = 963;
const SLOT_HEIGHT = 678;

const STICKER_BASE_SIZE = 150;
const MIN_SCALE = 0.4;
const MAX_SCALE = 2.5;

const SLOTS = [
    { x: 120, y: 77 },
    { x: 120, y: 802 },
    { x: 120, y: 1525 },
    { x: 120, y: 2252 }
];

export default function PhotoBooth() {
    const webcamRef = useRef(null);
    const canvasRef = useRef(null);
    const frameImgRef = useRef(null);

    const [selectedFrame, setSelectedFrame] = useState(null);
    const [mode, setMode] = useState("photo");

    const [photos, setPhotos] = useState([]);
    const [photoCount, setPhotoCount] = useState(0);
    const [canTakePhoto, setCanTakePhoto] = useState(true);
    const [draggingPhoto, setDraggingPhoto] = useState(null);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const [countdown, setCountdown] = useState(null);

    const [stickers, setStickers] = useState([]);
    const [draggingSticker, setDraggingSticker] = useState(null);
    const [selectedSticker, setSelectedSticker] = useState(null);
    const row = { display: "flex", gap: 40, alignItems: "flex-start" };
    const [cameraReady, setCameraReady] = useState(false);

    // useEffects

    const drawCanvas = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas || !frameImgRef.current) return;

        const ctx = canvas.getContext("2d");

        const frameWidth = frameImgRef.current.width;
        const frameHeight = frameImgRef.current.height;
        canvas.width = frameWidth;
        canvas.height = frameHeight;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        photos.forEach(p => {
            const slot = SLOTS[p.slotIndex];
            const drawW = p.img.width * p.scale;
            const drawH = p.img.height * p.scale;
            const dx = slot.x + p.offsetX;
            const dy = slot.y + p.offsetY;

            ctx.save();
            ctx.beginPath();
            ctx.rect(slot.x, slot.y, SLOT_WIDTH, SLOT_HEIGHT);
            ctx.clip();
            ctx.drawImage(p.img, dx, dy, drawW, drawH);
            ctx.restore();
        });
        ctx.drawImage(frameImgRef.current, 0, 0, frameWidth, frameHeight);

        stickers.forEach((s, i) => {
            const size = STICKER_BASE_SIZE * (s.scale ?? 1);
            const cx = s.x + size / 2;
            const cy = s.y + size / 2;
            const angle = ((s.rotation ?? 0) * Math.PI) / 180;

            ctx.save();
            ctx.translate(cx, cy);
            ctx.rotate(angle);
            ctx.drawImage(s.img, -size / 2, -size / 2, size, size);
            if (i === selectedSticker) {
                ctx.strokeStyle = "#ff7aa2";
                ctx.lineWidth = 4;
                ctx.strokeRect(-size / 2, -size / 2, size, size);
            }
            ctx.restore();
        });
    }, [photos, stickers, selectedSticker]);

    // frames
    useEffect(() => {
        if (!selectedFrame) return;
        const img = new Image();
        img.src = selectedFrame;

        img.onload = () => {
            frameImgRef.current = img;
            drawCanvas();
        }
    }, [selectedFrame, drawCanvas]);

    useEffect(drawCanvas, [photos, stickers, selectedSticker, photoCount, mode, drawCanvas]);

    const handleBack = () => {
        if (mode === "decorate") {
            setMode("photo");
            setCanTakePhoto(false);
            setStickers([]);
            setSelectedSticker(null);
        } else {
            setSelectedFrame(null);
            setPhotos([]);
            setPhotoCount(0);
            setStickers([]);
            setSelectedSticker(null);
            setMode("photo");
            setCanTakePhoto(true);
        }
    };

    // photos
    const addPhoto = img => {
        if (photoCount >= 4) return;

        const scaleX = SLOT_WIDTH / img.width;
        const scaleY = SLOT_HEIGHT / img.height;
        const scale = Math.max(scaleX, scaleY);

        const drawW = img.width * scale;
        const drawH = img.height * scale;


        const offsetX = (SLOT_WIDTH - drawW) / 2;
        const offsetY = (SLOT_HEIGHT - drawH) / 2;

        setPhotos(p => [
            ...p,
            { img, slotIndex: photoCount, scale, offsetX, offsetY }
        ]);

        setCanTakePhoto(true);

        setPhotoCount(c => {
            const next = c + 1;
            if (next === 4) setMode("decorate");
            return next;
        });
    };

    const takePhotoNow = () => {
        const src = webcamRef.current.getScreenshot();
        if (!src) return;
        const img = new Image();
        img.src = src;
        img.onload = () => addPhoto(img);
    };

    const capturePhoto = () => {
        if (!canTakePhoto || countdown !== null) return;

        setCanTakePhoto(false);
        setCountdown(3);

        let current = 3;
        const interval = setInterval(() => {
            current -= 1;

            if (current === 0) {
                clearInterval(interval);
                setCountdown(null);
                takePhotoNow();
            } else {
                setCountdown(current);
            }
        }, 1000);
    };

    // Kept for future "upload your own photo" feature (e.g. wire up to an <input type="file"> onChange)
    // eslint-disable-next-line no-unused-vars
    const uploadPhoto = e => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => {
            const img = new Image();
            img.src = reader.result;
            img.onload = () => addPhoto(img);
        };

        reader.readAsDataURL(file);
        e.target.value = "";
    };

    const redoLastPhoto = () => {
        if (!photos.length) return;
        setPhotos(p => p.slice(0, -1));
        setPhotoCount(c => Math.max(0, c - 1));
        setCanTakePhoto(true);
    };

    const clearPhotos = () => {
        setPhotos([]);
        setPhotoCount(0);
        setCanTakePhoto(true);
        setCountdown(null);
    };

    const getCoords = e => {
        const r = canvasRef.current.getBoundingClientRect();
        return {
            x: (e.clientX - r.left) * (canvasRef.current.width / r.width),
            y: (e.clientY - r.top) * (canvasRef.current.height / r.height)
        };
    };

    // drag photos
    const handleMouseDown = e => {
        const { x, y } = getCoords(e);
        if (mode === "photo") {
            for (let i = photos.length - 1; i >= 0; i--) {
                const p = photos[i];
                const slot = SLOTS[p.slotIndex];
                const w = p.img.width * p.scale;
                const h = p.img.height * p.scale;

                if (
                    x >= slot.x + p.offsetX &&
                    x <= slot.x + p.offsetX + w &&
                    y >= slot.y + p.offsetY &&
                    y <= slot.y + p.offsetY + h
                ) {
                    setDraggingPhoto(i);
                    setDragOffset({
                        x: x - slot.x - p.offsetX,
                        y: y - slot.y - p.offsetY
                    });
                    return;
                }

            }
        }

        if (mode === "decorate") {
            for (let i = stickers.length - 1; i >= 0; i--) {
                const s = stickers[i];
                const size = STICKER_BASE_SIZE * (s.scale ?? 1);
                if (x >= s.x && x <= s.x + size && y >= s.y && y <= s.y + size) {
                    setDraggingSticker(i);
                    setSelectedSticker(i);
                    setDragOffset({ x: x - s.x, y: y - s.y });
                    return;
                }
            }
            setSelectedSticker(null); // เพิ่มบรรทัดนี้ — คลิกพื้นที่ว่างแล้ว deselect
        }
    };

    const handleMouseMove = e => {
        const { x, y } = getCoords(e);

        if (draggingPhoto !== null && mode === "photo") {
            setPhotos(prev => {
                const updated = [...prev];
                const p = updated[draggingPhoto];
                const slot = SLOTS[p.slotIndex];
                const w = p.img.width * p.scale;
                const h = p.img.height * p.scale;

                p.offsetX = x - slot.x - dragOffset.x;
                p.offsetY = y - slot.y - dragOffset.y;
                p.offsetX = Math.min(Math.max(p.offsetX, SLOT_WIDTH - w), 0);
                p.offsetY = Math.min(Math.max(p.offsetY, SLOT_HEIGHT - h), 0);

                return updated;
            });
        }

        if (draggingSticker != null && mode === "decorate") {
            setStickers(s => {
                const u = [...s];
                u[draggingSticker] = {
                    ...u[draggingSticker],
                    x: x - dragOffset.x,
                    y: y - dragOffset.y
                };
                return u;
            });
        }
    };

    const handleMouseUp = () => {
        setDraggingPhoto(null);

        if (draggingSticker != null) {
            const s = stickers[draggingSticker];
            if (s) {
                const size = STICKER_BASE_SIZE * (s.scale ?? 1);
                const cx = s.x + size / 2;
                const cy = s.y + size / 2;
                const outOfBounds =
                    cx < 0 || cy < 0 ||
                    cx > canvasRef.current.width ||
                    cy > canvasRef.current.height;

                if (outOfBounds) {
                    setStickers(prev => prev.filter((_, i) => i !== draggingSticker));
                    setSelectedSticker(null);
                }
            }
        }

        setDraggingSticker(null);
    };

    // add Sticker
    const addSticker = src => {
        const img = new Image();
        img.src = src;
        img.onload = () => {
            setStickers(s => {
                const next = [...s, { img, x: 400, y: 100, scale: 1, rotation: 0 }];
                setSelectedSticker(next.length - 1);
                return next;
            });
        };
    };

    const setSelectedStickerScale = scale => {
        if (selectedSticker == null) return;
        const clamped = Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale));
        setStickers(s => {
            const u = [...s];
            u[selectedSticker] = { ...u[selectedSticker], scale: clamped };
            return u;
        });
    };

    const nudgeSelectedStickerScale = delta =>
        setSelectedStickerScale((stickers[selectedSticker]?.scale ?? 1) + delta);

    const setSelectedStickerRotation = deg => {
        if (selectedSticker == null) return;
        setStickers(s => {
            const u = [...s];
            u[selectedSticker] = { ...u[selectedSticker], rotation: deg };
            return u;
        });
    };

    const nudgeSelectedStickerRotation = delta =>
        setSelectedStickerRotation((stickers[selectedSticker]?.rotation ?? 0) + delta);

    const handleDone = () => {
        setSelectedSticker(null);
        setMode("finish");
    };

    // delete Sticker
    useEffect(() => {
        const handleKeyDown = e => {
            if ((e.key === "Delete" || e.key === "Backspace") && selectedSticker != null && mode === "decorate") {
                setStickers(s => s.filter((_, i) => i !== selectedSticker));
                setSelectedSticker(null);
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [selectedSticker, mode]);

    //download

    const downloadPhoto = () => {
        const a = document.createElement("a");
        a.href = canvasRef.current.toDataURL("image/png");
        a.download = "photo-strip.png";
        a.click();
    };

    return (
        <div style={centerCol}>
            {/* top bar with back btn and text */}
            <div style={topBar}>
                <h1 style={titleBar}>
                    {!selectedFrame
                        ? "Choose your platten"
                        : mode === "photo"
                            ? "Take camera"
                            : mode === "decorate"
                                ? "Let’s decorate"
                                : "Finish !"}

                </h1>

            </div>
            <div style={mainContent} >
                {!selectedFrame ? (
                    <div style={{ display: "flex", gap: 24 }}>
                        {frameOptions.map((src) => {
                            const isSelected = selectedFrame === src;
                            return (
                                <img
                                    key={src}
                                    src={src}
                                    alt="frame"
                                    onClick={() => setSelectedFrame(src)}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = "scale(1.08)";
                                        e.currentTarget.style.boxShadow = "0 12px 30px rgba(0, 0, 0, 0.30)";
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = "scale(1)";
                                        e.currentTarget.style.boxShadow = frameThumb.boxShadow;

                                    }}
                                    style={{
                                        ...frameThumb,
                                        transform: isSelected ? "scale(1.08)" : "scale(1)",
                                        transition: "transform 0.25s ease, box-shadow 0.25s ease",
                                        boxShadow: isSelected ? "0 12px 30px rgba(0, 0, 0, 0.45)" : frameThumb.boxShadow,
                                    }}

                                />
                            )
                        })}
                    </div>
                ) : mode === "finish" ? (
                    <div style={finishWrap}>
                        <canvas
                            ref={canvasRef}
                            style={{
                                width: 200,
                                height: 500,
                                boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
                            }}
                        />
                        <button
                            style={{ ...buttonStyle, marginTop: 20, width: 220 }}
                            onClick={downloadPhoto}
                        >
                            Download
                        </button>
                    </div>
                ) : (
                    <div style={row}>
                        {/* Display frame */}
                        <div>
                            {selectedFrame && (
                                <button
                                    style={{
                                        marginBottom: 18,
                                        // padding: "8px 16px",
                                        border: "none",
                                        fontSize: 20,
                                        background: "white",
                                        fontFamily: "Inria Serif",
                                        display: "flex",
                                        flexDirection: "row",
                                        alignItems: "start",
                                        fontStyle: "italic",
                                        fontWeight: "bold",
                                    }}
                                    onClick={handleBack}
                                >
                                    <img src="./assets/icon/Back.png" alt="Back" style={{ width: "23px", paddingRight: "5px", }} /> Back
                                </button>
                            )}
                            <canvas ref={canvasRef}
                                style={{
                                    width: 200,
                                    height: 500,
                                    // borderRadius: 16,
                                    boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
                                }}
                                onMouseDown={handleMouseDown}
                                onMouseMove={handleMouseMove}
                                onMouseUp={handleMouseUp}
                            />

                            {mode === "decorate" && (
                                <div style={{
                                    marginTop: 16,
                                    display: "flex",
                                    justifyContent: "center",
                                }}>
                                    {/* <button style={buttonStyle} onClick={downloadPhoto}>
                                        Download
                                    </button> */}
                                </div>
                            )}
                        </div>

                        <div>
                            {mode === "photo" && (
                                <>
                                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: 40, }}>
                                        <div style={webcamWrapper}>
                                            {/* Webcam */}
                                            <Webcam
                                                audio={false}
                                                ref={webcamRef}
                                                screenshotFormat="image/png"
                                                videoConstraints={videoConstraints}
                                                mirrored={true}
                                                onUserMedia={() => setCameraReady(true)}
                                                style={{
                                                    width: "100%",
                                                    opacity: cameraReady ? 1 : 0,
                                                    transition: "opacity .3s",
                                                }}
                                            />
                                            {!cameraReady && (
                                                <div style={cameraLoading}>
                                                    Opening camera...
                                                </div>
                                            )}

                                            {/* Overlay countdown */}

                                            {countdown != null && (
                                                <div style={
                                                    countdownOverlay
                                                }
                                                >
                                                    {countdown}
                                                </div>
                                            )}
                                            {canTakePhoto && (
                                                <button style={shutterButton} onClick={capturePhoto}>
                                                    <img src="./assets/icon/Camera.png" alt="Shutter" style={{ width: "90%" }} />
                                                </button>
                                            )}
                                        </div>

                                        {/* Buttons */}
                                        <div
                                            style={{
                                                marginTop: 16,
                                                display: "flex",
                                                gap: 12,
                                                width: "100%",
                                            }}
                                        >
                                            <button
                                                style={{
                                                    ...buttonStyle,
                                                    opacity: photoCount === 0 ? 0.5 : 1,
                                                    cursor: photoCount === 0 ? "not-allowed" : "pointer",
                                                }}
                                                onClick={redoLastPhoto}
                                                disabled={photoCount === 0}
                                            >
                                                REDO
                                            </button>

                                            <button
                                                style={{
                                                    ...buttonStyle,
                                                    opacity: photoCount === 0 ? 0.5 : 1,
                                                    cursor: photoCount === 0 ? "not-allowed" : "pointer",
                                                }}
                                                onClick={clearPhotos}
                                                disabled={photoCount === 0}
                                            >
                                                CLEAR
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}

                            {mode === "decorate" && (
                                <div style={{ marginTop: 8 }}>
                                    <div style={stickerGrid}>
                                        {stickerOptions.map((src) => (
                                            <img
                                                key={src}
                                                src={src}
                                                alt="sticker"
                                                onClick={() => addSticker(src)}
                                                style={stickerThumb}
                                            />
                                        ))}
                                    </div>

                                    <div style={toolboxBox}>
                                        <div style={{ width: "100%", padding: 14, opacity: selectedSticker == null ? 0.4 : 1 }}>
                                            <div style={toolboxRow}>
                                                <button style={toolboxIconBtn} disabled={selectedSticker == null} onClick={() => nudgeSelectedStickerScale(-0.15)}>−</button>
                                                <input
                                                    type="range"
                                                    min={MIN_SCALE}
                                                    max={MAX_SCALE}
                                                    step={0.05}
                                                    disabled={selectedSticker == null}
                                                    value={selectedSticker == null ? 1 : stickers[selectedSticker]?.scale ?? 1}
                                                    onChange={(e) => setSelectedStickerScale(parseFloat(e.target.value))}
                                                    style={{ flex: 1 }}
                                                />
                                                <button style={toolboxIconBtn} disabled={selectedSticker == null} onClick={() => nudgeSelectedStickerScale(0.15)}>+</button>
                                            </div>

                                            <div style={{ ...toolboxRow, marginTop: 14, justifyContent: "center" }}>
                                                <button style={toolboxIconBtn} disabled={selectedSticker == null} onClick={() => nudgeSelectedStickerRotation(-15)}>⟲</button>
                                                <button style={toolboxIconBtn} disabled={selectedSticker == null} onClick={() => nudgeSelectedStickerRotation(15)}>⟳</button>
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{
                                        marginTop: 16,
                                        display: "flex",
                                        justifyContent: "center",
                                    }}>
                                        <button style={buttonStyle} onClick={handleDone}>Done</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )
                }
            </div>
        </div>
    )
}

// styles
const centerCol = {
    display: "flex",
    // background: "#F4F1E9",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",   // เพิ่มบรรทัดนี้
    gap: 20,
    minHeight: "100vh",
    width: "100%",
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
// const buttonStyle = {
//     padding: "10px 20px",
//     fontSize: 20,
//     cursor: "pointer",
//     fontFamily: "CantikaCute",
//     color: "#8c5b4a",
//     border: "2px solid #8c5b4a",
//     borderRadius: 8,
//     background: "white"
// };
const buttonStyle = {
    flex: 1,
    padding: "12px 0",
    fontSize: 20,
    cursor: "pointer",
    fontFamily: "Inria Serif",
    fontWeight: "bold",
    // color: "#8c5b4a",
    border: "1px solid #424040",
    borderRadius: 999,
    background: "#f4ede1",
    textAlign: "center",
};

const frameThumb = {
    width: 180,
    cursor: "pointer",
    // borderRadius: 12,
    border: "2px solid rgb(0, 0, 0,0.15)",
    boxShadow: "0 8px 8px rgba(0,0,0,0.15)",
    // background:"white",
};

const titleBar = {
    margin: 0,
    lineHeight: "60px",      // vertical center
    textAlign: "center",     // horizontal center
    width: "100%",            // occupy full width of top bar
    fontFamily: "Inria Serif",
    fontSize: 50,
    fontStyle: "italic",
    color: "black",
}

const mainContent = {
    height: 600, // fixed content height
    width: 700,
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
}
const webcamWrapper = {
    position: "relative",
    width: 550,
    height: 390,
    overflow: "hidden",
    padding: 20,
    background: "white",
    borderRadius: 5,
    border: "1px solid #4D4D4D",
    // boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
};

const shutterButton = {
    position: "absolute",
    bottom: 30,
    left: "50%",
    transform: "translateX(-50%)",
    width: 45,
    height: 45,
    borderRadius: "50%",
    border: "none",
    background: "white",
    fontSize: 22,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
};

const countdownOverlay = {
    position: "absolute",
    inset: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 96,
    fontWeight: "bold",
    color: "white",
    textShadow: "0 4px 20px rgba(0,0,0,0.6)",
    background: "rgba(0,0,0,0.25)",
    borderRadius: 14,
    pointerEvents: "none",
};
const cameraLoading = {
    position: "absolute",
    inset: 0,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#f5f5f5",
};

const stickerGrid = {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 20,
    justifyItems: "center",
    marginBottom: 20,
};
const stickerThumb = { width: 60, cursor: "pointer" };
const toolboxBox = {
    width: "100%",
    minHeight: 130,
    borderRadius: 8,
    // background: "#e2e2e2",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
};
const toolboxRow = { display: "flex", alignItems: "center", gap: 10 };
const toolboxIconBtn = {
    width: 30, height: 30, borderRadius: "50%",
    border: "1px solid #424040", background: "white",
    fontSize: 18, lineHeight: 1, cursor: "pointer",
};
const finishWrap = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    marginTop: 20,
};