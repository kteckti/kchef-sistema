'use client'

import { abrirMesaAction } from '../../actions';
import { toast } from 'react-hot-toast';

interface LoginFormProps {
  slug: string;
  mesaId: string;
  color: string;
  nomeEmpresa: string; // Adicionado aqui
}

export default function LoginForm({ slug, mesaId, color, nomeEmpresa }: LoginFormProps) {
  
  // Função para lidar com o envio e evitar erro de tipagem da action
  const handleSubmit = async (formData: FormData) => {
    // Adicionamos os campos que não estão no input manualmente ao FormData
    formData.append('slug', slug);
    formData.append('mesaId', mesaId);

    const result = await abrirMesaAction(formData);

    if (result?.error) {
      toast.error(result.error);
    }
  };

  return (
    <form action={handleSubmit} className="login-container">
      <div className="login-card">
        {/* Cabeçalho do Card - Agora usando nomeEmpresa vindo das props */}
        <h2 className="tx-gray-800 font-bold mg-b-5">{nomeEmpresa}</h2>
        <p className="tx-12 text-muted mg-b-20 uppercase font-bold">Abrir Comanda - Mesa {mesaId}</p>
        
        <hr className="mg-b-20" />

        <div className="row row-xs">
          <div className="col-4">
            <div className="form-group-custom">
              <label>Mesa</label>
              <input className="input-padrao" value={mesaId} disabled style={{ background: '#f2f2f2' }} />
            </div>
          </div>
          <div className="col-8">
            <div className="form-group-custom">
              <label>Pessoas</label>
              <input name="pessoas" type="number" className="input-padrao" defaultValue="1" min="1" />
            </div>
          </div>
        </div>

        <div className="form-group-custom">
          <label>Seu Nome</label>
          <input name="nome" placeholder="Como podemos te chamar?" className="input-padrao" required />
        </div>

        <div className="form-group-custom">
          <label>Seu Celular (WhatsApp)</label>
          <input name="celular" placeholder="(00) 00000-0000" className="input-padrao" required />
          <small className="text-muted tx-10">Usaremos para avisar sobre seu pedido.</small>
        </div>

        <button type="submit" className="btn-iniciar-pedido" style={{ backgroundColor: color }}>
          <span>Iniciar Pedido</span>
          <i className="fa fa-chevron-right tx-12"></i>
        </button>
      </div>

      <div className="secure-footer">
        <i className="fa fa-lock"></i> Ambiente Seguro
      </div>
    </form>
  );
}