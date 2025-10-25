'use client';

import { useState } from 'react';
import { Download, Sparkles, Upload, Image as ImageIcon } from 'lucide-react';
import ImageUpload from '@/components/ImageUpload';
import LoadingSpinner from '@/components/LoadingSpinner';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { Language, translations } from '@/lib/translations';

export default function Home() {
  const [language, setLanguage] = useState<Language>('ar');
  const [personImage, setPersonImage] = useState<File | null>(null);
  const [clothingImage, setClothingImage] = useState<File | null>(null);
  const [personPreview, setPersonPreview] = useState<string>('');
  const [clothingPreview, setClothingPreview] = useState<string>('');
  const [resultImage, setResultImage] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string>('');

  const t = translations[language];
  const isRTL = language === 'ar';

  const handlePersonImage = (file: File) => {
    setPersonImage(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPersonPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
    setError('');
  };

  const handleClothingImage = (file: File) => {
    setClothingImage(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setClothingPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
    setError('');
  };

  const handleTryOn = async () => {
    if (!personImage || !clothingImage) {
      setError('Please upload both images');
      return;
    }

    setIsProcessing(true);
    setError('');
    setResultImage('');

    try {
      const formData = new FormData();
      formData.append('person', personImage);
      formData.append('clothing', clothingImage);

      const response = await fetch('/api/tryon', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to process images');
      }

      setResultImage(data.image);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!resultImage) return;

    const link = document.createElement('a');
    link.href = resultImage;
    link.download = `trylebs-result-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleReset = () => {
    setPersonImage(null);
    setClothingImage(null);
    setPersonPreview('');
    setClothingPreview('');
    setResultImage('');
    setError('');
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ar' : 'en');
  };

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} className="min-h-screen bg-gradient-to-br from-navy-50 via-teal-50 to-gold-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.png"
              alt="TryLebs Logo"
              className="h-12 w-12 sm:h-16 sm:w-16 object-contain"
            />
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-navy to-teal bg-clip-text text-transparent">
              {t.title}
            </h1>
          </div>
          <LanguageSwitcher
            currentLang={language}
            onSwitch={toggleLanguage}
            label={t.switchLanguage}
          />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {t.subtitle}
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
            {t.description}
          </p>
        </div>

        {/* How It Works */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-xl p-6 shadow-md text-center">
            <div className="bg-navy-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Upload className="text-navy" size={32} />
            </div>
            <h3 className="text-xl font-bold mb-2">{t.step1}</h3>
            <p className="text-gray-600">{t.step1Desc}</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-md text-center">
            <div className="bg-teal-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <ImageIcon className="text-teal" size={32} />
            </div>
            <h3 className="text-xl font-bold mb-2">{t.step2}</h3>
            <p className="text-gray-600">{t.step2Desc}</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-md text-center">
            <div className="bg-gold-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="text-gold" size={32} />
            </div>
            <h3 className="text-xl font-bold mb-2">{t.step3}</h3>
            <p className="text-gray-600">{t.step3Desc}</p>
          </div>
        </div>

        {/* Upload Section */}
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="text-xl font-bold mb-4 text-gray-800">
                {t.uploadPerson}
              </h3>
              <ImageUpload
                onImageSelect={handlePersonImage}
                placeholder={t.personPlaceholder}
                description={t.dragDrop}
                currentImage={personPreview}
                onRemove={() => {
                  setPersonImage(null);
                  setPersonPreview('');
                }}
              />
              <p className="text-sm text-gray-500 mt-2">{t.supported}</p>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4 text-gray-800">
                {t.uploadClothing}
              </h3>
              <ImageUpload
                onImageSelect={handleClothingImage}
                placeholder={t.clothingPlaceholder}
                description={t.dragDrop}
                currentImage={clothingPreview}
                onRemove={() => {
                  setClothingImage(null);
                  setClothingPreview('');
                }}
              />
              <p className="text-sm text-gray-500 mt-2">{t.supported}</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleTryOn}
              disabled={!personImage || !clothingImage || isProcessing}
              className="px-8 py-4 bg-gradient-to-r from-navy to-teal text-white rounded-lg font-bold text-lg hover:from-navy-600 hover:to-teal-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 flex items-center justify-center gap-2"
            >
              <Sparkles size={24} />
              {t.tryOn}
            </button>
            {(personImage || clothingImage || resultImage) && (
              <button
                onClick={handleReset}
                disabled={isProcessing}
                className="px-8 py-4 bg-gray-200 text-gray-800 rounded-lg font-bold text-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {t.tryAnother}
              </button>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-center">{error}</p>
            </div>
          )}
        </div>

        {/* Processing State */}
        {isProcessing && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <LoadingSpinner text={t.processing} />
          </div>
        )}

        {/* Result Section */}
        {resultImage && !isProcessing && (
          <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
            <h3 className="text-2xl font-bold mb-6 text-center text-gray-800">
              {t.result}
            </h3>
            <div className="max-w-2xl mx-auto">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={resultImage}
                alt="Virtual try-on result"
                className="w-full rounded-lg shadow-lg mb-6"
              />
              <div className="flex justify-center">
                <button
                  onClick={handleDownload}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition-colors flex items-center gap-2"
                >
                  <Download size={20} />
                  {t.download}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
          <div className="flex justify-center mb-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.png"
              alt="TryLebs Logo"
              className="h-16 w-16 object-contain"
            />
          </div>
          <p className="text-gray-600">{t.footer}</p>
          <p className="mt-2 text-sm text-gray-500">© 2024 TryLebs.ai - All rights reserved</p>
        </div>
      </footer>
    </div>
  );
}
