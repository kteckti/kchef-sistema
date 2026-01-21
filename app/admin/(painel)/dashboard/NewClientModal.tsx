'use client'

import { useState, useRef } from 'react';
import { createClientAction } from '../../actions';
import { toast } from 'react-hot-toast';

export default function NewClientModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [generatedPass, setGeneratedPass] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // Função para fechar e limpar estados
  const handleClose = () => {
    setIsOpen(false);
    setGeneratedPass(null);
  }

  const handleSubmit = async (formData: FormData) => {
    // Validação básica antes de enviar
    if (!formData.get('nome') || !formData.get('url')) {
        toast.error("Preencha os campos obrigatórios");
        return;
    }

    const res = await createClientAction(formData);
    
    if (res?.success) {
      toast.success(res.message);
      
      if (res.tempPassword) {
          setGeneratedPass(res.tempPassword);
          // NÃO fecha o modal aqui, pois queremos mostrar a senha
      } else {
          handleClose(); // Fecha se não tiver senha para mostrar
      }
      
      formRef.current?.reset();
    } else {
      toast.error(res?.error || "Erro ao criar.");
    }
  };

  return (
    <>
      {/* Botão para abrir o Modal */}
      <button 
        type="button" // Importante para não submeter nada na página pai
        onClick={() => setIsOpen(true)} 
        className="btn btn-primary btn-sm" 
        style={{ marginRight: 5 }}
      >
        <i className="fa fa-plus"></i> Nova Empresa
      </button>

      {isOpen && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            
            {/* CABEÇALHO */}
            <div className="modal-header bg-gray-200" style={{padding: '15px', display:'flex', justifyContent:'space-between', alignItems: 'center'}}>
              <h6 className="modal-title mg-b-0">Cadastrar Nova Empresa</h6>
              
              {/* BOTÃO X (FECHAR) */}
              <button 
                type="button"
                onClick={handleClose} 
                style={{border:'none', background:'transparent', fontSize:25, cursor:'pointer', lineHeight: '20px'}}
              >
                &times;
              </button>
            </div>

            {/* CONTEÚDO */}
            {generatedPass ? (
                // TELA DE SUCESSO COM SENHA
                <div className="modal-body text-center" style={{padding: 40}}>
                    <i className="fa fa-check-circle tx-success tx-50 mg-b-20"></i>
                    <h4>Empresa Criada!</h4>
                    <p>Copie a senha abaixo e envie para o cliente:</p>
                    
                    <div className="alert alert-warning tx-20 tx-bold text-dark" style={{userSelect: 'all'}}>
                        {generatedPass}
                    </div>
                    
                    <p className="tx-12 text-muted">O cliente deverá trocar esta senha no primeiro acesso.</p>
                    
                    <button 
                        type="button" 
                        onClick={handleClose} 
                        className="btn btn-primary btn-block mg-t-20"
                    >
                        Entendi, fechar janela
                    </button>
                </div>
            ) : (
                // FORMULÁRIO DE CADASTRO
                <form ref={formRef} action={handleSubmit}>
                  <div className="modal-body" style={{padding: '20px'}}>
                    
                    <div className="form-group">
                      <label className="tx-12">Nome da Empresa: <span className="tx-danger">*</span></label>
                      <input name="nome" className="form-control" required placeholder="Ex: Pizzaria do João" />
                    </div>

                    <div className="form-group">
                      <label className="tx-12">CPF ou CNPJ: <span className="tx-danger">*</span></label>
                      <input name="cpf" className="form-control" required placeholder="000.000.000-00" />
                    </div>

                    <div className="form-group">
                      <label className="tx-12">Link (URL): <span className="tx-danger">*</span></label>
                      <input name="url" className="form-control" required placeholder="Ex: pizzaria-joao" />
                    </div>

                    <div className="row">
                        <div className="col-6 form-group">
                            <label className="tx-12">Celular:</label>
                            <input name="celular" className="form-control" placeholder="11999999999" />
                        </div>
                        <div className="col-6 form-group">
                            <label className="tx-12">Validade:</label>
                            <input type="date" name="validade" className="form-control" />
                        </div>
                    </div>

                  </div>
                  <div className="modal-footer" style={{padding: '15px', borderTop:'1px solid #eee', textAlign:'right'}}>
                    
                    {/* BOTÃO CANCELAR CORRIGIDO */}
                    <button 
                        type="button" // <--- O SEGREDO ESTÁ AQUI
                        onClick={handleClose} 
                        className="btn btn-secondary mg-r-5"
                    >
                        Cancelar
                    </button>

                    <button type="submit" className="btn btn-primary">Gerar Acesso</button>
                  </div>
                </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}

const styles: any = {
  overlay: {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050,
    display: 'flex', alignItems: 'center', justifyContent: 'center'
  },
  modal: {
    backgroundColor: '#fff', width: '100%', maxWidth: '500px',
    borderRadius: '5px', boxShadow: '0 5px 15px rgba(0,0,0,0.3)',
    display: 'flex', flexDirection: 'column'
  }
};