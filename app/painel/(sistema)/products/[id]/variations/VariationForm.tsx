'use client'

import { createVariationAction } from './actions';
import { useRef } from 'react';
import CurrencyInput from 'react-currency-input-field'; 
import { toast } from 'react-hot-toast'; // Importar o Toast

export default function VariationForm({ produtoId }: { produtoId: number }) {
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = async (formData: FormData) => {
    const result = await createVariationAction(formData);

    if (result?.success) {
      toast.success(result.message);
      formRef.current?.reset();
      
      // Hackzinho para limpar visualmente o campo de moeda se necessário
      const valorInput = document.getElementsByName('valor')[0] as HTMLInputElement;
      if(valorInput) valorInput.value = '';
      
    } else if (result?.error) {
      toast.error(result.error);
    }
  };

  return (
    <div className="card pd-20 mg-b-20">
      <h6 className="card-body-title">Nova Variação</h6>
      <form ref={formRef} action={handleSubmit}>
        <input type="hidden" name="produtoId" value={produtoId} />
        
        <div className="row">
          <div className="col-lg-4">
            <div className="form-group">
              <label>Nome (Ex: P, M, G):</label>
              {/* CORREÇÃO: Mudamos de name="nome" para name="descricao" */}
              <input 
                type="text" 
                name="descricao" 
                className="form-control" 
                required 
                placeholder="Ex: Grande" 
              />
            </div>
          </div>

          <div className="col-lg-3">
            <div className="form-group">
              <label>Preço:</label>
              {/* CORREÇÃO: Mudamos de name="preco" para name="valor" */}
              <CurrencyInput
                  name="valor"
                  className="form-control"
                  placeholder="R$ 0,00"
                  decimalsLimit={2}
                  decimalScale={2}
                  decimalSeparator=","
                  groupSeparator="."
                  prefix="R$ "
                  required
              />
            </div>
          </div>

          <div className="col-lg-2">
            <label>&nbsp;</label>
            <button type="submit" className="btn btn-primary btn-block">Adicionar</button>
          </div>
        </div>
      </form>
    </div>
  );
}