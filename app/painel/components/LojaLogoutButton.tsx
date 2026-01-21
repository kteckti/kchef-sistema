'use client'

import { lojaLogoutAction } from '../actions';

export default function LojaLogoutButton() {
  const handleLogout = async () => {
    await lojaLogoutAction();
    window.location.href = '/painel/login';
  };

  return (
    <button 
      onClick={handleLogout} 
      className="nav-link" 
      style={{
        background: 'transparent', 
        border: 'none', 
        padding: 0, 
        outline: 'none',
        cursor: 'pointer',
        width: '100%',
        height: '100%', 
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center', 
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