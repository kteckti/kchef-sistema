'use client'

import { useState, useEffect, useRef } from 'react';
import { getPedidosCozinha, marcarComoPronto } from './actions';
import { toast, Toaster } from 'react-hot-toast';

export default function CozinhaContent({ slug }: { slug: string }) {
  const [pedidos, setPedidos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Controle de Áudio
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastCountRef = useRef(0);

  // --- BUSCAR DADOS ---
  const fetchPedidos = async (tocarSom = false) => {
    try {
      const dados = await getPedidosCozinha(slug);
      setPedidos(dados);

      // Se entrou pedido novo na fila, toca som
      if (tocarSom && dados.length > lastCountRef.current) {
        tocarCampainha();
        toast("Novo pedido na cozinha!", { 
            icon: '🔥', 
            style: { background: '#d32f2f', color: '#fff' } 
        });
      }
      lastCountRef.current = dados.length;
      setLoading(false);
    } catch (error) {
      console.error(error);
    }
  };

  const tocarCampainha = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    }
  };

  // Polling a cada 10 segundos
  useEffect(() => {
    fetchPedidos(false);
    audioRef.current = new Audio('/audio/campainha.mp3'); 
    const interval = setInterval(() => fetchPedidos(true), 10000);
    return () => clearInterval(interval);
  }, [slug]);

  // --- AÇÃO: PRONTO ---
  const handlePronto = async (id: number) => {
    // Feedback otimista (remove da tela imediatamente)
    setPedidos(current => current.filter(p => p.id !== id));
    
    const res = await marcarComoPronto(slug, id);
    if (res.success) {
        toast.success("Pedido pronto!");
        fetchPedidos(false); // Atualiza para garantir
    } else {
        toast.error("Erro ao atualizar");
        fetchPedidos(false); // Reverte se deu erro
    }
  };

  if (loading && pedidos.length === 0) {
      return <div className="text-center mt-5"><i className="fa fa-spinner fa-spin fa-3x text-muted"></i></div>;
  }

  return (
    <div>
      <Toaster position="top-right" />
      
      {pedidos.length === 0 ? (
          <div className="text-center mt-5 opacity-50">
              <i className="fa fa-check-circle fa-5x text-success mb-3"></i>
              <h3>Tudo limpo por aqui!</h3>
              <p>Aguardando novos pedidos...</p>
          </div>
      ) : (
          <div className="row">
            {pedidos.map(p => (
                <div key={p.id} className="col-md-4 col-lg-3 mb-4">
                    <div className="card h-100 border-0 shadow-lg" style={{background: '#fffcdb'}}> {/* Fundo levemente amarelo */}
                        
                        {/* CABEÇALHO DO TICKET */}
                        <div className="card-header bg-warning text-dark d-flex justify-content-between align-items-center">
                            <span className="fw-bold">#{p.id}</span>
                            <span className="fw-bold">{p.hora_pedido}</span>
                        </div>
                        
                        <div className="card-body p-3">
                            <h5 className="fw-bold mb-1">{p.nome_cliente}</h5>
                            <span className="badge bg-dark mb-3">{p.origem}</span>
                            
                            {/* Alerta de Tempo (Se passou de 20 min fica vermelho) */}
                            {p.tempo_decorrido > 20 && (
                                <div className="alert alert-danger py-1 px-2 mb-2 small fw-bold">
                                    <i className="fa fa-clock me-1"></i> Atrasado: {p.tempo_decorrido} min
                                </div>
                            )}

                            {/* LISTA DE ITENS */}
                            <ul className="list-group list-group-flush bg-transparent">
                                {p.itens.map((item: any) => (
                                    <li key={item.id} className="list-group-item bg-transparent px-0 border-secondary border-opacity-25">
                                        <div className="d-flex align-items-start">
                                            <span className="fw-bold me-2 fs-5 badge bg-secondary rounded-circle" style={{width:30, height:30, display:'flex', alignItems:'center', justifyContent:'center'}}>
                                                {item.quantidade}
                                            </span>
                                            <div>
                                                <div className="fw-bold lh-sm">{item.nome_produto}</div>
                                                {item.observacao && (
                                                    <div className="text-danger fw-bold small mt-1 bg-white px-1 rounded border border-danger">
                                                        <i className="fa fa-exclamation-circle"></i> {item.observacao}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* RODAPÉ DO TICKET */}
                        <div className="card-footer bg-transparent border-0 pb-3">
                            <button 
                                onClick={() => handlePronto(p.id)} 
                                className="btn btn-success w-100 btn-lg fw-bold shadow-sm"
                            >
                                <i className="fa fa-check me-2"></i> PRONTO
                            </button>
                        </div>
                    </div>
                </div>
            ))}
          </div>
      )}
    </div>
  );
}