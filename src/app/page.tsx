'use client';

import { useLanguage } from '@/context/LanguageContext';
import { useState } from 'react';
import { createEmptyNonogramGrid } from '@/models/NonogramGridModel';

export default function HomePage() {
  const { translations } = useLanguage();
  const [rowCount, setRowCount] = useState(10);
  const [colCount, setColCount] = useState(10);
  const [grid, setGrid] = useState(() => createEmptyNonogramGrid(10, 10));
  const [isImportOpen, setIsImportOpen] = useState(false);

  const clampDimension = (value: number) => Math.max(1, value || 1);
  const handleRandom = () => {};
  const handleValidate = () => {};
  const handleExport = () => {};
  const handleSolve = () => {};

  return (
    <main className="flex-1 bg-gradient-to-br from-blue-100 via-white to-pink-100">
      <section className="w-full h-full border border-gray-200 bg-white shadow-xl pl-6">
        {/* Init Block */}
        <div className="mt-3 mb-3">
          <span className="flex flex-wrap items-center gap-4">
            <span className="label-interaction">
              <h2 className="text-2xl font-bold tracking-tight drop-shadow">
                {translations.interaction.initTitle}
              </h2>
            </span>

            <label className="flex items-center gap-2 text-sm text-gray-700">
              {translations.interaction.rows}
              <input
                type="number"
                min={1}
                value={rowCount}
                onChange={(e) => setRowCount(clampDimension(Number(e.target.value)))}
                className="w-20 rounded border border-gray-300 px-2 py-1"
              />
            </label>

            <label className="flex items-center gap-2 text-sm text-gray-700">
              {translations.interaction.columns}
              <input
                type="number"
                min={1}
                value={colCount}
                onChange={(e) => setColCount(clampDimension(Number(e.target.value)))}
                className="w-20 rounded border border-gray-300 px-2 py-1"
              />
            </label>

            <button
              className="btn-interaction"
              title={translations.interaction.random}
              onClick={handleRandom}
            >
              {translations.interaction.random}
            </button>
            <button
              className="btn-interaction"
              title={translations.interaction.import}
              onClick={() => setIsImportOpen(true)}
            >
              {translations.interaction.import}
            </button>
            <button
              className="btn-interaction"
              title={translations.interaction.manual}
              onClick={() => setGrid(createEmptyNonogramGrid(rowCount, colCount))}
            >
              {translations.interaction.manual}
            </button>
          </span>
        </div>

        {/* Functional Block */}
        <div className="mb-3">
          <span className="flex gap-4">
            <span className="label-interaction">
              <h2 className="text-2xl font-bold tracking-tight drop-shadow">
                {translations.interaction.functionalTitle}
              </h2>
            </span>
            <button
              className="btn-interaction"
              title={translations.interaction.validate}
              onClick={handleValidate}
            >
              {translations.interaction.validate}
            </button>
            <button
              className="btn-interaction"
              title={translations.interaction.export}
              onClick={handleExport}
            >
              {translations.interaction.export}
            </button>
            <button
              className="btn-interaction"
              title={translations.interaction.solve}
              onClick={handleSolve}
            >
              {translations.interaction.solve}
            </button>
          </span>
        </div>
      </section>
    </main>
  );
}
