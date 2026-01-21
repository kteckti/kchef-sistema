'use client'

import { useFormState, useFormStatus } from 'react-dom';
import "../../slim.css"; // Verifique se o caminho do CSS está correto
import { lojaLoginAction } from '../actions';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Toaster, toast } from 'react-hot-toast';
import FirstAccessModal from './FirstAccessModal';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button disabled={pending} type="submit" className="btn btn-primary btn-block btn-signin">
      {pending ? 'Verificando...' : 'Entrar no Painel'}
    </button>
  );
}

export default function LojaLoginPage() {
  const router = useRouter();
  const [state, formAction] = useFormState(lojaLoginAction, null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    // 1. Caso de Erro (Senha errada, usuário não encontrado, etc)
    if (state?.error) {
      toast.error(state.error, { style: { background: '#dc3545', color: '#fff' } });
    }

    // 2. CASO NOVO: Login correto, mas requer troca de senha (Primeiro Acesso)
    if (state?.requirePasswordChange) {
      setShowModal(true); // <--- Abre a janela do Modal
      toast('Primeiro acesso: Defina sua senha pessoal.', { 
        icon: '🔒',
        duration: 4000 
      });
      return; // Importante: Interrompe aqui para NÃO redirecionar ainda
    }

    // 3. Caso de Sucesso Total (Já trocou a senha ou não precisa trocar)
    if (state?.success) {
      toast.success("Bem-vindo de volta!", {
        duration: 2000,
        style: { background: '#23BF08', color: '#fff' }
      });
      
      // Redireciona para o dashboard
      window.location.href = '/painel/dashboard';
    }
  }, [state, router]);

  return (
    <div className="signin-wrapper">
      <Toaster position="top-center" />
      
      {/* O Modal fica aqui, invisível até o state.requirePasswordChange ser true */}
      <FirstAccessModal isOpen={showModal} />

      <div className="signin-box">
        <h3 className="signin-title-primary text-center">Painel do Cliente</h3>
        <p className="text-center tx-gray-600">Gerencie seu delivery</p>

        <form action={formAction}>
          <div className="form-group">
            <input 
              type="text" 
              name="cpf"
              className="form-control" 
              placeholder="CPF ou CNPJ (somente números)"
              required
              maxLength={18}
            />
          </div>
          <div className="form-group">
            <input 
              type="password" 
              name="password"
              className="form-control" 
              placeholder="Senha"
              required
              maxLength={20} // Aumentei um pouco caso a senha criptografada seja longa, mas 8 também serve
            />
          </div>
          
          <SubmitButton />
        </form>
        
        <p className="mg-b-0 text-center">Esqueceu sua senha? Contate o suporte.</p>
      </div>
    </div>
  );
}