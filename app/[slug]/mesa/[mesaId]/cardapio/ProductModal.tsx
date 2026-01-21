'use client'

import { useState, useEffect } from 'react';

type Produto = {
  id: number;
  categoria: number;
  nome: string;
  descricao?: string | null;
  valor: number;
  foto?: string | null;
  ingredientes?: string | null;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  product: Produto | null;
  color: string;
  onAddToCart: (item: any) => void;
};

export default function ProductModal({ isOpen, onClose, product, color, onAddToCart }: Props) {
  const [quantity, setQuantity] = useState(1);
  const [obs, setObs] = useState('');

  useEffect(() => {
    if (isOpen) {
      setQuantity(1);
      setObs('');
      // Bloqueia rolagem do fundo
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => { document.body.style.overflow = 'auto'; }
  }, [isOpen, product]);

  if (!isOpen || !product) return null;

  const total = product.valor * quantity;

  const handleConfirm = () => {
    const cartItem = {
      product,
      quantity,
      obs,
      total,
    };
    onAddToCart(cartItem);
    onClose();
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal} className="animate-slide-up">
        
        {/* Cabeçalho com Foto */}
        <div style={styles.header}>
            <img 
                src={product.foto ? `/img/fotos_produtos/${product.foto}` : '/img/off.jpg'} 
                style={styles.image}
            />
            <button onClick={onClose} style={styles.closeBtn}>&times;</button>
        </div>

        {/* Corpo com Scroll */}
        <div style={styles.body}>
            <h4 style={{ margin: '0 0 5px 0', color: '#333' }}>{product.nome}</h4>
            
            {product.ingredientes && product.ingredientes !== 'N' && (
                <p style={{ fontSize: '13px', color: '#666', marginBottom: '15px' }}>{product.ingredientes}</p>
            )}

            <h3 style={{ color: '#28a745', fontWeight: 'bold' }}>
                R$ {product.valor.toFixed(2).replace('.', ',')}
            </h3>

            <hr style={{ margin: '15px 0', borderTop: '1px solid #eee' }} />

            <div className="form-group">
                <label style={{ fontWeight: 'bold', fontSize: '12px' }}><i className="fa fa-comment-o"></i> Alguma observação?</label>
                <textarea 
                    className="form-control" 
                    rows={3} 
                    placeholder="Ex: Sem cebola, capricha no molho..."
                    value={obs}
                    onChange={(e) => setObs(e.target.value)}
                ></textarea>
            </div>
        </div>

        {/* Rodapé Fixo */}
        <div style={styles.footer}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                
                {/* Contador */}
                <div style={styles.counterBox}>
                    <button onClick={() => setQuantity(q => Math.max(1, q - 1))} style={styles.counterBtn}>-</button>
                    <span style={styles.counterNum}>{quantity}</span>
                    <button onClick={() => setQuantity(q => q + 1)} style={styles.counterBtn}>+</button>
                </div>

                {/* Botão Adicionar */}
                <button 
                    onClick={handleConfirm}
                    className="btn btn-block"
                    style={{ 
                        backgroundColor: color || '#28a745', 
                        color: '#fff', 
                        marginLeft: '15px',
                        flex: 1,
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontWeight: 'bold'
                    }}
                >
                    <span>ADICIONAR</span>
                    <span>R$ {total.toFixed(2).replace('.', ',')}</span>
                </button>
            </div>
        </div>

      </div>
    </div>
  );
}

// Estilos CSS-in-JS para substituir o Tailwind e garantir funcionamento com Slim
const styles: any = {
  overlay: {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 9999,
    display: 'flex', alignItems: 'flex-end', justifyContent: 'center' // Alinha em baixo no mobile
  },
  modal: {
    backgroundColor: '#fff', 
    width: '100%', maxWidth: '500px',
    maxHeight: '90vh',
    borderTopLeftRadius: '15px', borderTopRightRadius: '15px',
    display: 'flex', flexDirection: 'column',
    position: 'relative',
    boxShadow: '0 -5px 20px rgba(0,0,0,0.3)'
  },
  header: {
    height: '200px', position: 'relative', overflow: 'hidden',
    borderTopLeftRadius: '15px', borderTopRightRadius: '15px',
    flexShrink: 0
  },
  image: {
    width: '100%', height: '100%', objectFit: 'cover'
  },
  closeBtn: {
    position: 'absolute', top: 10, right: 10,
    backgroundColor: 'rgba(0,0,0,0.6)', color: '#fff',
    border: 'none', borderRadius: '50%', width: '35px', height: '35px',
    fontSize: '20px', cursor: 'pointer', zIndex: 10
  },
  body: {
    padding: '20px', overflowY: 'auto', flex: 1
  },
  footer: {
    padding: '15px', borderTop: '1px solid #eee', backgroundColor: '#fff',
    flexShrink: 0
  },
  counterBox: {
    display: 'flex', alignItems: 'center', border: '1px solid #ccc', borderRadius: '5px'
  },
  counterBtn: {
    background: 'none', border: 'none', padding: '5px 15px', fontSize: '18px', fontWeight: 'bold'
  },
  counterNum: {
    padding: '0 10px', fontSize: '16px', fontWeight: 'bold'
  }
};