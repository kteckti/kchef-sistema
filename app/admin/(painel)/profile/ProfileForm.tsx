'use client'

import { useFormState } from 'react-dom';
import { updateProfileAction } from '@/app/admin/actions';
import { useEffect } from 'react';
import { toast } from 'react-hot-toast';

export default function ProfileForm({ data }: { data: any }) {
  const [state, formAction] = useFormState(updateProfileAction, null);

  useEffect(() => {
    if (state?.success) {
      toast.success(state.message, { style: { background: '#23BF08', color: '#fff' } });
    } else if (state?.success === false) {
      toast.error(state.message, { style: { background: '#dc3545', color: '#fff' } });
    }
  }, [state]);

  return (
    <form action={formAction}>
      <input type="hidden" name="id" value={data.id} />
      <div className="row">
        <div className="col-md-3">
          <div className="form-group">
            <label>Nome</label>
            <input type="text" name="nome" className="form-control" defaultValue={data.nome} />
          </div>
        </div>
        <div className="col-md-3">
          <div className="form-group">
            <label>Login</label>
            <input type="text" name="login" className="form-control" defaultValue={data.login} />
          </div>
        </div>
        <div className="col-md-3">
          <div className="form-group">
            <label>Celular</label>
            <input type="text" name="celular" className="form-control" defaultValue={data.celular} />
          </div>
        </div>
        <div className="col-md-3">
          <div className="form-group">
            <label>Nova Senha</label>
            <input type="password" name="senha" className="form-control" placeholder="******" />
          </div>
        </div>
      </div>

      <div className="row mg-t-20">
        <div className="col-md-12 text-center">
           <button type="submit" className="btn btn-info">SALVAR PERFIL</button>
        </div>
      </div>
    </form>
  );
}