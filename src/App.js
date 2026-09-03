import './App.css';
import React from 'react';
import Photobooth from './components/Photobooth';
import './style/global.css';
//logo
// const logoSrc = '/assets/logo/jiggleduo-logo.png';
function App() {
  return (
    <div className="App" style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    }}>
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