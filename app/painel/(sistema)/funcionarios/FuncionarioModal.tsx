'use client'

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { salvarFuncionario } from './actions';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  funcionario?: any; // Se vier preenchido, é edição
}

export default function FuncionarioModal({ isOpen, onClose, funcionario }: Props) {
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (formData: FormData) => {
    setLoading(true);
    const res = await salvarFuncionario(formData);
    setLoading(false);

    if (res?.error) {
      toast.error(res.error);
    } else {
      toast.success(funcionario ? "Funcionário atualizado!" : "Funcionário cadastrado!");
      onClose();
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999,
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <div className="bg-white pd-20 rounded shadow-lg" style={{ width: '100%', maxWidth: '400px' }}>
        <h5 className="font-bold mg-b-20">{funcionario ? 'Editar Funcionário' : 'Novo Funcionário'}</h5>
        
        <form action={handleSubmit}>
          {funcionario && <input type="hidden" name="id" value={funcionario.id} />}

          <div className="form-group">
            <label className="tx-12 font-bold">Nome Completo</label>
            <input name="nome" className="form-control" defaultValue={funcionario?.nome} required />
          </div>

          <div className="form-group">
            <label className="tx-12 font-bold">Função</label>
            <select name="funcao" className="form-control" defaultValue={funcionario?.funcao || "ATENDIMENTO"}>
              <option value="GERENTE">Gerente (Acesso Total)</option>
              <option value="CAIXA">Caixa (PDV)</option>
              <option value="ATENDIMENTO">Atendimento (Cardápio/Pedidos)</option>
              <option value="COZINHA">Cozinha (Monitor de Produção)</option>
            </select>
          </div>

          <div className="row">
            <div className="col-6">
              <div className="form-group">
                <label className="tx-12 font-bold">Login</label>
                <input name="login" className="form-control" defaultValue={funcionario?.login} required />
              </div>
            </div>
            <div className="col-6">
              <div className="form-group">
                <label className="tx-12 font-bold">Senha</label>
                <input 
                    name="senha" 
                    type="password" 
                    className="form-control" 
                    placeholder={funcionario ? "Deixe em branco p/ manter" : "Senha inicial"} 
                    required={!funcionario} // Obrigatório apenas se for novo
                />
              </div>
            </div>
          </div>

          <div className="d-flex justify-content-end mg-t-20 gap-2">
            <button type="button" onClick={onClose} className="btn btn-secondary mg-r-5">Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}