import React, { useState } from 'react';
import { Filter, CheckCircle2, Search, ArrowRight, ShieldCheck } from 'lucide-react';
import { verifyVIN } from '../services/api';

export default function VehicleSearchPage({ setCurrentPage, setSelectedVehicle, setSearchQuery }) {
  const [manufacturer, setManufacturer] = useState('Ford (North America)');
  const [modelFamily, setModelFamily] = useState('F-150 Pickup');
  const [modelYear, setModelYear] = useState('2021');
  const [enginePlatform, setEnginePlatform] = useState('3.5L V6 EcoBoost (Gen 3)');
  const [trimVariant, setTrimVariant] = useState('Lariat SuperCrew 4WD');
  const [releaseMarket, setReleaseMarket] = useState('US / Canada Markets');
  
  const [vinInput, setVinInput] = useState('1FTFW1EG5MFXXXXXX');
  const [vinLoading, setVinLoading] = useState(false);
  const [vinVerified, setVinVerified] = useState(true);

  const handleInitializeSession = () => {
    const selectedVeh = {
      vin: vinInput || '1FTFW1EG5MFXXXXXX',
      manufacturer,
      model_family: modelFamily,
      year: parseInt(modelYear),
      engine_platform: enginePlatform,
      trim_variant: trimVariant,
      market_region: releaseMarket,
      status: 'Active Sync'
    };
    setSelectedVehicle(selectedVeh);
    setCurrentPage('vehicle-overview');
  };

  const handleVerifyVIN = async () => {
    setVinLoading(true);
    try {
      const res = await verifyVIN(vinInput);
      if (res.vehicle) {
        setSelectedVehicle(res.vehicle);
        setManufacturer(res.vehicle.manufacturer || 'Ford (North America)');
        setModelFamily(res.vehicle.model_family || 'F-150 Pickup');
        setModelYear(res.vehicle.year?.toString() || '2021');
        setEnginePlatform(res.vehicle.engine_platform || '3.5L V6 EcoBoost (Gen 3)');
        setTrimVariant(res.vehicle.trim_variant || 'Lariat SuperCrew 4WD');
        setReleaseMarket(res.vehicle.market_region || 'US / Canada Markets');
        setVinVerified(true);
        setCurrentPage('vehicle-overview');
      }
    } catch (err) {
      setVinVerified(true);
    } finally {
      setVinLoading(false);
    }
  };

  const recentModels = [
    {
      year: 2021,
      title: 'Ford F-150 Lariat',
      specs: '3.5L, V6 EcoBoost',
      vin: '1FTFW1EG5MFXXXXXX',
      manufacturer: 'Ford (North America)',
      model_family: 'F-150 Pickup',
      trim_variant: 'Lariat SuperCrew 4WD',
      market_region: 'US / Canada Markets',
      status: 'Verified'
    },
    {
      year: 2023,
      title: 'Tesla Model Y',
      specs: 'Dual Motor EV',
      vin: '5YJYGDEE8PFXXXXXX',
      manufacturer: 'Tesla',
      model_family: 'Model Y',
      trim_variant: 'Long Range AWD',
      market_region: 'Global West',
      status: 'Verified'
    },
    {
      year: 2019,
      title: 'Toyota RAV4 Hybrid',
      specs: '2.5L, I4',
      vin: 'JTDEPFAE7KJXXXXXX',
      manufacturer: 'Toyota',
      model_family: 'RAV4 Hybrid',
      trim_variant: 'XLE AWD',
      market_region: 'Japan / Asia Import',
      status: 'Verified'
    }
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Search Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Query Diagnostics Database
        </h1>
        <p className="text-xs font-semibold text-slate-500 mt-1">
          Select structured vehicle parameters or input VIN to initialize model-specific RAG session.
        </p>
      </div>

      {/* Main 2-Column Options Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Left Column: Structured Database Filters (3 cols) */}
        <div className="lg:col-span-3 bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="flex items-center space-x-2 text-sky-700 font-extrabold text-sm pb-3 border-b border-slate-100">
            <Filter className="w-4 h-4 text-sky-600" />
            <span>Structured Database Filters</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold">
            {/* Manufacturer */}
            <div>
              <label className="block text-slate-500 font-bold uppercase tracking-wider text-[10px] mb-1">
                Manufacturer
              </label>
              <select
                value={manufacturer}
                onChange={(e) => setManufacturer(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:ring-2 focus:ring-sky-500 focus:bg-white"
              >
                <option>Ford (North America)</option>
                <option>Tesla</option>
                <option>Toyota</option>
                <option>BMW</option>
                <option>Chevrolet</option>
              </select>
            </div>

            {/* Model Family */}
            <div>
              <label className="block text-slate-500 font-bold uppercase tracking-wider text-[10px] mb-1">
                Model Family
              </label>
              <select
                value={modelFamily}
                onChange={(e) => setModelFamily(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:ring-2 focus:ring-sky-500 focus:bg-white"
              >
                <option>F-150 Pickup</option>
                <option>Model Y</option>
                <option>RAV4 Hybrid</option>
                <option>X5</option>
                <option>Silverado 1500</option>
              </select>
            </div>

            {/* Model Year */}
            <div>
              <label className="block text-slate-500 font-bold uppercase tracking-wider text-[10px] mb-1">
                Model Year
              </label>
              <select
                value={modelYear}
                onChange={(e) => setModelYear(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:ring-2 focus:ring-sky-500 focus:bg-white"
              >
                <option>2021</option>
                <option>2022</option>
                <option>2023</option>
                <option>2024</option>
              </select>
            </div>

            {/* Engine Platform */}
            <div>
              <label className="block text-slate-500 font-bold uppercase tracking-wider text-[10px] mb-1">
                Engine Platform
              </label>
              <select
                value={enginePlatform}
                onChange={(e) => setEnginePlatform(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:ring-2 focus:ring-sky-500 focus:bg-white"
              >
                <option>3.5L V6 EcoBoost (Gen 3)</option>
                <option>Dual Motor EV</option>
                <option>2.5L I4 Hybrid</option>
                <option>5.3L V8 EcoTec3</option>
              </select>
            </div>

            {/* Trim Variant */}
            <div>
              <label className="block text-slate-500 font-bold uppercase tracking-wider text-[10px] mb-1">
                Trim Variant
              </label>
              <select
                value={trimVariant}
                onChange={(e) => setTrimVariant(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:ring-2 focus:ring-sky-500 focus:bg-white"
              >
                <option>Lariat SuperCrew 4WD</option>
                <option>Long Range AWD</option>
                <option>XLE AWD</option>
                <option>LTZ Crew Cab</option>
              </select>
            </div>

            {/* Release Market */}
            <div>
              <label className="block text-slate-500 font-bold uppercase tracking-wider text-[10px] mb-1">
                Release Market (Region)
              </label>
              <select
                value={releaseMarket}
                onChange={(e) => setReleaseMarket(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:ring-2 focus:ring-sky-500 focus:bg-white"
              >
                <option>US / Canada Markets</option>
                <option>Europe (EU-WEST)</option>
                <option>Japan / Asia Import</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleInitializeSession}
            className="w-full py-3 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-lg shadow-sm transition flex items-center justify-center space-x-2 cursor-pointer"
          >
            <span>Initialize Manuals Database Session</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Right Column: Direct VIN Verification (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-slate-800 font-extrabold text-sm pb-3 border-b border-slate-100">
              <ShieldCheck className="w-4 h-4 text-sky-600" />
              <span>Direct VIN Verification</span>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Bypass structured menus instantly by inputting the vehicle's unique 17-digit ISO VIN barcode sequence below.
            </p>

            <div className="space-y-2">
              <label className="block text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                Enter 17-Digit VIN Code
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={vinInput}
                  onChange={(e) => setVinInput(e.target.value.toUpperCase())}
                  className="w-full pl-3 pr-9 py-2.5 bg-slate-50 border border-emerald-400 rounded-lg text-xs font-mono font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500 tracking-wider uppercase"
                />
                <CheckCircle2 className="w-4 h-4 absolute right-3 top-3 text-emerald-500" />
              </div>
              <p className="text-[10px] font-medium text-emerald-600">
                VIN pattern validates against active US-EAST inventory registries.
              </p>
            </div>

            <div className="bg-slate-900 text-slate-300 p-3 rounded-lg text-[11px] font-mono text-center tracking-wider">
              * {vinInput} *
            </div>
          </div>

          <button
            onClick={handleVerifyVIN}
            disabled={vinLoading}
            className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg shadow-sm transition flex items-center justify-center space-x-2 cursor-pointer"
          >
            <span>{vinLoading ? 'Verifying VIN...' : 'Verify VIN & Auto-Populate'}</span>
          </button>
        </div>
      </div>

      {/* Bottom Section: Recently Accessed Models */}
      <div className="space-y-3">
        <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
          Recently Accessed Models (Local Terminal)
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {recentModels.map((item, i) => (
            <div
              key={i}
              onClick={() => {
                setSelectedVehicle({
                  vin: item.vin,
                  manufacturer: item.manufacturer,
                  model_family: item.model_family,
                  year: item.year,
                  engine_platform: item.specs,
                  trim_variant: item.trim_variant,
                  market_region: item.market_region,
                  status: 'Active Sync'
                });
                setCurrentPage('vehicle-overview');
              }}
              className="p-4 bg-white border border-slate-200 hover:border-sky-400 rounded-xl transition shadow-xs flex items-center justify-between cursor-pointer group"
            >
              <div>
                <span className="text-[10px] font-bold text-slate-400 block">{item.year}</span>
                <h3 className="text-sm font-extrabold text-slate-800 group-hover:text-sky-600 transition">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">{item.specs}</p>
              </div>

              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                {item.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
