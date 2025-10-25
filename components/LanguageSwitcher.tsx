'use client';

import { Language } from '@/lib/translations';

interface LanguageSwitcherProps {
  currentLang: Language;
  onSwitch: () => void;
  label: string;
}

export default function LanguageSwitcher({
  currentLang,
  onSwitch,
  label,
}: LanguageSwitcherProps) {
  return (
    <button
      onClick={onSwitch}
      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium text-gray-700"
    >
      {label}
    </button>
  );
}
