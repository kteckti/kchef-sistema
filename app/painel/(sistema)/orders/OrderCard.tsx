'use client'

import { updateOrderStatusAction } from './actions';
import { toast } from 'react-hot-toast';

// Adicionamos 'onUpdate' na tipagem
export default function OrderCard({ pedido, onUpdate }: { pedido: any, onUpdate: () => void }) {

  const handleStatusChange = async (newStatus: number) => {
    // Optimistic UI: Você poderia mudar o estado localmente aqui se quisesse ser ultra-rápido,
    // mas chamar o onUpdate já garante que os dados venham frescos do banco.
    
    const res = await updateOrderStatusAction(pedido.id, newStatus);
    if (res.success) {
      toast.success("Status atualizado!");
      onUpdate(); // <--- AQUI ESTÁ O SEGREDO: Avisa a página pai para recarregar
    } else {
      toast.error("Erro ao atualizar.");
    }
  };

  const getStatusColor = (s: number) => {
    if (s === 1) return 'border-warning'; 
    if (s === 2) return 'border-primary'; 
    if (s === 3) return 'border-info';    
    return 'border-success';              
  };

  return (
    <div className={`card ${getStatusColor(pedido.status)} mg-b-20`} style={{borderLeftWidth: '5px'}}>
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center">
          <h6 className="card-title mg-b-0">#{pedido.id} - {pedido.nome_cliente}</h6>
          <span className="tx-12 text-muted">
            {new Date(pedido.data).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}
          </span>
        </div>
        
        <p className="mg-b-10 tx-12 text-muted">
          {pedido.tipo_entrega} • {pedido.forma_pagamento}
          {pedido.mesa && <span className="d-block tx-bold text-dark">Mesa: {pedido.mesa}</span>}
        </p>

        <hr className="mg-y-10" />

        <div className="order-items mg-b-15">
          {pedido.itens.map((item: any) => (
            <div key={item.id} className="tx-13">
              <strong>{item.quantidade}x</strong> {item.nome_produto}
              {item.observacao && <div className="tx-11 text-danger pd-l-10">Obs: {item.observacao}</div>}
            </div>
          ))}
        </div>

        <div className="d-flex justify-content-between align-items-center">
          <h5 className="text-success tx-bold mg-b-0">
            R$ {pedido.total.toFixed(2).replace('.', ',')}
          </h5>
        </div>

        <div className="mg-t-15">
          {pedido.status === 1 && (
            <button onClick={() => handleStatusChange(2)} className="btn btn-primary btn-block btn-sm">
              <i className="fa fa-check"></i> Aceitar Pedido
            </button>
          )}

          {pedido.status === 2 && (
            <button onClick={() => handleStatusChange(3)} className="btn btn-info btn-block btn-sm">
              <i className="fa fa-motorcycle"></i> Saiu p/ Entrega / Pronto
            </button>
          )}

          {pedido.status === 3 && (
            <button onClick={() => handleStatusChange(4)} className="btn btn-success btn-block btn-sm">
              <i className="fa fa-thumbs-up"></i> Finalizar
            </button>
          )}
          
          {(pedido.status === 1 || pedido.status === 2) && (
             <button onClick={() => handleStatusChange(5)} className="btn btn-outline-danger btn-block btn-sm mg-t-5">
               Cancelar
             </button>
          )}
        </div>

      </div>
    </div>
  );
}