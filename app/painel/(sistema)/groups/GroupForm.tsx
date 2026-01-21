'use client'

import { useRef } from 'react';
import { createGroupAction } from './actions';
import { toast } from 'react-hot-toast';

export default function GroupForm() {
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = async (formData: FormData) => {
    // Chamamos a Server Action e esperamos a resposta
    const result = await createGroupAction(formData);

    if (result?.error) {
      toast.error(result.error);
    } else if (result?.success) {
      toast.success(result.message);
      formRef.current?.reset(); // Limpa o formulário após o sucesso
    }
  };

  return (
    <div className="section-wrapper mg-b-20">
        <label className="section-title">Cadastrar Novo Grupo</label>
        <hr />
        {/* Aqui usamos o handleSubmit customizado, não a action direta */}
        <form ref={formRef} action={handleSubmit}>
          <div className="row">
            <div className="col-lg-6">
              <label>Nome Interno (Admin):</label>
              <input type="text" name="nomeinterno" className="form-control" required placeholder="Ex: Bordas Salgadas" />
            </div>
            <div className="col-lg-6">
              <label>Nome Externo (Cliente):</label>
              <input type="text" name="nomegrupo" className="form-control" required placeholder="Ex: Escolha sua Borda" />
            </div>
          </div>
          <br/>
          <div className="row">
            <div className="col-lg-2">
              <label>Posição:</label>
              <input type="number" name="posicao" className="form-control" defaultValue="1" />
            </div>
            <div className="col-lg-2">
              <label>Máx. Seleção:</label>
              <input type="number" name="quantidade" className="form-control" defaultValue="1" />
            </div>
            <div className="col-lg-6">
              <label>Tipo de Regra:</label>
              <select name="obrigatorio" className="form-control">
                <option value="1">Obrigatório (Escolher exatemente 1)</option>
                <option value="2">Opcional (Até X itens)</option>
                <option value="3">Sabores (Meio a Meio)</option>
              </select>
            </div>
            <div className="col-lg-2">
              <label>&nbsp;</label>
              <button type="submit" className="btn btn-primary btn-block">Salvar</button>
            </div>
          </div>
        </form>
      </div>
  );
}