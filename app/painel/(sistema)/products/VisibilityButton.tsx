'use client'

import { useState } from 'react';
import { updateVisibilityAction } from './actions';
import { toast } from 'react-hot-toast';

interface Props {
  productId: number;
  currentValue: string | null; // Pode vir "1,2" ou "G" ou null
}

export default function VisibilityButton({ productId, currentValue }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Transforma a string do banco ("1,3") em um array (['1', '3']) para o React controlar
  // Se for null ou vazio, assume 'G'
  const initialDays = currentValue && currentValue !== '' ? currentValue.split(',') : ['G'];
  
  const [selectedDays, setSelectedDays] = useState<string[]>(initialDays);

  const options = [
    { value: '1', label: 'Segunda-feira' },
    { value: '2', label: 'Terça-feira' },
    { value: '3', label: 'Quarta-feira' },
    { value: '4', label: 'Quinta-feira' },
    { value: '5', label: 'Sexta-feira' },
    { value: '6', label: 'Sábado' },
    { value: '0', label: 'Domingo' },
  ];

  // Função para controlar a seleção inteligente
  const handleCheckboxChange = (value: string) => {
    if (value === 'G') {
      // Se clicou em "Todos", limpa o resto e deixa só G
      setSelectedDays(['G']);
    } else {
      // Se clicou em um dia específico
      let newSelection = [...selectedDays];

      // Se "Todos" estava marcado, desmarca ele, pois agora é específico
      if (newSelection.includes('G')) {
        newSelection = [];
      }

      if (newSelection.includes(value)) {
        // Se já estava, remove (desmarcar)
        newSelection = newSelection.filter(d => d !== value);
      } else {
        // Se não estava, adiciona
        newSelection.push(value);
      }

      // Se desmarcou tudo, volta para 'G' automaticamente? Ou deixa vazio?
      // Vamos deixar vazio visualmente, mas o backend vai forçar G se enviar vazio.
      setSelectedDays(newSelection);
    }
  };

  const handleSave = async (formData: FormData) => {
    setLoading(true);
    const res = await updateVisibilityAction(formData);
    setLoading(false);

    if (res?.success) {
      toast.success(res.message);
      setIsOpen(false);
    } else {
      toast.error(res?.error || "Erro");
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)} 
        className="btn btn-success btn-sm" 
        title="Dias de Exibição"
        style={{ marginRight: 5 }}
      >
        <i className="fa fa-calendar"></i>
      </button>

      {isOpen && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <div className="modal-header">
              <h6 className="modal-title">Dias de Exibição</h6>
              <button 
                onClick={() => setIsOpen(false)} 
                className="close" 
                style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer' }}
              >
                &times;
              </button>
            </div>
            
            <form action={handleSave}>
              <div className="modal-body" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                <p className="text-muted tx-12">Selecione os dias que o produto estará disponível:</p>
                <input type="hidden" name="id" value={productId} />
                
                {/* OPÇÃO: TODOS OS DIAS */}
                <div style={styles.optionRow}>
                    <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', fontWeight: 'bold' }}>
                        <input 
                            type="checkbox" 
                            name="days" 
                            value="G" 
                            checked={selectedDays.includes('G')}
                            onChange={() => handleCheckboxChange('G')}
                            style={{ marginRight: 10, transform: 'scale(1.2)' }}
                        />
                        Todos os Dias
                    </label>
                </div>

                <hr style={{ margin: '10px 0' }} />

                {/* OPÇÕES: DIAS DA SEMANA */}
                {options.map(opt => (
                  <div key={opt.value} style={styles.optionRow}>
                    <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                        <input 
                            type="checkbox" 
                            name="days" 
                            value={opt.value}
                            checked={selectedDays.includes(opt.value)}
                            onChange={() => handleCheckboxChange(opt.value)}
                            style={{ marginRight: 10, transform: 'scale(1.2)' }}
                        />
                        {opt.label}
                    </label>
                  </div>
                ))}

              </div>
              
              <div className="modal-footer">
                <button 
                  type="button" 
                  onClick={() => setIsOpen(false)} 
                  className="btn btn-secondary"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? 'Salvando...' : 'Confirmar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

const styles = {
  overlay: {
    position: 'fixed' as 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999
  },
  modal: {
    backgroundColor: '#fff',
    borderRadius: '5px',
    width: '100%',
    maxWidth: '400px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    display: 'flex',
    flexDirection: 'column' as 'column'
  },
  optionRow: {
      padding: '8px 0'
  }
};