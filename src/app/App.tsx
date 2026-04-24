import { useState } from 'react';
import MainScreen from './components/MainScreen';
import ServerScreen from './components/ServerScreen';
import PremiumScreen from './components/PremiumScreen';
import SettingsScreen from './components/SettingsScreen';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('main');

  return (
    <div className="size-full flex items-center justify-center" style={{ backgroundColor: '#0B0F19' }}>
      <div className="w-full max-w-md h-full max-h-[900px] overflow-hidden rounded-3xl shadow-2xl">
        {currentScreen === 'main' && <MainScreen onNavigate={setCurrentScreen} />}
        {currentScreen === 'servers' && <ServerScreen onNavigate={setCurrentScreen} />}
        {currentScreen === 'premium' && <PremiumScreen onNavigate={setCurrentScreen} />}
        {currentScreen === 'settings' && <SettingsScreen onNavigate={setCurrentScreen} />}
      </div>
    </div>
  );
}
