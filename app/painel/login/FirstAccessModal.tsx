'use client'

import { useState } from 'react';
import { updatePasswordFirstAccess } from '../actions'; // Ajuste o caminho
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export default function FirstAccessModal({ isOpen }: { isOpen: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleUpdate = async (formData: FormData) => {
    setLoading(true);
    const res = await updatePasswordFirstAccess(formData);
    
    if (res?.success) {
      toast.success("Senha atualizada! Entrando...");
      // Redireciona para o painel agora que tudo está certo
      window.location.href = "/painel/dashboard"; 
    } else {
      toast.error(res?.error || "Erro ao trocar senha");
      setLoading(false);
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div className="modal-header bg-warning" style={{padding: '15px'}}>
          <h6 className="modal-title tx-white tx-bold">
            <i className="fa fa-lock mg-r-5"></i> Segurança: Defina sua Senha
          </h6>
        </div>

        <form action={handleUpdate}>
          <div className="modal-body" style={{padding: '25px'}}>
            <p className="text-muted mg-b-20">
              Este é seu primeiro acesso. Para sua segurança, defina uma nova senha pessoal.
            </p>

            <div className="form-group">
              <label className="tx-12 tx-bold">Nova Senha:</label>
              <input type="password" name="novaSenha" className="form-control" placeholder="Mínimo 4 caracteres" required />
            </div>

            <div className="form-group">
              <label className="tx-12 tx-bold">Confirme a Nova Senha:</label>
              <input type="password" name="confirmSenha" className="form-control" placeholder="Digite novamente" required />
            </div>
          </div>

          <div className="modal-footer" style={{padding: '15px', borderTop:'1px solid #eee', textAlign:'right'}}>
            <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar Senha e Entrar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const styles: any = {
  overlay: {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 9999,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    backdropFilter: 'blur(5px)' // Efeito borrado no fundo
  },
  modal: {
    backgroundColor: '#fff', width: '90%', maxWidth: '400px',
    borderRadius: '8px', boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
    display: 'flex', flexDirection: 'column', overflow: 'hidden'
  }
};