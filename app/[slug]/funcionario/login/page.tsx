'use client'

import { useState } from 'react';
import { useSearchParams } from 'next/navigation'; // Importante
import { loginFuncionarioAction } from './actions';
import { toast } from 'react-hot-toast';

export default function StaffLoginPage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const searchParams = useSearchParams();
  
  const callbackUrl = searchParams.get('callbackUrl') || '';
  const mesaId = searchParams.get('mesaId') || ''; // <--- Captura o ID da mesa

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    setLoading(true);
    formData.append('slug', slug);
    formData.append('callbackUrl', callbackUrl);
    // Se tiver mesaId, envia junto. Se for login geral, vai vazio.
    if (mesaId) formData.append('mesaId', mesaId); 

    const res = await loginFuncionarioAction(formData);
    setLoading(false);

    if (res?.error) {
      toast.error(res.error);
    } else if (res?.success) {
      toast.success(res.message);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#f8f9fa', padding: '20px'
    }}>
      <form action={handleSubmit} style={{
        background: '#fff', padding: '30px', borderRadius: '15px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.1)', width: '100%', maxWidth: '350px'
      }}>
        <div className="text-center mg-b-20">
            <i className="fa fa-lock fa-3x text-danger mg-b-10"></i>
            <h4 className="font-bold tx-gray-800">Mesa {mesaId ? mesaId : 'Restrita'}</h4>
            <p className="tx-12 text-muted">Faça login para liberar esta mesa</p>
        </div>

        {/* INPUT HIDDEN PARA A MESA */}
        <input type="hidden" name="mesaId" value={mesaId} />

        <div className="form-group mg-b-15">
            <label className="tx-12 font-bold uppercase">Login</label>
            <input name="login" className="form-control" placeholder="Usuário" required />
        </div>

        <div className="form-group mg-b-20">
            <label className="tx-12 font-bold uppercase">Senha</label>
            <input name="senha" type="password" className="form-control" placeholder="Senha" required />
        </div>

        <button type="submit" className="btn btn-primary btn-block font-bold" disabled={loading}>
            {loading ? 'Validar Acesso' : 'Liberar Mesa'}
        </button>
      </form>
    </div>
  );
}