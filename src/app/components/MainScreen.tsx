import { useState } from 'react';
import { Home, MapPin, Settings, Shield, Zap, Clock } from 'lucide-react';

interface MainScreenProps {
  onNavigate: (screen: string) => void;
}

export default function MainScreen({ onNavigate }: MainScreenProps) {
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);

  const handleConnect = () => {
    if (connected) {
      setConnected(false);
      return;
    }
    setConnecting(true);
    setTimeout(() => {
      setConnecting(false);
      setConnected(true);
    }, 1800);
  };

  return (
    <div className="h-full flex flex-col" style={{ backgroundColor: '#0B0F19', fontFamily: 'Inter, sans-serif' }}>
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 pt-6 pb-2">
        <div
          className="px-3 py-1 rounded-full text-xs flex items-center gap-1"
          style={{
            background: connected ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
            border: connected ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)',
            color: connected ? '#10b981' : '#ef4444'
          }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: connected ? '#10b981' : '#ef4444' }}
          />
          {connecting ? 'Подключение...' : connected ? 'Защищено' : 'Не защищено'}
        </div>
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4" style={{ color: connected ? '#06b6d4' : '#4b5563' }} />
          <span className="text-sm" style={{ color: connected ? '#06b6d4' : '#4b5563' }}>
            {connected ? 'VPN Активен' : 'VPN Выкл'}
          </span>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <div className="text-center mb-8">
          <p className="text-gray-400 text-sm mb-1">Статус соединения</p>
          <h1
            className="text-3xl"
            style={{
              color: connecting ? '#f59e0b' : connected ? '#10b981' : 'white',
              transition: 'color 0.5s ease'
            }}
          >
            {connecting ? 'Подключение...' : connected ? 'Подключено' : 'Отключено'}
          </h1>
          {connected && (
            <p className="text-gray-500 text-sm mt-1">Ваш IP скрыт</p>
          )}
        </div>

        {/* Connect Button */}
        <div className="relative mb-10">
          <div
            className="absolute inset-0 rounded-full transition-all duration-700"
            style={{
              background: connected
                ? 'radial-gradient(circle, rgba(16,185,129,0.4) 0%, transparent 70%)'
                : connecting
                  ? 'radial-gradient(circle, rgba(245,158,11,0.35) 0%, transparent 70%)'
                  : 'radial-gradient(circle, rgba(6,182,212,0.35) 0%, transparent 70%)',
              filter: 'blur(20px)',
              transform: 'scale(1.3)'
            }}
          />
          <button
            onClick={handleConnect}
            className="relative w-56 h-56 rounded-full flex items-center justify-center transition-transform hover:scale-105 active:scale-95"
            style={{
              background: connected
                ? 'linear-gradient(135deg, #059669, #10b981)'
                : connecting
                  ? 'linear-gradient(135deg, #d97706, #f59e0b)'
                  : 'linear-gradient(135deg, #0891b2, #a855f7)',
              boxShadow: connected
                ? '0 0 60px rgba(16,185,129,0.4), inset 0 1px 0 rgba(255,255,255,0.2)'
                : connecting
                  ? '0 0 60px rgba(245,158,11,0.4), inset 0 1px 0 rgba(255,255,255,0.2)'
                  : '0 0 60px rgba(6,182,212,0.3), inset 0 1px 0 rgba(255,255,255,0.2)',
              transition: 'all 0.5s ease'
            }}
          >
            <div
              className="w-48 h-48 rounded-full flex flex-col items-center justify-center gap-2"
              style={{
                background: connected
                  ? 'linear-gradient(135deg, #065f46, #059669)'
                  : connecting
                    ? 'linear-gradient(135deg, #92400e, #d97706)'
                    : 'linear-gradient(135deg, #0e7490, #7c3aed)',
              }}
            >
              <Shield className="w-10 h-10 text-white opacity-90" />
              <span className="text-white text-lg">
                {connecting ? '...' : connected ? 'Отключить' : 'Подключить'}
              </span>
            </div>
          </button>
        </div>

        {/* Stats row (shown when connected) */}
        {connected && (
          <div className="w-full max-w-sm grid grid-cols-2 gap-3 mb-4">
            <div
              className="rounded-2xl p-4 flex items-center gap-3"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.08)'
              }}
            >
              <Zap className="w-5 h-5 text-cyan-400" />
              <div>
                <p className="text-gray-500 text-xs">Скорость</p>
                <p className="text-white text-sm">87 Мбит/с</p>
              </div>
            </div>
            <div
              className="rounded-2xl p-4 flex items-center gap-3"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.08)'
              }}
            >
              <Clock className="w-5 h-5 text-purple-400" />
              <div>
                <p className="text-gray-500 text-xs">Время</p>
                <p className="text-white text-sm">00:03:42</p>
              </div>
            </div>
          </div>
        )}

        {/* Server Card */}
        <div
          className="w-full max-w-sm rounded-3xl p-5 cursor-pointer hover:scale-105 transition-transform"
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}
          onClick={() => onNavigate('servers')}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-yellow-400 to-red-500 flex items-center justify-center text-xl">
                🇩🇪
              </div>
              <div>
                <p className="text-gray-400 text-xs">Текущий сервер</p>
                <p className="text-white">Франкфурт, Германия</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="w-1 rounded-full"
                  style={{
                    height: `${8 + i * 3}px`,
                    backgroundColor: i < 5 ? '#10b981' : '#374151'
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div
        className="rounded-t-3xl px-6 py-4"
        style={{
          background: 'rgba(255, 255, 255, 0.04)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderBottom: 'none'
        }}
      >
        <div className="flex items-center justify-around max-w-sm mx-auto">
          <button className="flex flex-col items-center gap-1" style={{ color: '#06b6d4' }}>
            <Home className="w-6 h-6" />
            <span className="text-xs">Главная</span>
          </button>
          <button
            className="flex flex-col items-center gap-1 text-gray-500 hover:text-gray-300 transition-colors"
            onClick={() => onNavigate('servers')}
          >
            <MapPin className="w-6 h-6" />
            <span className="text-xs">Серверы</span>
          </button>
          <button
            className="flex flex-col items-center gap-1 text-gray-500 hover:text-gray-300 transition-colors"
            onClick={() => onNavigate('settings')}
          >
            <Settings className="w-6 h-6" />
            <span className="text-xs">Настройки</span>
          </button>
        </div>
      </div>
    </div>
  );
}
