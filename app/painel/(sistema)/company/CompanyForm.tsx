'use client'

import { updateCompanyAction } from './actions';
import { toast } from 'react-hot-toast';

export default function CompanyForm({ data }: { data: any }) {

  const handleSubmit = async (formData: FormData) => {
    const result = await updateCompanyAction(formData);
    if (result?.success) {
      toast.success(result.message);
    } else {
      toast.error(result?.error || "Erro ao salvar");
    }
  };

  const logoPreview = data.logo ? `/img/logomarca/${data.logo}` : null;
  const bannerPreview = data.fundoTopo ? `/img/fundo_banner/${data.fundoTopo}` : null;

  // Helper para pegar um horário específico da string (ex: "08:00,12:00..." pega o primeiro)
  const getHour = (dayString: string | null, index: number) => {
    if (!dayString) return '';
    const parts = dayString.split(',');
    return parts[index] || '';
  };

  // Componente visual para uma linha de dia da semana
  const DayRow = ({ label, prefix, value }: { label: string, prefix: string, value: string | null }) => (
    <>
      <hr />
      <div className="row align-items-center">
        <div className="col-md-2"><label style={{ fontWeight: 'bold' }}>{label}</label></div>
        <div className="col-md-2">
          <small>Abre (Manhã)</small>
          <input type="time" className="form-control" name={`${prefix}1`} defaultValue={getHour(value, 0)} />
        </div>
        <div className="col-md-2">
          <small>Fecha (Almoço)</small>
          <input type="time" className="form-control" name={`${prefix}2`} defaultValue={getHour(value, 1)} />
        </div>
        <div className="col-md-2">
          <small>Reabre (Tarde)</small>
          <input type="time" className="form-control" name={`${prefix}3`} defaultValue={getHour(value, 2)} />
        </div>
        <div className="col-md-2">
          <small>Fecha (Noite)</small>
          <input type="time" className="form-control" name={`${prefix}4`} defaultValue={getHour(value, 3)} />
        </div>
      </div>
    </>
  );

  return (
    <form action={handleSubmit}>

      {/* CARD 1: DADOS GERAIS */}
      <div className="section-wrapper mg-b-20">
        <label className="section-title"><i className="fa fa-info-circle"></i> Dados Gerais</label>
        <p className="mg-b-20 text-muted">Informações básicas que aparecem no cabeçalho do app.</p>

        <div className="form-layout">
          <div className="row mg-b-25">
            <div className="col-lg-4">
              <div className="form-group">
                <label className="form-control-label">Nome da Empresa: <span className="tx-danger">*</span></label>
                <input type="text" className="form-control" name="nome" defaultValue={data.nomeempresa} required />
              </div>
            </div>
            <div className="col-lg-3">
              <div className="form-group">
                <label className="form-control-label">WhatsApp (Apenas números): <span className="tx-danger">*</span></label>
                <input type="text" className="form-control" name="celular" defaultValue={data.celular} required maxLength={11} />
              </div>
            </div>
            <div className="col-lg-2">
              <div className="form-group">
                <label className="form-control-label">Tempo Delivery:</label>
                <input type="text" className="form-control" name="timerdelivery" defaultValue={data.timerdelivery} placeholder="Ex: 40-50 min" />
              </div>
            </div>
            <div className="col-lg-2">
              <div className="form-group">
                <label className="form-control-label">Tempo Balcão:</label>
                <input type="text" className="form-control" name="timerbalcao" defaultValue={data.timerbalcao} placeholder="Ex: 20 min" />
              </div>
            </div>
            <div className="col-lg-2">
              <div className="form-group">
                <label className="form-control-label" style={{ color: 'green' }}>Entrega Grátis acima de:</label>
                <input type="text" className="form-control" name="dfree" defaultValue={data.dfree?.toString()} placeholder="0.00" />
              </div>
            </div>
          </div>

          <label className="section-title mt-4">Endereço</label>
          <div className="row mg-b-25">
            <div className="col-lg-2">
              <input type="text" name="cep" className="form-control" placeholder="CEP" defaultValue={data.cep} />
            </div>
            <div className="col-lg-4">
              <input type="text" name="rua" className="form-control" placeholder="Rua / Logradouro" defaultValue={data.rua} />
            </div>
            <div className="col-lg-2">
              <input type="text" name="numero" className="form-control" placeholder="Número" defaultValue={data.numero} />
            </div>
            <div className="col-lg-4">
              <input type="text" name="bairro" className="form-control" placeholder="Bairro" defaultValue={data.bairro} />
            </div>
            <div className="col-lg-4 mt-3">
              <input type="text" name="cidade" className="form-control" placeholder="Cidade" defaultValue={data.cidade} />
            </div>
            <div className="col-lg-2 mt-3">
              <input type="text" name="uf" className="form-control" placeholder="UF" defaultValue={data.uf} maxLength={2} />
            </div>
            <div className="col-lg-6 mt-3">
              <input type="text" name="complemento" className="form-control" placeholder="Complemento (Opcional)" defaultValue={data.complemento} />
            </div>
          </div>
        </div>
      </div>

      <hr />
      <h6 className="mg-b-15">Imagens</h6>

      {/* UPLOAD LOGO */}
      <div className="row mg-b-20">
        <div className="col-md-4">
          {logoPreview && <img src={logoPreview} className="img-thumbnail" style={{ height: 80 }} />}
        </div>
        <div className="col-md-8">
          <label className="tx-12 tx-bold">Logo da Loja:</label>
          <input type="file" name="logo" className="form-control" accept="image/*" />
        </div>
      </div>

      {/* UPLOAD BANNER */}
      <div className="row mg-b-20">
        <div className="col-md-4">
          {bannerPreview && <img src={bannerPreview} className="img-thumbnail" style={{ height: 80, objectFit: 'cover', width: '100%' }} />}
        </div>
        <div className="col-md-8">
          <label className="tx-12 tx-bold">Banner do Topo:</label>
          <input type="file" name="banner" className="form-control" accept="image/*" />
        </div>
      </div>
      <hr />

      {/* CARD 2: HORÁRIOS */}
      <div className="section-wrapper mg-b-20">
        <label className="section-title"><i className="fa fa-clock-o"></i> Horário de Funcionamento</label>
        <p className="text-muted">Defina os intervalos. O sistema fechará a loja automaticamente fora desses horários.</p>

        <DayRow label="Segunda" prefix="seg" value={data.seg} />
        <DayRow label="Terça" prefix="ter" value={data.ter} />
        <DayRow label="Quarta" prefix="qua" value={data.qua} />
        <DayRow label="Quinta" prefix="qui" value={data.qui} />
        <DayRow label="Sexta" prefix="sex" value={data.sex} />
        <DayRow label="Sábado" prefix="sab" value={data.sab} />
        <DayRow label="Domingo" prefix="dom" value={data.dom} />

        <div className="form-layout-footer mt-4" style={{ textAlign: 'center' }}>
          <button className="btn btn-primary bd-0 btn-lg">
            <i className="fa fa-save"></i> Salvar Alterações
          </button>
        </div>
      </div>

    </form>
  );
}