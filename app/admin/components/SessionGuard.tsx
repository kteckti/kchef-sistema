'use client'

import { useEffect } from "react";

export default function SessionGuard() {
  useEffect(() => {
    // Ouve se a página foi carregada do "Cache de Voltar/Avançar" (BFcache)
    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        // Se foi carregada do cache, força um reload para o servidor checar o cookie
        window.location.reload();
      }
    };

    window.addEventListener('pageshow', handlePageShow);
    return () => {
      window.removeEventListener('pageshow', handlePageShow);
    };
  }, []);

  return null;
}