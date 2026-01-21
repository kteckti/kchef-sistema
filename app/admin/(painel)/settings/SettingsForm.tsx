'use client'

import { useFormState } from 'react-dom';
import { updateSettingsAction } from '@/app/admin/actions';
import { useEffect } from 'react';
import { toast } from 'react-hot-toast';

export default function SettingsForm({ config }: { config: any }) {
  const [state, formAction] = useFormState(updateSettingsAction, null);

  useEffect(() => {
    if (state?.success) {
      toast.success(state.message, { style: { background: '#23BF08', color: '#fff' } });
    } else if (state?.success === false) {
      toast.error(state.message, { style: { background: '#dc3545', color: '#fff' } });
    }
  }, [state]);

  return (
    <form action={formAction}>
      <div className="row">
        <div className="col-md-3">
          <div className="form-group">
            <label>Novo Cadastro (Aprovação)?</label>
            <select name="novocliente" className="form-control" defaultValue={config.novocliente || '1'}>
              <option value="1">Liberar Automático</option>
              <option value="2">Liberação Manual</option>
            </select>
          </div>
        </div>

        <div className="col-md-2">
          <div className="form-group">
            <label>Dias de Teste</label>
            <input type="text" name="dias" className="form-control" defaultValue={config.dias || '7'} />
          </div>
        </div>

        <div className="col-md-3">
            <div className="form-group">
            <label>Bloqueio Automático?</label>
            <select name="bloquear" className="form-control" defaultValue={config.bloquear || 1}>
              <option value="1">Sim</option>
              <option value="2">Não</option>
            </select>
          </div>
        </div>
        
          <div className="col-md-4">
            <div className="form-group">
            <label>Link Pagamento no Painel?</label>
            <select name="statuslink" className="form-control" defaultValue={config.statuslink || 1}>
              <option value="1">Liberado</option>
              <option value="2">Bloqueado</option>
            </select>
          </div>
        </div>
      </div>

      <hr/>
      
      <div className="row">
        <div className="col-md-6">
          <div className="form-group">
            <label>Nome do Site</label>
            <input type="text" name="nomedosite" className="form-control" defaultValue={config.nomedosite} />
          </div>
        </div>
        <div className="col-md-6">
          <div className="form-group">
            <label>URL do Site</label>
            <input type="text" name="urlsite" className="form-control" defaultValue={config.urlsite} />
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-md-12">
          <div className="form-group">
            <label>Código Link Pagamento (HTML/Script)</label>
            <textarea name="linkpgmto" className="form-control" rows={5} defaultValue={config.linkpgmto}></textarea>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-md-12 text-center">
          <button type="submit" className="btn btn-info">SALVAR ALTERAÇÕES</button>
        </div>
      </div>
    </form>
  );
}