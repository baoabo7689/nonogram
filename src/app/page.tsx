'use client';

import { useLanguage } from '@/context/LanguageContext';
import { useState } from 'react';
import { createEmptyNonogramGrid, createRandomNonogramGrid } from '@/models/NonogramGridModel';
import NonogramGridComponent from '@/components/NonogramGridComponent';

export default function HomePage() {
  const { translations } = useLanguage();
  const [rowCount, setRowCount] = useState(10);
  const [colCount, setColCount] = useState(10);
  const [grid, setGrid] = useState(() => createEmptyNonogramGrid(10, 10));
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [message, setMessage] = useState('');

  const clampDimension = (value: number) => Math.max(1, value || 1);
  const handleRandom = () => {
    setGrid(createRandomNonogramGrid(rowCount, colCount));
  };
  const handleValidate = () => {};
  const handleExport = () => {};
  const handleSolve = () => {};

  return (
    <main className="flex-1 bg-gradient-to-br from-blue-100 via-white to-pink-100">
      <section className="w-full border border-gray-200 bg-white shadow-xl pl-6">
        {/* Init + Functional Blocks — shared grid for perfect column alignment */}
        <div
          className="mt-3 mb-3 grid items-center gap-x-4 gap-y-3"
          style={{ gridTemplateColumns: '120px 300px 150px 150px 150px' }}
        >
          {/* Init row */}
          <span className="label-interaction">
            <h2 className="text-2xl font-bold tracking-tight drop-shadow text-right">
              {translations.interaction.initTitle}
            </h2>
          </span>
          <div className="flex items-center gap-4">
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
          </div>
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
          {/* Functional row */}
          <span className="label-interaction">
            <h2 className="text-2xl font-bold tracking-tight drop-shadow text-right">
              {translations.interaction.functionalTitle}
            </h2>
          </span>
          <div /> {/* spacer — keeps button columns aligned */}
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
        </div>
      </section>
      <section className="w-full shadow-xl bg-white border border-gray-200 pl-6">
        <div className="flex flex-col md:flex-row gap-8 mt-3 mb-8 items-start justify-center">
          {/* Nonogram Grid Section */}
          <div className="py-4 overflow-auto">
            <NonogramGridComponent model={grid} onChange={setGrid} />
          </div>
          <div className="w-full max-w-md">
            <h3 className="text-lg font-semibold mb-2">{translations.body.messageTitle}</h3>
            <textarea
              className="w-full min-h-[380px] resize-y rounded-md border border-gray-300 bg-gray-50 p-3 text-sm text-gray-700 outline-none"
              value={message}
              readOnly
              placeholder={translations.body.messagePlaceholder}
            />
          </div>
        </div>
      </section>
    </main>
  );
}
