'use client'

import { encerrarSessaoAction } from '../actions';

export default function LogoutMesaButton({ slug, mesaId }: { slug: string, mesaId: string }) {
  
  const handleLogout = async () => {
    // 1. Define a chave do carrinho (mesma lógica usada no MenuContent)
    const cartKey = `cart_${slug}_mesa_${mesaId}`;
    
    // 2. Limpa o carrinho do cliente atual no navegador
    localStorage.removeItem(cartKey);
    
    // 3. Opcional: limpa outros dados temporários se houver
    // localStorage.clear(); // Use com cautela se tiver outros dados salvos

    // 4. Chama a Server Action para limpar cookies e atualizar banco
    await encerrarSessaoAction(slug, mesaId);
  };

  return (
    <button 
      onClick={handleLogout}
      className="btn-encerrar"
      style={{
        backgroundColor: '#dc3545',
        color: '#fff',
        border: 'none',
        padding: '8px 15px',
        borderRadius: '8px',
        fontSize: '12px',
        fontWeight: 'bold',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        transition: 'opacity 0.2s'
      }}
      onMouseOver={(e) => e.currentTarget.style.opacity = '0.8'}
      onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
    >
      <i className="fa fa-sign-out"></i>
      Sair
    </button>
  );
}