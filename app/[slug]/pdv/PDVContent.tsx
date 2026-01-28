'use client'

import { useState, useEffect, useRef } from 'react';
import { getPedidosPDV, atualizarStatusPedido, finalizarPedidoCompleto } from './actions';
import { toast, Toaster } from 'react-hot-toast';

// ATUALIZAÇÃO: Recebe 'slug' nas props para passar para as actions
export default function PDVContent({ slug }: { slug: string }) {
  const [pedidos, setPedidos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modais
  const [selectedPedido, setSelectedPedido] = useState<any | null>(null); // Detalhes
  const [paymentPedido, setPaymentPedido] = useState<any | null>(null);   // Pagamento
  
  // Áudio
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastCountRef = useRef(0);

  // --- BUSCA DADOS ---
  const fetchPedidos = async (tocarSom = false) => {
    try {
      // ATUALIZAÇÃO: Passa o slug
      const dados = await getPedidosPDV(slug);
      setPedidos(dados);

      // Toca som apenas se houver NOVOS (Status 1)
      const novosCount = dados.filter((p: any) => p.status === 1).length;
      if (tocarSom && novosCount > lastCountRef.current) {
        tocarCampainha();
        toast.success("Novo pedido chegou!", { icon: '🔔', duration: 4000 });
      }
      lastCountRef.current = novosCount;
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

  useEffect(() => {
    fetchPedidos(false);
    audioRef.current = new Audio('/audio/campainha.mp3');
    const interval = setInterval(() => fetchPedidos(true), 10000);
    return () => clearInterval(interval);
  }, [slug]); // Adicionado slug nas dependências

  // --- AÇÕES RÁPIDAS (Mudar Status) ---
  const mudarStatus = async (id: number, status: number) => {
    // ATUALIZAÇÃO: Passa o slug
    const prom = atualizarStatusPedido(slug, id, status);
    
    await toast.promise(prom, {
      loading: 'Atualizando...',
      success: 'Status alterado!',
      error: 'Erro.'
    });
    fetchPedidos(false);
    if(selectedPedido?.id === id && status !== 1) setSelectedPedido(null);
  };

  // --- AÇÃO DE PAGAMENTO (Finalizar) ---
  const handleFinalizar = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!paymentPedido) return;

    const form = e.target as HTMLFormElement;
    const meio = form.pagamento.value;
    const troco = form.troco?.value ? parseFloat(form.troco.value) : null;

    // ATUALIZAÇÃO: Passa o slug
    const res = await finalizarPedidoCompleto(slug, paymentPedido.id, meio, troco);
    
    if(res.success) {
        toast.success("Pedido Finalizado e Mesa Liberada!");
        
        // Pergunta se quer imprimir
        if(confirm("Deseja imprimir o cupom final?")) {
            imprimirCupom(paymentPedido, meio, troco);
        }

        setPaymentPedido(null);
        fetchPedidos(false);
    } else {
        toast.error("Erro ao finalizar.");
    }
  };

  // --- IMPRESSÃO TÉRMICA (Cupom) ---
  const imprimirCupom = (pedido: any, meioPagto?: string, troco?: number | null) => {
    const janela = window.open('', '', 'width=300,height=600');
    if(!janela) return;

    const itensHtml = pedido.itens.map((i: any) => 
        `<tr>
            <td colspan="3">${i.quantidade}x ${i.nome_produto}</td>
         </tr>
         <tr>
            <td style="border-bottom: 1px dashed #000; padding-bottom: 5px;" colspan="3" align="right">R$ ${Number(i.total_item).toFixed(2)}</td>
         </tr>`
    ).join('');

    const trocoHtml = troco 
        ? `<tr><td>Troco p/:</td><td align="right">R$ ${troco.toFixed(2)}</td></tr>
           <tr><td>Troco:</td><td align="right">R$ ${(troco - Number(pedido.total)).toFixed(2)}</td></tr>` 
        : '';

    janela.document.write(`
      <html>
        <body style="font-family: 'Courier New', monospace; font-size: 12px; margin: 0; padding: 10px;">
            <div style="text-align: center;">
                <h3 style="margin: 0;">PEDIDO #${pedido.id}</h3>
                <p style="margin: 5px 0;">${pedido.data_formatada}</p>
                <p style="font-weight: bold; font-size: 14px;">${pedido.nome_cliente}</p>
                <hr style="border-top: 1px dashed #000;">
            </div>
            
            <table style="width: 100%;" cellspacing="0">
                ${itensHtml}
            </table>
            
            <div style="margin-top: 10px;">
                <table style="width: 100%; font-size: 14px; font-weight: bold;">
                    <tr>
                        <td>TOTAL:</td>
                        <td align="right">${pedido.total_formatado}</td>
                    </tr>
                </table>
            </div>

            <hr style="border-top: 1px dashed #000;">
            
            <table style="width: 100%;">
                <tr><td>Pagamento:</td><td align="right">${meioPagto || pedido.forma_pagamento}</td></tr>
                ${trocoHtml}
            </table>

            <br><br>
            <div style="text-align: center;">.</div>
        </body>
        <script>window.print(); setTimeout(() => window.close(), 1000);<\/script>
      </html>
    `);
    janela.document.close();
  };

  // Listas
  const novos = pedidos.filter(p => p.status === 1);
  const preparo = pedidos.filter(p => p.status === 2);
  const entrega = pedidos.filter(p => p.status === 3);

  return (
    <div>
      <Toaster position="top-right" />

      <div className="row">
        {/* NOVOS */}
        <div className="col-md-4">
            <div className="card bg-danger-soft border-0">
                <div className="card-header bg-danger text-white font-bold">NOVOS ({novos.length})</div>
                <div className="card-body pd-10">
                    {novos.map(p => (
                        <div key={p.id} className="card mg-b-10 shadow-sm animate__animated animate__fadeIn">
                            <div className="card-body pd-15">
                                <div className="d-flex justify-content-between">
                                    <span className="badge badge-warning">#{p.id}</span>
                                    <small>{p.data_formatada}</small>
                                </div>
                                <h6 className="mg-t-10 font-bold">{p.nome_cliente}</h6>
                                <p className="tx-12 text-muted">{p.origem}</p>
                                <h5 className="text-success font-bold">{p.total_formatado}</h5>
                                <div className="d-flex gap-2 mg-t-10">
                                    <button onClick={() => setSelectedPedido(p)} className="btn btn-sm btn-light flex-fill">Ver</button>
                                    <button onClick={() => mudarStatus(p.id, 2)} className="btn btn-sm btn-success flex-fill">Aceitar</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        {/* PREPARO */}
        <div className="col-md-4">
            <div className="card bg-warning-soft border-0">
                <div className="card-header bg-warning text-dark font-bold">PREPARO ({preparo.length})</div>
                <div className="card-body pd-10">
                    {preparo.map(p => (
                        <div key={p.id} className="card mg-b-10 shadow-sm">
                            <div className="card-body pd-15">
                                <div className="d-flex justify-content-between">
                                    <span className="badge badge-dark">#{p.id}</span>
                                    <small>{p.data_formatada}</small>
                                </div>
                                <h6 className="mg-t-5">{p.nome_cliente}</h6>
                                <p className="tx-12">{p.origem}</p>
                                <button onClick={() => mudarStatus(p.id, 3)} className="btn btn-sm btn-primary w-100 mg-t-5">
                                    <i className="fa fa-motorcycle"></i> Saiu / Pronto
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        {/* ENTREGA / CAIXA */}
        <div className="col-md-4">
             <div className="card bg-success-soft border-0">
                <div className="card-header bg-success text-white font-bold">CAIXA / ENTREGA ({entrega.length})</div>
                <div className="card-body pd-10">
                    {entrega.map(p => (
                        <div key={p.id} className="card mg-b-10 shadow-sm">
                            <div className="card-body pd-15">
                                <div className="d-flex justify-content-between">
                                    <span className="badge badge-success">#{p.id}</span>
                                    <h5 className="text-success font-bold mg-b-0">{p.total_formatado}</h5>
                                </div>
                                <h6 className="mg-t-5">{p.nome_cliente}</h6>
                                <p className="tx-12 text-muted">{p.origem}</p>
                                <button onClick={() => setPaymentPedido(p)} className="btn btn-sm btn-outline-success w-100 font-bold">
                                    <i className="fa fa-dollar-sign"></i> RECEBER E FINALIZAR
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
      </div>

      {/* --- MODAL DETALHES --- */}
      {selectedPedido && (
        <div className="modal-overlay" style={{position:'fixed', top:0, left:0, width:'100%', height:'100%', background:'rgba(0,0,0,0.5)', zIndex:999, display:'flex', justifyContent:'center', alignItems:'center'}}>
            <div className="bg-white rounded pd-20 shadow-lg" style={{width:'400px', maxHeight:'90vh', overflowY:'auto'}}>
                <div className="d-flex justify-content-between align-items-center mg-b-15">
                    <h5>Detalhes #{selectedPedido.id}</h5>
                    <button onClick={() => setSelectedPedido(null)} className="btn btn-sm btn-light">X</button>
                </div>
                <div className="bg-gray-100 pd-10 rounded mb-3">
                    <p className="mb-1"><strong>{selectedPedido.nome_cliente}</strong></p>
                    <p className="mb-0 small">{selectedPedido.origem}</p>
                </div>
                <ul className="list-group mb-3">
                    {selectedPedido.itens.map((i:any) => (
                        <li key={i.id} className="list-group-item d-flex justify-content-between lh-sm">
                            <div>
                                <h6 className="my-0">{i.quantidade}x {i.nome_produto}</h6>
                                {i.observacao && <small className="text-muted">{i.observacao}</small>}
                            </div>
                            <span className="text-muted">R${Number(i.total_item).toFixed(2)}</span>
                        </li>
                    ))}
                </ul>
                <h4 className="text-right">Total: {selectedPedido.total_formatado}</h4>
                <div className="d-flex gap-2 mt-3">
                    <button onClick={() => imprimirCupom(selectedPedido)} className="btn btn-secondary flex-fill">Imprimir</button>
                    {selectedPedido.status === 1 && (
                        <button onClick={() => mudarStatus(selectedPedido.id, 2)} className="btn btn-success flex-fill">Aceitar</button>
                    )}
                </div>
            </div>
        </div>
      )}

      {/* --- MODAL PAGAMENTO --- */}
      {paymentPedido && (
        <div className="modal-overlay" style={{position:'fixed', top:0, left:0, width:'100%', height:'100%', background:'rgba(0,0,0,0.6)', zIndex:1000, display:'flex', justifyContent:'center', alignItems:'center'}}>
            <div className="bg-white rounded pd-25 shadow-lg animate__animated animate__zoomIn" style={{width:'350px'}}>
                <div className="text-center mb-4">
                    <h3 className="text-success font-bold">{paymentPedido.total_formatado}</h3>
                    <p>Receber de: {paymentPedido.nome_cliente}</p>
                </div>

                <form onSubmit={handleFinalizar}>
                    <div className="form-group mb-3">
                        <label className="font-bold">Forma de Pagamento</label>
                        <select name="pagamento" className="form-control form-control-lg" required onChange={(e) => {
                            const trocoDiv = document.getElementById('divTroco');
                            if(e.target.value === 'DINHEIRO') trocoDiv!.style.display = 'block';
                            else trocoDiv!.style.display = 'none';
                        }}>
                            <option value="CARTAO">Cartão de Crédito/Débito</option>
                            <option value="PIX">PIX</option>
                            <option value="DINHEIRO">Dinheiro</option>
                        </select>
                    </div>

                    <div id="divTroco" className="form-group mb-4" style={{display:'none'}}>
                        <label>Valor Entregue (Troco)</label>
                        <input name="troco" type="number" step="0.01" className="form-control" placeholder="R$ 0,00" />
                    </div>

                    <div className="d-flex gap-2">
                        <button type="button" onClick={() => setPaymentPedido(null)} className="btn btn-light flex-fill">Cancelar</button>
                        <button type="submit" className="btn btn-success flex-fill font-bold">CONFIRMAR</button>
                    </div>
                </form>
            </div>
        </div>
      )}

    </div>
  );
}