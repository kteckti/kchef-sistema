'use client'

import { useState } from 'react';
import { updateClientDataAction, toggleClientStatusAction, resetClientPasswordAction } from '../../../actions'; // Ajuste o caminho das actions
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export default function ClientDetailForm({ cliente }: { cliente: any }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const logoPreview = cliente.logo ? `/img/logomarca/${cliente.logo}` : null;
  const bannerPreview = cliente.fundoTopo ? `/img/fundo_banner/${cliente.fundoTopo}` : null;
  
  // Estado para mostrar a senha resetada
  const [newPass, setNewPass] = useState<string | null>(null);

  // Formatar data para o input date (YYYY-MM-DD)
  const dataFormatada = cliente.expiracao 
    ? new Date(cliente.expiracao).toISOString().split('T')[0] 
    : '';

  // --- HANDLERS ---
  
  const handleUpdate = async (formData: FormData) => {
    setLoading(true);
    const res = await updateClientDataAction(formData);
    setLoading(false);
    
    if (res?.success) {
        toast.success(res.message);
        router.refresh();
    } else {
        toast.error(res?.error || "Erro");
    }
  };
  const handleToggleStatus = async () => {
    if(!confirm(cliente.status === 1 ? "Tem certeza que deseja CORTAR o acesso desta empresa?" : "Deseja liberar o acesso novamente?")) return;

    const res = await toggleClientStatusAction(cliente.id, cliente.status);
    if (res?.success) {
        toast.success(res.message);
        router.refresh(); // Atualiza a cor do status na tela
    }
  };

  const handleResetPassword = async () => {
    if(!confirm("Isso vai gerar uma nova senha aleatória e desconectar o cliente. Continuar?")) return;

    const res = await resetClientPasswordAction(cliente.id);
    if (res?.success && res.newPassword) {
        setNewPass(res.newPassword);
        toast.success("Senha gerada com sucesso!");
    } else {
        toast.error("Erro ao gerar senha");
    }
  };

  return (
    <div className="row row-sm">
      {/* COLUNA ESQUERDA: FORMULÁRIO DE EDIÇÃO */}
      <div className="col-lg-8">
        <div className="card card-body pd-20 mg-t-10">
          <h6 className="card-title mg-b-20">Editar Informações</h6>
          
          <form action={handleUpdate}>
            <input type="hidden" name="id" value={cliente.id} />
            
            <div className="form-group">
              <label className="tx-12 tx-bold">Nome da Empresa</label>
              <input name="nome" className="form-control" defaultValue={cliente.nomeempresa} required />
            </div>

            <div className="row">
              <div className="col-md-6 form-group">
                <label className="tx-12 tx-bold">CPF / CNPJ</label>
                <input name="cpf" className="form-control" defaultValue={cliente.cpf || ''} />
              </div>
              <div className="col-md-6 form-group">
                 <label className="tx-12 tx-bold">URL (Slug)</label>
                 <input name="url" className="form-control" defaultValue={cliente.url} required />
              </div>
              <div className="col-md-6 form-group">
                 <label className="tx-12 tx-bold">Cor do Tema (Hex)</label>
                 <input type="color" name="cormenu" className="form-control" style={{height: 40}} defaultValue={cliente.cormenu || '#3d734a'} />
              </div>
            </div>

            <hr />
            <h6 className="mg-b-15">Imagens</h6>

            {/* UPLOAD LOGO */}
            <div className="row mg-b-20">
                <div className="col-md-4">
                    {logoPreview && <img src={logoPreview} className="img-thumbnail" style={{height: 80}} />}
                </div>
                <div className="col-md-8">
                    <label className="tx-12 tx-bold">Logo da Loja:</label>
                    <input type="file" name="logo" className="form-control" accept="image/*" />
                </div>
            </div>

            {/* UPLOAD BANNER */}
            <div className="row mg-b-20">
                <div className="col-md-4">
                    {bannerPreview && <img src={bannerPreview} className="img-thumbnail" style={{height: 80, objectFit:'cover', width:'100%'}} />}
                </div>
                <div className="col-md-8">
                    <label className="tx-12 tx-bold">Banner do Topo:</label>
                    <input type="file" name="banner" className="form-control" accept="image/*" />
                </div>
            </div>
            <hr />
            <div className="row">
              <div className="col-md-6 form-group">
                <label className="tx-12 tx-bold">Celular / WhatsApp</label>
                <input name="celular" className="form-control" defaultValue={cliente.celular || ''} />
              </div>
              <div className="col-md-6 form-group">
                 <label className="tx-12 tx-bold">Validade do Plano</label>
                 <input type="date" name="validade" className="form-control" defaultValue={dataFormatada} />
              </div>
            </div>

            <button className="btn btn-primary mg-t-10">
              <i className="fa fa-save"></i> Salvar Alterações
            </button>
          </form>
        </div>
      </div>

      {/* COLUNA DIREITA: AÇÕES DE CONTROLE */}
      <div className="col-lg-4">
        
        {/* CARD DE STATUS */}
        <div className="card card-body pd-20 mg-t-10">
            <h6 className="card-title">Status do Acesso</h6>
            <div className={`alert ${cliente.status === 1 ? 'alert-success' : 'alert-danger'}`}>
                {cliente.status === 1 ? 
                    <span><i className="fa fa-check-circle"></i> ATIVO</span> : 
                    <span><i className="fa fa-ban"></i> BLOQUEADO</span>
                }
            </div>

            <button 
                onClick={handleToggleStatus}
                className={`btn btn-block ${cliente.status === 1 ? 'btn-outline-danger' : 'btn-outline-success'}`}
            >
                {cliente.status === 1 ? 'Cortar Acesso' : 'Liberar Acesso'}
            </button>
        </div>

        {/* CARD DE SENHA */}
        <div className="card card-body pd-20 mg-t-20">
            <h6 className="card-title">Segurança</h6>
            <p className="tx-12 text-muted">O cliente esqueceu a senha? Gere uma nova aqui.</p>
            
            <button onClick={handleResetPassword} className="btn btn-warning btn-block">
                <i className="fa fa-key"></i> Gerar Nova Senha
            </button>

            {/* MOSTRA A NOVA SENHA SE TIVER SIDO GERADA */}
            {newPass && (
                <div className="alert alert-warning mg-t-15 text-center">
                    <p className="mg-b-0 tx-12">Nova senha gerada:</p>
                    <h3 className="tx-bold text-dark" style={{userSelect:'all'}}>{newPass}</h3>
                    <p className="mg-b-0 tx-10 text-danger">Copie agora! Ela não será mostrada novamente.</p>
                </div>
            )}
        </div>

      </div>
    </div>
  );
}