'use client' // Importante: Agora é um componente de cliente para ter interatividade

import { useFormState, useFormStatus } from 'react-dom';
import { loginAction } from '../actions';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Toaster, toast } from 'react-hot-toast'; // O Popup
import "../../slim.css";

// Componente do botão para mostrar "Carregando..."
function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button disabled={pending} type="submit" className="btn btn-primary btn-block btn-signin">
      {pending ? 'Entrando...' : 'Entrar'}
    </button>
  );
}

export default function LoginPage() {
  const router = useRouter();
  // useFormState gerencia o retorno da nossa Server Action
  const [state, formAction] = useFormState(loginAction, null);

  useEffect(() => {
    if (state?.error) {
      // Dispara o Popup de erro
      toast.error(state.error, {
        style: {
          background: '#dc3545',
          color: '#fff',
        }
      });
    }
    if (state?.success) {
      toast.success("Login realizado!", {
        duration: 2000,
        style: { background: '#23BF08', color: '#fff' }
      });
      // Redireciona via cliente após sucesso
      router.push('/admin/dashboard');
    }
  }, [state, router]);

  return (
    <div className="signin-wrapper">
      {/* Componente que renderiza os popups na tela */}
      <Toaster position="top-center" /> 
      
      <div className="signin-box">
        <h2 className="slim-logo text-center">
          <a href="#">Kteck<span>Delivery</span></a>
        </h2>
        <h3 className="signin-title-primary">Bem-vindo de volta!</h3>
        <p className="signin-title-secondary">Faça login para continuar.</p>

        <form action={formAction}>
          <div className="form-group">
            <input 
              type="text" 
              name="login"
              className="form-control" 
              placeholder="Digite seu login"
              required
            />
          </div>
          <div className="form-group">
            <input 
              type="password" 
              name="password"
              className="form-control" 
              placeholder="Digite sua senha"
              required
            />
          </div>
          
          <SubmitButton />
        </form>
        
        <p className="mg-b-0 text-center">Não consegue entrar? Contate o suporte.</p>
      </div>
    </div>
  );
}