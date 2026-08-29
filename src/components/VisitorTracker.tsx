'use client';

import { useEffect } from 'react';

// Generates a lightweight, persistent device/browser fingerprint hash
function generateFingerprint(): string {
  if (typeof window === 'undefined') return 'server';

  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    let txt = 'SKM_Portfolio_FP_2026';
    if (ctx) {
      ctx.textBaseline = 'top';
      ctx.font = "14px 'Arial'";
      ctx.fillStyle = '#f60';
      ctx.fillRect(125, 1, 62, 20);
      ctx.fillStyle = '#069';
      ctx.fillText(txt, 2, 15);
      ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
      ctx.fillText(txt, 4, 17);
    }
    const canvasData = canvas.toDataURL();
    
    const nav = window.navigator;
    const screen = window.screen;
    const str = [
      nav.userAgent,
      nav.language,
      screen.colorDepth,
      screen.width + 'x' + screen.height,
      new Date().getTimezoneOffset(),
      canvasData.slice(-50),
    ].join('||');

    // Simple fast DJB2 hash
    let hash = 5381;
    for (let i = 0; i < str.length; i++) {
      hash = (hash * 33) ^ str.charCodeAt(i);
    }
    return 'fp_' + Math.abs(hash).toString(36);
  } catch (e) {
    return 'fp_anon_' + Math.random().toString(36).substring(2, 9);
  }
}

// Detect Browser Name
function detectBrowser(ua: string): string {
  if (ua.includes('Edg/')) return 'Microsoft Edge';
  if (ua.includes('Chrome/')) return 'Google Chrome';
  if (ua.includes('Firefox/')) return 'Mozilla Firefox';
  if (ua.includes('Safari/') && !ua.includes('Chrome/')) return 'Apple Safari';
  if (ua.includes('OPR/') || ua.includes('Opera/')) return 'Opera';
  return 'Browser';
}

// Detect OS
function detectOS(ua: string): string {
  if (ua.includes('Win')) return 'Windows';
  if (ua.includes('Mac')) return 'macOS';
  if (ua.includes('Android')) return 'Android';
  if (ua.includes('iPhone') || ua.includes('iPad') || ua.includes('iPod')) return 'iOS';
  if (ua.includes('Linux')) return 'Linux';
  return 'Unknown OS';
}

// Detect Device Type
function detectDeviceType(ua: string): string {
  if (/Tablet|iPad/i.test(ua)) return 'Tablet';
  if (/Mobi|Android|iPhone|iPod/i.test(ua)) return 'Mobile';
  return 'Desktop';
}

export default function VisitorTracker() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Prevent duplicate tracking in same session
    const sessionTracked = sessionStorage.getItem('skm_session_tracked');
    if (sessionTracked) return;

    const ua = navigator.userAgent || '';
    const fingerprint = generateFingerprint();
    const browser = detectBrowser(ua);
    const os = detectOS(ua);
    const device_type = detectDeviceType(ua);
    const screen_resolution = `${window.screen.width}x${window.screen.height}`;
    const language = navigator.language || 'en';
    const referrer = document.referrer || 'direct';
    const page_url = window.location.pathname + window.location.hash;

    const payload = {
      fingerprint,
      browser,
      os,
      device_type,
      screen_resolution,
      language,
      referrer,
      page_url,
    };

    fetch('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          sessionStorage.setItem('skm_session_tracked', 'true');
        }
      })
      .catch(() => {
        // Silently handle offline/error
      });
  }, []);

  return null;
}
