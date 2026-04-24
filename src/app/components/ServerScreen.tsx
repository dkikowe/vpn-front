import { useState } from 'react';
import { Search, ArrowLeft, Home, MapPin, Settings, CheckCircle } from 'lucide-react';

interface Server {
  country: string;
  city: string;
  flag: string;
  signal: number;
  ping: number;
  active?: boolean;
  premium?: boolean;
}

interface ServerScreenProps {
  onNavigate: (screen: string) => void;
}

export default function ServerScreen({ onNavigate }: ServerScreenProps) {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(0);

  const servers: Server[] = [
    { country: 'Германия', city: 'Франкфурт', flag: '🇩🇪', signal: 5, ping: 18, active: true },
    { country: 'США', city: 'Нью-Йорк', flag: '🇺🇸', signal: 4, ping: 92 },
    { country: 'Великобритания', city: 'Лондон', flag: '🇬🇧', signal: 5, ping: 32 },
    { country: 'Япония', city: 'Токио', flag: '🇯🇵', signal: 3, ping: 145 },
    { country: 'Франция', city: 'Париж', flag: '🇫🇷', signal: 5, ping: 24 },
    { country: 'Канада', city: 'Торонто', flag: '🇨🇦', signal: 4, ping: 105 },
    { country: 'Австралия', city: 'Сидней', flag: '����🇺', signal: 3, ping: 210, premium: true },
    { country: 'Сингапур', city: 'Сингапур', flag: '🇸🇬', signal: 4, ping: 178, premium: true },
    { country: 'Нидерланды', city: 'Амстердам', flag: '🇳🇱', signal: 5, ping: 22 },
    { country: 'Швейцария', city: 'Цюрих', flag: '🇨🇭', signal: 5, ping: 28 },
    { country: 'Швеция', city: 'Стокгольм', flag: '🇸🇪', signal: 4, ping: 35 },
    { country: 'Бразилия', city: 'Сан-Паулу', flag: '🇧🇷', signal: 3, ping: 190, premium: true },
  ];

  const filtered = servers.filter(
    (s) =>
      s.country.toLowerCase().includes(query.toLowerCase()) ||
      s.city.toLowerCase().includes(query.toLowerCase())
  );

  const getPingColor = (ping: number) => {
    if (ping < 50) return '#10b981';
    if (ping < 120) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <div className="h-full flex flex-col" style={{ backgroundColor: '#0B0F19', fontFamily: 'Inter, sans-serif' }}>
      {/* Header */}
      <div className="px-6 pt-6 pb-4">
        <div className="flex items-center gap-4 mb-5">
          <button
            onClick={() => onNavigate('main')}
            className="w-9 h-9 rounded-2xl flex items-center justify-center text-gray-400 hover:text-white transition-colors"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-white text-xl">Выбор сервера</h2>
        </div>

        {/* Search Bar */}
        <div
          className="rounded-2xl px-4 py-3 flex items-center gap-3"
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}
        >
          <Search className="w-5 h-5 text-gray-500 flex-shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Поиск по стране или городу..."
            className="bg-transparent text-white placeholder-gray-500 outline-none flex-1 text-sm"
          />
        </div>

        <div className="flex items-center gap-3 mt-3">
          <span className="text-gray-500 text-xs">{filtered.length} серверов доступно</span>
        </div>
      </div>

      {/* Server List */}
      <div className="flex-1 overflow-y-auto px-6 pb-4">
        <div className="space-y-2.5">
          {filtered.map((server, index) => {
            const isSelected = selected === index;
            return (
              <div
                key={index}
                onClick={() => {
                  if (!server.premium) setSelected(index);
                  else onNavigate('premium');
                }}
                className="rounded-2xl p-4 cursor-pointer transition-all hover:scale-[1.02]"
                style={{
                  background: isSelected
                    ? 'linear-gradient(135deg, rgba(6,182,212,0.15), rgba(168,85,247,0.12))'
                    : 'rgba(255,255,255,0.04)',
                  backdropFilter: 'blur(10px)',
                  border: isSelected
                    ? '1.5px solid rgba(6,182,212,0.5)'
                    : '1px solid rgba(255,255,255,0.08)',
                  boxShadow: isSelected ? '0 0 20px rgba(6,182,212,0.2)' : 'none',
                  opacity: server.premium ? 0.7 : 1
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl flex-shrink-0"
                      style={{ background: 'rgba(255,255,255,0.08)' }}
                    >
                      {server.flag}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-white text-sm">{server.city}</p>
                        {server.premium && (
                          <span
                            className="text-xs px-2 py-0.5 rounded-full"
                            style={{
                              background: 'linear-gradient(90deg, rgba(6,182,212,0.2), rgba(168,85,247,0.2))',
                              border: '1px solid rgba(168,85,247,0.4)',
                              color: '#c084fc'
                            }}
                          >
                            Премиум
                          </span>
                        )}
                      </div>
                      <p className="text-gray-500 text-xs">{server.country}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p
                        className="text-xs"
                        style={{ color: getPingColor(server.ping) }}
                      >
                        {server.ping} мс
                      </p>
                      <div className="flex items-center gap-0.5 justify-end mt-1">
                        {[...Array(5)].map((_, i) => (
                          <div
                            key={i}
                            className="w-1 rounded-full"
                            style={{
                              height: `${6 + i * 2.5}px`,
                              backgroundColor: i < server.signal ? '#10b981' : '#1f2937'
                            }}
                          />
                        ))}
                      </div>
                    </div>
                    {isSelected && (
                      <CheckCircle className="w-5 h-5 text-cyan-400 flex-shrink-0" />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
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
          <button
            className="flex flex-col items-center gap-1 text-gray-500 hover:text-gray-300 transition-colors"
            onClick={() => onNavigate('main')}
          >
            <Home className="w-6 h-6" />
            <span className="text-xs">Главная</span>
          </button>
          <button className="flex flex-col items-center gap-1" style={{ color: '#06b6d4' }}>
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
