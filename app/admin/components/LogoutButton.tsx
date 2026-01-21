'use client'

import { logoutAction } from '@/app/admin/actions';

export default function LogoutButton() {
  
  const handleLogout = async () => {
    await logoutAction();
    window.location.href = '/admin/login';
  };

  return (
    <button 
      onClick={handleLogout} 
      className="nav-link" 
      style={{
        // RESET VISUAL:
        background: 'transparent',
        // REMOVI A LINHA "border: none" DAQUI. 
        // Agora o botão vai respeitar a borda definida no seu arquivo CSS (slim.css/custom.css).
        
        padding: 0, // Mantém o alinhamento
        outline: 'none',
        cursor: 'pointer',
        
        // LAYOUT:
        width: '100%',
        height: '100%', 
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center', 
        
        // FONTE:
        color: 'inherit',
        fontFamily: 'inherit',
        fontSize: 'inherit',
        textTransform: 'inherit',
        letterSpacing: 'inherit'
      }}
    >
      <i className="icon ion-ios-analytics-outline" style={{ fontSize: '24px', marginRight: '8px' }}></i>
      <span>SAIR</span>
    </button>
  );
}