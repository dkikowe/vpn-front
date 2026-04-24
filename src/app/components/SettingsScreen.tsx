import { useState } from 'react';
import {
  Home, MapPin, Settings, ChevronRight,
  Bell, Shield, Globe, Wifi, Eye, LogOut,
  Moon, Key, HelpCircle, FileText, Zap,
  User, Edit3, Star
} from 'lucide-react';

interface SettingsScreenProps {
  onNavigate: (screen: string) => void;
}

interface ToggleProps {
  enabled: boolean;
  onToggle: () => void;
}

function Toggle({ enabled, onToggle }: ToggleProps) {
  return (
    <button
      onClick={onToggle}
      className="relative w-11 h-6 rounded-full transition-all duration-300 flex-shrink-0"
      style={{
        background: enabled
          ? 'linear-gradient(90deg, #06b6d4, #a855f7)'
          : 'rgba(255,255,255,0.1)'
      }}
    >
      <span
        className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all duration-300"
        style={{ left: enabled ? '22px' : '2px' }}
      />
    </button>
  );
}

export default function SettingsScreen({ onNavigate }: SettingsScreenProps) {
  const [killSwitch, setKillSwitch] = useState(true);
  const [autoConnect, setAutoConnect] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [dnsLeak, setDnsLeak] = useState(true);
  const [darkMode, setDarkMode] = useState(true);

  const protocol = 'WireGuard';

  return (
    <div className="h-full flex flex-col" style={{ backgroundColor: '#0B0F19', fontFamily: 'Inter, sans-serif' }}>
      {/* Header */}
      <div className="px-6 pt-6 pb-4 flex-shrink-0">
        <h1 className="text-white text-2xl mb-0">Настройки</h1>
        <p className="text-gray-500 text-sm">Управление аккаунтом и приложением</p>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-6 pb-4 space-y-4">

        {/* Profile Card */}
        <div
          className="rounded-3xl p-5"
          style={{
            background: 'linear-gradient(135deg, rgba(6,182,212,0.12), rgba(168,85,247,0.1))',
            border: '1px solid rgba(6,182,212,0.25)'
          }}
        >
          <div className="flex items-center gap-4">
            <div className="relative">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                style={{
                  background: 'linear-gradient(135deg, #0891b2, #7c3aed)',
                  boxShadow: '0 0 20px rgba(6,182,212,0.3)'
                }}
              >
                👤
              </div>
              <div
                className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #06b6d4, #a855f7)' }}
              >
                <Edit3 className="w-2.5 h-2.5 text-white" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-white">Александр Иванов</h2>
              <p className="text-gray-400 text-sm truncate">alex.ivanov@mail.ru</p>
              <div
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full mt-1.5"
                style={{
                  background: 'rgba(168,85,247,0.15)',
                  border: '1px solid rgba(168,85,247,0.3)'
                }}
              >
                <Star className="w-3 h-3 text-purple-400" />
                <span className="text-xs text-purple-300">Бесплатный план</span>
              </div>
            </div>
            <button
              onClick={() => onNavigate('premium')}
              className="px-3 py-2 rounded-2xl text-white text-xs flex-shrink-0"
              style={{
                background: 'linear-gradient(135deg, #06b6d4, #a855f7)',
                boxShadow: '0 0 15px rgba(6,182,212,0.25)'
              }}
            >
              Upgrade
            </button>
          </div>

          {/* Usage stats */}
          <div className="mt-4 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-xs">Использовано трафика</span>
              <span className="text-white text-xs">2.1 ГБ / 5 ГБ</span>
            </div>
            <div className="h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.1)' }}>
              <div
                className="h-full rounded-full"
                style={{
                  width: '42%',
                  background: 'linear-gradient(90deg, #06b6d4, #a855f7)'
                }}
              />
            </div>
          </div>
        </div>

        {/* VPN Settings */}
        <div>
          <p className="text-gray-500 text-xs uppercase tracking-wider mb-2 px-1">Настройки VPN</p>
          <div
            className="rounded-3xl overflow-hidden"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)'
            }}
          >
            {/* Kill Switch */}
            <div className="flex items-center justify-between p-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(239,68,68,0.15)' }}>
                  <Shield className="w-4 h-4 text-red-400" />
                </div>
                <div>
                  <p className="text-white text-sm">Kill Switch</p>
                  <p className="text-gray-500 text-xs">Блокировать интернет при разрыве</p>
                </div>
              </div>
              <Toggle enabled={killSwitch} onToggle={() => setKillSwitch(!killSwitch)} />
            </div>

            {/* Auto Connect */}
            <div className="flex items-center justify-between p-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(6,182,212,0.15)' }}>
                  <Wifi className="w-4 h-4 text-cyan-400" />
                </div>
                <div>
                  <p className="text-white text-sm">Авто-подключение</p>
                  <p className="text-gray-500 text-xs">Подключаться при запуске</p>
                </div>
              </div>
              <Toggle enabled={autoConnect} onToggle={() => setAutoConnect(!autoConnect)} />
            </div>

            {/* DNS Leak */}
            <div className="flex items-center justify-between p-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(16,185,129,0.15)' }}>
                  <Eye className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <p className="text-white text-sm">Защита от DNS-утечек</p>
                  <p className="text-gray-500 text-xs">Скрыть DNS-запросы</p>
                </div>
              </div>
              <Toggle enabled={dnsLeak} onToggle={() => setDnsLeak(!dnsLeak)} />
            </div>

            {/* Protocol */}
            <div
              className="flex items-center justify-between p-4 cursor-pointer hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(168,85,247,0.15)' }}>
                  <Key className="w-4 h-4 text-purple-400" />
                </div>
                <div>
                  <p className="text-white text-sm">Протокол шифрования</p>
                  <p className="text-gray-500 text-xs">{protocol}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className="text-xs px-2 py-0.5 rounded-full"
                  style={{ background: 'rgba(6,182,212,0.1)', color: '#22d3ee' }}
                >
                  {protocol}
                </span>
                <ChevronRight className="w-4 h-4 text-gray-600" />
              </div>
            </div>
          </div>
        </div>

        {/* General Settings */}
        <div>
          <p className="text-gray-500 text-xs uppercase tracking-wider mb-2 px-1">Основные</p>
          <div
            className="rounded-3xl overflow-hidden"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)'
            }}
          >
            {/* Notifications */}
            <div className="flex items-center justify-between p-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(245,158,11,0.15)' }}>
                  <Bell className="w-4 h-4 text-amber-400" />
                </div>
                <p className="text-white text-sm">Уведомления</p>
              </div>
              <Toggle enabled={notifications} onToggle={() => setNotifications(!notifications)} />
            </div>

            {/* Dark Mode */}
            <div className="flex items-center justify-between p-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(99,102,241,0.15)' }}>
                  <Moon className="w-4 h-4 text-indigo-400" />
                </div>
                <p className="text-white text-sm">Тёмная тема</p>
              </div>
              <Toggle enabled={darkMode} onToggle={() => setDarkMode(!darkMode)} />
            </div>

            {/* Language */}
            <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-white/5 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(6,182,212,0.15)' }}>
                  <Globe className="w-4 h-4 text-cyan-400" />
                </div>
                <div>
                  <p className="text-white text-sm">Язык</p>
                  <p className="text-gray-500 text-xs">Русский</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-600" />
            </div>
          </div>
        </div>

        {/* Support & Info */}
        <div>
          <p className="text-gray-500 text-xs uppercase tracking-wider mb-2 px-1">Поддержка</p>
          <div
            className="rounded-3xl overflow-hidden"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)'
            }}
          >
            <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-white/5 transition-colors" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(16,185,129,0.15)' }}>
                  <Zap className="w-4 h-4 text-emerald-400" />
                </div>
                <p className="text-white text-sm">Перейти на Премиум</p>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-600" />
            </div>
            <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-white/5 transition-colors" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(59,130,246,0.15)' }}>
                  <HelpCircle className="w-4 h-4 text-blue-400" />
                </div>
                <p className="text-white text-sm">Центр помощи</p>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-600" />
            </div>
            <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-white/5 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(107,114,128,0.15)' }}>
                  <FileText className="w-4 h-4 text-gray-400" />
                </div>
                <p className="text-white text-sm">Политика конфиденциальности</p>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-600" />
            </div>
          </div>
        </div>

        {/* Logout */}
        <button
          className="w-full rounded-2xl py-4 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-95"
          style={{
            background: 'rgba(239,68,68,0.08)',
            border: '1px solid rgba(239,68,68,0.2)',
            color: '#f87171'
          }}
        >
          <LogOut className="w-4 h-4" />
          <span>Выйти из аккаунта</span>
        </button>

        <p className="text-center text-gray-600 text-xs pb-2">
          SecureVPN v2.4.1 · Все права защищены
        </p>
      </div>

      {/* Bottom Navigation */}
      <div
        className="rounded-t-3xl px-6 py-4 flex-shrink-0"
        style={{
          background: 'rgba(255, 255, 255, 0.04)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderBottom: 'none'
        }}
      >
        <div className="flex items-center justify-around max-w-sm mx-auto">
          <button
            className="flex flex-col items-center gap-1 text-gray-500 hover:text-gray-300 transition-colors"
            onClick={() => onNavigate('main')}
          >
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
          <button className="flex flex-col items-center gap-1" style={{ color: '#06b6d4' }}>
            <Settings className="w-6 h-6" />
            <span className="text-xs">Настройки</span>
          </button>
        </div>
      </div>
    </div>
  );
}
