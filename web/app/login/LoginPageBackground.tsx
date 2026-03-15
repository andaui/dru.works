'use client';

import { useEffect } from 'react';

export default function LoginPageBackground({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const prevHtmlBg = html.style.background;
    const prevBodyBg = body.style.background;
    const prevBodyColor = body.style.color;
    html.style.background = '#ffffff';
    body.style.background = '#ffffff';
    body.style.color = '#000000';
    return () => {
      html.style.background = prevHtmlBg;
      body.style.background = prevBodyBg;
      body.style.color = prevBodyColor;
    };
  }, []);

  return <>{children}</>;
}
