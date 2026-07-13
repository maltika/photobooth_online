import React, { useState } from "react";

export default function WelcomePage({ onStart }) {

    const [hover, setHover] = useState(false);

    return (
        <div style={pageStyle}>
            <h1 style={welcomeText}>
                Welcome !
            </h1>
            <button style={{
                ...startButton,
                transform: hover ? "translateY(-2px)" : "translateY(0)",
                boxShadow: hover ? "0 8px 20px rgba(140, 91, 74 ,0.25)" : "0 2px 8px rgba(140, 91, 74 ,0.12)",
            }}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            onClick={onStart}
            >
                START
            </button>
        </div>
    );
}

const pageStyle = {
    width: "100vw",
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 28,
    // background:
    //     "radial-gradient(circle at 15% 20%, rgba(197, 219, 241, 0.55), transparent 30%), " +
    //     "radial-gradient(circle at 85% 85%, rgba(255, 182, 203, 0.55), transparent 30%), " +
    //     "#F6F1E9",
    fontFamily: "CantikaCute, 'Playfair Display', Georgia, serif",
};

const welcomeText = {
    margin: 0,
    fontSize: 80,
    fontFamily: "Inria Serif",
    fontStyle: "italic",
    fontWeight: "bold",
    color: "#2b2320",
    letterSpacing: 1,
};

const startButton = {
    padding: "14px 48px",
    fontSize: 30,
    letterSpacing: 2,
    fontFamily: "Inria Serif",
    fontWeight: "bold",
    color: "#2b2320",
    background:"transparent",
    border: "1.5px solid #2b2320",
    borderRadius: 999,
    cursor: "pointer",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
};