'use client'

import { useState } from 'react';

interface Props {
  foto: string | null;
  nome: string;
}

export default function ProductThumbnail({ foto, nome }: Props) {
  const [hasError, setHasError] = useState(false);

  return (
    <div style={{ width: 40, height: 40, background: '#eee', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
      {foto && !hasError ? (
        <img 
          src={`/img/fotos_produtos/${foto}`} 
          alt={nome} 
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onError={() => setHasError(true)} // Agora funciona pois é 'use client'
        />
      ) : (
        <i className="fa fa-cutlery text-muted"></i>
      )}
    </div>
  );
}