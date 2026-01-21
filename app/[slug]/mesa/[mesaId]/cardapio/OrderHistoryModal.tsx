'use client'

import { useState, useEffect } from 'react';
import { buscarHistoricoPedidos } from '../../../actions';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  slug: string;
  mesaId: string;
  color: string;
}

export default function OrderHistoryModal({ isOpen, onClose, slug, mesaId, color }: Props) {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      buscarHistoricoPedidos(slug, mesaId)
        .then(data => setOrders(data))
        .finally(() => setLoading(false));
    } else {
      setSelectedOrder(null);
    }
  }, [isOpen, slug, mesaId]);

  if (!isOpen) return null;

  // Status apenas do PEDIDO (Pai), pois o Item não tem status no schema
  const getStatusLabel = (status: number) => {
    switch(status) {
      case 1: return { text: 'Pendente', color: '#ffc107', textCol: '#000' };
      case 2: return { text: 'Em Preparo', color: '#17a2b8', textCol: '#fff' };
      case 3: return { text: 'Entregue', color: '#28a745', textCol: '#fff' };
      case 4: return { text: 'Finalizado', color: '#6c757d', textCol: '#fff' };
      default: return { text: 'Desconhecido', color: '#ccc', textCol: '#000' };
    }
  };

  const formatMoney = (val: any) => `R$ ${Number(val).toFixed(2).replace('.', ',')}`;
  const formatTime = (date: string) => new Date(date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '15px'
    }}>
      <div style={{
        backgroundColor: '#fff', width: '100%', maxWidth: '500px',
        borderRadius: '15px', overflow: 'hidden', display: 'flex', flexDirection: 'column',
        maxHeight: '85vh', boxShadow: '0 5px 15px rgba(0,0,0,0.2)'
      }}>
        
        {/* CABEÇALHO */}
        <div style={{ padding: '15px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h5 style={{ margin: 0, fontWeight: 'bold' }}>
            {selectedOrder ? 'Detalhes do Pedido' : 'Meus Pedidos'}
          </h5>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', lineHeight: 1 }}>&times;</button>
        </div>

        {/* CORPO */}
        <div style={{ padding: '15px', overflowY: 'auto', flex: 1 }}>
          
          {loading ? (
            <div className="text-center pd-20">Carregando...</div>
          ) : selectedOrder ? (
            // --- TELA DE DETALHES ---
            <div>
              <button 
                onClick={() => setSelectedOrder(null)}
                style={{ marginBottom: '15px', background: 'none', border: 'none', color: color, fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}
              >
                <i className="fa fa-arrow-left"></i> Voltar
              </button>

              <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '10px', marginBottom: '15px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                  <strong>Pedido #{selectedOrder.id}</strong>
                  <span>{formatTime(selectedOrder.createdAt)}</span>
                </div>
                <span className="badge" style={{ 
                  backgroundColor: getStatusLabel(selectedOrder.status).color, 
                  color: getStatusLabel(selectedOrder.status).textCol,
                  padding: '4px 8px', borderRadius: '4px', fontSize: '12px'
                }}>
                  {getStatusLabel(selectedOrder.status).text}
                </span>
              </div>

              <h6 style={{ fontSize: '14px', fontWeight: 'bold', borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '10px' }}>Itens</h6>
              
              {selectedOrder.itens.map((item: any) => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', borderBottom: '1px dashed #eee', paddingBottom: '12px' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '600' }}>{item.quantidade}x {item.nome_produto}</div>
                    {/* Exibe observação apenas se existir */}
                    {item.observacao && <div style={{ fontSize: '12px', color: '#dc3545', marginTop: '2px' }}>Obs: {item.observacao}</div>}
                  </div>
                  <div style={{ fontWeight: 'bold' }}>{formatMoney(item.total_item)}</div>
                </div>
              ))}

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px', fontSize: '18px', fontWeight: 'bold', borderTop: '2px solid #eee', paddingTop: '15px' }}>
                <span>Total</span>
                <span style={{ color: color }}>{formatMoney(selectedOrder.total)}</span>
              </div>
            </div>
          ) : (
            // --- TELA DE LISTA ---
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {orders.length === 0 ? (
                <div className="text-center text-muted" style={{ padding: '20px' }}>
                    <i className="fa fa-receipt fa-3x mb-3" style={{ opacity: 0.3 }}></i>
                    <p>Você ainda não fez nenhum pedido.</p>
                </div>
              ) : orders.map((pedido) => {
                const statusInfo = getStatusLabel(pedido.status);
                return (
                  <div key={pedido.id} style={{ border: '1px solid #eee', borderRadius: '10px', padding: '15px', backgroundColor: '#fff' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <span style={{ fontWeight: 'bold', fontSize: '16px' }}>Pedido #{pedido.id}</span>
                      <span style={{ fontSize: '12px', color: '#999' }}>{formatTime(pedido.createdAt)}</span>
                    </div>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                      <span style={{ 
                        backgroundColor: statusInfo.color, 
                        color: statusInfo.textCol, 
                        padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold' 
                      }}>
                        {statusInfo.text}
                      </span>
                      <span style={{ fontWeight: 'bold' }}>{formatMoney(pedido.total)}</span>
                    </div>

                    <button 
                      onClick={() => setSelectedOrder(pedido)}
                      style={{ 
                        width: '100%', padding: '10px', 
                        backgroundColor: '#f1f1f1', border: 'none', borderRadius: '8px',
                        fontWeight: '600', color: '#333', cursor: 'pointer', transition: 'background 0.2s'
                      }}
                      onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#e2e6ea'}
                      onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#f1f1f1'}
                    >
                      Ver detalhes
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}