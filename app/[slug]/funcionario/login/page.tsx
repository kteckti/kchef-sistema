'use client'

import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation'; // <--- ADICIONE useRouter
import { loginFuncionarioAction } from './actions';
import { toast, Toaster } from 'react-hot-toast'; // <--- ADICIONE Toaster para ver os alertas

export default function StaffLoginPage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const searchParams = useSearchParams();
  const router = useRouter(); // <--- Inicializa o router
  
  const callbackUrl = searchParams.get('callbackUrl') || '';
  const mesaId = searchParams.get('mesaId') || '';

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    setLoading(true);
    
    // Adiciona os dados extras manualmente ao FormData antes de enviar
    formData.append('slug', slug);
    formData.append('callbackUrl', callbackUrl);
    if (mesaId) formData.append('mesaId', mesaId); 

    const res = await loginFuncionarioAction(formData);
    setLoading(false);

    if (res?.error) {
      toast.error(res.error);
    } else if (res?.success) {
      toast.success(res.message);
      
      // --- CORREÇÃO AQUI: REDIRECIONAR O USUÁRIO ---
      // Se tiver callback (ex: estava tentando acessar um pedido), vai pra lá
      if (callbackUrl) {
          router.push(callbackUrl);
      } else {
          // Se for login normal, manda para o Dashboard ou Cardápio
          // Ajuste essa rota conforme seu projeto (ex: /painel, /garcom, etc)
          router.push(`/${slug}/painel`); 
      }
      
      // Força um refresh para garantir que os cookies sejam lidos pelo layout
      router.refresh();
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#f8f9fa', padding: '20px'
    }}>
      {/* Componente para exibir as notificações */}
      <Toaster position="top-center" />

      <form action={handleSubmit} style={{
        background: '#fff', padding: '30px', borderRadius: '15px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.1)', width: '100%', maxWidth: '350px'
      }}>
        <div className="text-center mg-b-20" style={{marginBottom: '20px'}}>
            <i className="fa-solid fa-user-lock fa-3x text-danger mb-3" style={{color: '#dc3545'}}></i>
            <h4 className="fw-bold text-dark">Área Restrita</h4>
            <p className="small text-muted">Faça login para acessar o sistema</p>
            {mesaId && <span className="badge bg-warning text-dark">Mesa {mesaId}</span>}
        </div>

        <div className="mb-3">
            <label className="form-label small fw-bold text-uppercase">Login</label>
            <input name="login" className="form-control" placeholder="Usuário" required />
        </div>

        <div className="mb-3">
            <label className="form-label small fw-bold text-uppercase">Senha</label>
            <input name="senha" type="password" className="form-control" placeholder="Senha" required />
        </div>

        <button type="submit" className="btn btn-primary w-100 fw-bold" disabled={loading}>
            {loading ? 'Validando...' : 'Entrar no Sistema'}
        </button>
      </form>
    </div>
  );
}