'use client'

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom'; // <--- IMPORTANTE
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { logoutStaffAction } from '../funcionario/logout/actions';

interface Props {
  slug: string;
  mesaId: string;
}

export default function StaffLogoutButton({ slug, mesaId }: Props) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false); // <--- Para evitar erro de hidratação
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!senha) return;

    setLoading(true);
    const res = await logoutStaffAction(slug, mesaId, senha);
    setLoading(false);

    if (res?.error) {
      toast.error(res.error);
      setSenha('');
    } else {
      toast.success("Mesa liberada com sucesso!");
      setIsModalOpen(false);
      router.push(`/${slug}/mesa/${mesaId}`);
      router.refresh();
    }
  };

  // O componente visual do Modal (isolado para usar no Portal)
  const modalContent = isModalOpen ? (
    <div style={{
      position: 'fixed', 
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.6)', 
      zIndex: 99999999, // Agora este zIndex vai funcionar pois está no body
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
    }}>
      <div style={{
        backgroundColor: '#fff', padding: '25px', borderRadius: '15px',
        width: '100%', maxWidth: '320px', boxShadow: '0 5px 20px rgba(0,0,0,0.3)',
        textAlign: 'center'
      }}>
        <h5 style={{ fontWeight: 'bold', color: '#dc3545', marginBottom: '10px' }}>
          <i className="fa fa-lock"></i> Confirmar Saída
        </h5>
        <p style={{ fontSize: '13px', color: '#666', marginBottom: '15px' }}>
          Digite sua senha de funcionário para liberar esta mesa.
        </p>

        <form onSubmit={handleLogout}>
          <input 
            type="password" 
            className="form-control" 
            placeholder="Sua senha..."
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            autoFocus
            style={{ marginBottom: '15px', textAlign: 'center' }}
            required
          />

          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              type="button" 
              onClick={() => setIsModalOpen(false)}
              className="btn btn-secondary btn-block"
              style={{ flex: 1 }}
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="btn btn-danger btn-block"
              style={{ flex: 1 }}
              disabled={loading}
            >
              {loading ? '...' : 'Sair'}
            </button>
          </div>
        </form>
      </div>
    </div>
  ) : null;

  return (
    <>
      {/* 1. BOTÃO DE ACIONAMENTO (Fica no Header) */}
      <button 
        onClick={() => setIsModalOpen(true)}
        style={{
          background: 'none',
          border: '1px solid #dc3545',
          color: '#dc3545',
          padding: '5px 10px',
          borderRadius: '5px',
          fontSize: '11px',
          cursor: 'pointer',
          display: 'flex', 
          alignItems: 'center', 
          gap: '5px',
          fontWeight: 'bold'
        }}
        title="Sair do modo Funcionário"
      >
        <i className="fa fa-lock"></i> Staff
      </button>

      {/* 2. MODAL RENDERIZADO NO BODY (Fora do Header) */}
      {/* Só renderiza se estiver montado no cliente e o modal estiver aberto */}
      {mounted && isModalOpen && createPortal(modalContent, document.body)}
    </>
  );
}