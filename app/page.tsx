'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { ShieldAlert, AlertTriangle, CheckCircle, Activity, Award, User, GraduationCap } from 'lucide-react';

// Inisialisasi Supabase Client dengan fallback aman saat Build Time
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface BedLog {
  id: number;
  created_at: string;
  fall_risk: number;
  status_patient: string;
  sensor_data: number[];
}

export default function Home() {
  const [latestLog, setLatestLog] = useState<BedLog | null>(null);
  const [isConnected, setIsConnected] = useState(false);

useEffect(() => {
  console.log("1. Menghubungkan ke Supabase...");
  console.log("URL Supabase:", process.env.NEXT_PUBLIC_SUPABASE_URL);

    // 1. Ambil data terakhir saat web dibuka
    const fetchLatestData = async () => {
      const { data } = await supabase
        .from('bed_logs')
        .select('*')
        .order('id', { ascending: false })
        .limit(1);

      if (data && data.length > 0) {
        setLatestLog(data[0]);
        setIsConnected(true);
      }
    };

    fetchLatestData();

    // 2. Subskripsi Realtime Websocket Supabase
    const channel = supabase
      .channel('bed_logs_realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'bed_logs' },
        (payload) => {
          setLatestLog(payload.new as BedLog);
          setIsConnected(true);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const risk = latestLog?.fall_risk || 0;

  // Penentuan Warna & Status UI
  let statusColor = 'bg-emerald-500 text-white';
  let Icon = CheckCircle;

  if (risk >= 30 && risk < 70) {
    statusColor = 'bg-amber-500 text-white';
    Icon = AlertTriangle;
  } else if (risk >= 70) {
    statusColor = 'bg-rose-600 text-white animate-pulse';
    Icon = ShieldAlert;
  }

  return (
    <main className="min-h-screen bg-slate-900 text-slate-100 p-4 md:p-10 font-sans">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Header Dashboard */}
        <div className="bg-slate-800/80 border border-slate-700/60 p-6 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-lg">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold flex items-center gap-3 text-white tracking-wide">
              <Activity className="text-cyan-400 h-8 w-8" />
              Smart-Bed Safety Dashboard
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Real-Time Edge-AI Patient Fall Prevention & Safety Monitoring
            </p>
          </div>
          
          <div className="flex items-center gap-3 bg-slate-900/80 px-4 py-2 rounded-xl border border-slate-700">
            <span className={`h-3 w-3 rounded-full ${isConnected ? 'bg-emerald-500 animate-ping' : 'bg-slate-600'}`} />
            <span className="text-xs font-semibold tracking-wider text-slate-300">
              {isConnected ? 'LIVE SYNC' : 'OFFLINE'}
            </span>
          </div>
        </div>

        {/* Panel Identitas Inovator / Pencipta Project */}
        <div className="bg-gradient-to-r from-cyan-950/40 via-slate-800/60 to-slate-800/40 border border-cyan-500/30 p-5 rounded-2xl shadow-md flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-cyan-500/10 p-3 rounded-xl border border-cyan-500/20">
              <Award className="h-7 w-7 text-cyan-400" />
            </div>
            <div>
              <span className="text-xs font-semibold text-cyan-400 uppercase tracking-widest">Inovator & Pengembang Project</span>
              <h2 className="text-lg font-bold text-white flex items-center gap-2 mt-0.5">
                <User className="h-4 w-4 text-slate-400" />
                M. Fadel Azkha Perwira Adinata
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-slate-900/60 px-4 py-2 rounded-lg border border-slate-700/60 text-sm font-medium text-slate-300 w-full md:w-auto justify-center">
            <GraduationCap className="h-4 w-4 text-cyan-400" />
            <span>SMP N 5 Yogyakarta</span>
          </div>
        </div>

        {/* Card Utama Status Risiko Pasien */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className={`col-span-1 md:col-span-2 p-8 rounded-2xl shadow-xl flex flex-col justify-between transition-all duration-300 ${statusColor}`}>
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs uppercase font-bold tracking-wider opacity-80">Status Posisi Pasien</span>
                <h2 className="text-3xl md:text-4xl font-black mt-1 tracking-tight">
                  {latestLog?.status_patient || 'Menunggu Data...'}
                </h2>
              </div>
              <Icon size={52} className="drop-shadow-md" />
            </div>

            <div className="mt-8">
              <div className="flex justify-between text-sm mb-2 font-semibold">
                <span>Fall Risk Index</span>
                <span>{risk.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-black/30 rounded-full h-4 p-0.5 backdrop-blur-sm">
                <div 
                  className="bg-white h-full rounded-full transition-all duration-500 shadow-sm"
                  style={{ width: `${Math.min(risk, 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Panel Spesifikasi Telemetri */}
          <div className="bg-slate-800/50 border border-slate-700/50 p-6 rounded-2xl flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Informasi Hardware & Telemetri</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between border-b border-slate-700/50 pb-2">
                  <span className="text-slate-400">Microcontroller:</span>
                  <span className="font-mono text-cyan-400 font-semibold">ESP32 S2 Mini</span>
                </div>
                <div className="flex justify-between border-b border-slate-700/50 pb-2">
                  <span className="text-slate-400">Model AI:</span>
                  <span className="font-mono text-emerald-400 font-semibold">Random Forest (5-Class)</span>
                </div>
                <div className="flex justify-between border-b border-slate-700/50 pb-2">
                  <span className="text-slate-400">Array Sensor:</span>
                  <span className="font-mono text-slate-200">8x ToF VL53L0X</span>
                </div>
                <div className="flex justify-between border-b border-slate-700/50 pb-2">
                  <span className="text-slate-400">Update Terakhir:</span>
                  <span className="font-mono text-slate-200">
                    {latestLog ? new Date(latestLog.created_at).toLocaleTimeString() : '-'}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-3 border-t border-slate-700/50 text-xs text-slate-400 text-center font-medium">
              Real-time Sync via Supabase Database
            </div>
          </div>
        </div>

        {/* Visualisasi Matriks 8 Sensor */}
        <div className="bg-slate-800/40 border border-slate-700/50 p-6 rounded-2xl">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
            Matriks Pembacaan Jarak 8 Sensor ToF (cm)
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono text-center">
            {latestLog?.sensor_data ? (
              latestLog.sensor_data.map((val, idx) => (
                <div key={idx} className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-700/80 shadow-inner">
                  <div className="text-xs text-slate-400 font-sans">
                    {idx < 4 ? `Sisi Kiri (L${idx + 1})` : `Sisi Kanan (R${idx - 3})`}
                  </div>
                  <div className="text-xl font-bold text-cyan-400 mt-1">{val} cm</div>
                </div>
              ))
            ) : (
              <div className="col-span-4 text-center py-6 text-slate-500 text-sm">Data sensor belum tersedia</div>
            )}
          </div>
        </div>

      </div>
    </main>
  );
}