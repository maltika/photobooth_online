import './App.css';
import React from 'react';
import Photobooth from './components/Photobooth';
import './style/global.css';
//logo
const logoSrc = '/assets/logo/jiggleduo-logo.png';

function App() {
  return (
    <div className="App" style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '1200px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '20px 32px',
      }}>
        <img src={logoSrc} alt="logo" style={{ width: 50}} />
        <h1 style={{
          fontFamily: 'Cantika Cute',
          color: '#8c5b4a',
          margin: 0,
        }}>
          Photo Booth Online
        </h1>
      </div>

      <div style={{
        flex: 1,
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        paddingBottom: '40px',
      }}>
        <Photobooth />
      </div>
    </div>
  );
}

export default App;
