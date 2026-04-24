import { ArrowLeft, Check, Zap, Globe, Shield, Headphones, Smartphone, Lock } from 'lucide-react';
import { useState } from 'react';

interface PricingPlan {
  name: string;
  duration: string;
  price: string;
  perMonth: string;
  savings?: string;
  bestValue?: boolean;
}

interface PremiumScreenProps {
  onNavigate: (screen: string) => void;
}

export default function PremiumScreen({ onNavigate }: PremiumScreenProps) {
  const [selectedPlan, setSelectedPlan] = useState(2);

  const plans: PricingPlan[] = [
    {
      name: '1 Месяц',
      duration: '1 месяц',
      price: '12.99$',
      perMonth: '12.99$/мес'
    },
    {
      name: '6 Месяцев',
      duration: '6 месяцев',
      price: '59.99$',
      perMonth: '9.99$/мес',
      savings: 'Скидка 23%'
    },
    {
      name: '12 Месяцев',
      duration: '12 месяцев',
      price: '89.99$',
      perMonth: '7.49$/мес',
      savings: 'Скидка 42%',
      bestValue: true
    }
  ];

  const features = [
    { icon: Zap, text: 'Безлимитный трафик' },
    { icon: Globe, text: 'Доступ ко всем серверам мира' },
    { icon: Shield, text: 'Защита от рекламы и трекеров' },
    { icon: Headphones, text: 'Приоритетная поддержка 24/7' },
    { icon: Smartphone, text: 'До 10 устройств одновременно' },
    { icon: Lock, text: 'Продвинутое шифрование AES-256' },
  ];

  return (
    <div className="h-full flex flex-col" style={{ backgroundColor: '#0B0F19', fontFamily: 'Inter, sans-serif' }}>
      {/* Header */}
      <div className="px-6 pt-6 pb-2 flex-shrink-0">
        <button
          onClick={() => onNavigate('main')}
          className="w-9 h-9 rounded-2xl flex items-center justify-center text-gray-400 hover:text-white transition-colors mb-5"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="text-center mb-2">
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-3 text-sm"
            style={{
              background: 'linear-gradient(90deg, rgba(6,182,212,0.15), rgba(168,85,247,0.15))',
              border: '1px solid rgba(168,85,247,0.3)',
              color: '#c084fc'
            }}
          >
            <Zap className="w-3.5 h-3.5" />
            VPN Премиум
          </div>
          <h1 className="text-white text-2xl mb-2">Разблокируйте полный доступ</h1>
          <p className="text-gray-400 text-sm">Молниеносная скорость без ограничений</p>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-6 pb-6">
        {/* Pricing Cards */}
        <div className="space-y-3 mb-6 mt-2">
          {plans.map((plan, index) => (
            <div
              key={index}
              onClick={() => setSelectedPlan(index)}
              className="relative rounded-3xl p-5 cursor-pointer transition-all hover:scale-[1.02]"
              style={{
                background: selectedPlan === index
                  ? 'linear-gradient(135deg, rgba(6,182,212,0.18), rgba(168,85,247,0.15))'
                  : 'rgba(255,255,255,0.04)',
                backdropFilter: 'blur(10px)',
                border: selectedPlan === index
                  ? '2px solid rgba(6,182,212,0.5)'
                  : '1px solid rgba(255,255,255,0.08)',
                boxShadow: selectedPlan === index
                  ? '0 0 30px rgba(6,182,212,0.2)'
                  : 'none'
              }}
            >
              {plan.bestValue && (
                <div
                  className="absolute -top-3 left-1/2 transform -translate-x-1/2 px-4 py-1 rounded-full text-xs"
                  style={{
                    background: 'linear-gradient(90deg, #06b6d4, #a855f7)',
                    color: 'white'
                  }}
                >
                  Лучшее предложение
                </div>
              )}
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-white text-lg mb-0.5">{plan.name}</h3>
                  <p className="text-gray-500 text-xs">{plan.duration} подписки</p>
                </div>
                <div
                  className="w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                  style={{
                    borderColor: selectedPlan === index ? '#06b6d4' : '#374151',
                    backgroundColor: selectedPlan === index ? '#06b6d4' : 'transparent'
                  }}
                >
                  {selectedPlan === index && <Check className="w-3.5 h-3.5 text-white" />}
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-white text-2xl">{plan.price}</span>
                <span className="text-gray-500 text-sm">{plan.perMonth}</span>
              </div>
              {plan.savings && (
                <div
                  className="mt-2 inline-block px-3 py-1 rounded-full text-xs"
                  style={{ backgroundColor: 'rgba(6,182,212,0.1)', color: '#22d3ee' }}
                >
                  {plan.savings}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Features */}
        <div
          className="rounded-3xl p-5 mb-5"
          style={{
            background: 'rgba(255,255,255,0.04)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.08)'
          }}
        >
          <h3 className="text-white mb-4">Что входит в Премиум</h3>
          <div className="space-y-3">
            {features.map(({ icon: Icon, text }, index) => (
              <div key={index} className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, rgba(6,182,212,0.2), rgba(168,85,247,0.2))' }}
                >
                  <Icon className="w-4 h-4 text-cyan-400" />
                </div>
                <span className="text-gray-300 text-sm">{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Button */}
        <button
          className="w-full rounded-2xl py-4 text-white shadow-2xl hover:scale-[1.02] transition-transform active:scale-95"
          style={{
            background: 'linear-gradient(90deg, #06b6d4, #a855f7)',
            boxShadow: '0 0 30px rgba(6,182,212,0.3)'
          }}
        >
          Начать 7-дневный пробный период
        </button>
        <p className="text-center text-gray-500 text-xs mt-3">Отмена в любое время · Без обязательств</p>
      </div>
    </div>
  );
}
