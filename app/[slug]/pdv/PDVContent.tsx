'use client'

import { useState, useEffect, useRef } from 'react';
import { getPedidosPDV, atualizarStatusPedido, finalizarPedidoCompleto } from './actions';
import { toast, Toaster } from 'react-hot-toast';

export default function PDVContent({ slug }: { slug: string }) {
  const [pedidos, setPedidos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modais
  const [selectedPedido, setSelectedPedido] = useState<any | null>(null); // For Details Modal
  const [paymentPedido, setPaymentPedido] = useState<any | null>(null);   // For Payment Modal
  
  // Audio Refs
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastCountRef = useRef(0);
  const lastBillRequestCountRef = useRef(0); // To track new bill requests

  // --- DATA FETCHING ---
  const fetchPedidos = async (tocarSom = false) => {
    try {
      const dados = await getPedidosPDV(slug);
      setPedidos(dados);

      // Sound Logic for NEW ORDERS (Status 1)
      const novosCount = dados.filter((p: any) => p.status === 1).length;
      if (tocarSom && novosCount > lastCountRef.current) {
        tocarCampainha();
        toast.success("Novo pedido chegou!", { icon: '🔔', duration: 4000 });
      }
      lastCountRef.current = novosCount;

      // Sound/Alert Logic for BILL REQUESTS (Status 9)
      const contasCount = dados.filter((p: any) => p.status === 9).length;
      if (tocarSom && contasCount > lastBillRequestCountRef.current) {
         toast("Solicitação de Conta!", { 
             icon: '💰', 
             duration: 5000, 
             style: { background: '#FFD700', color: '#000', fontWeight: 'bold' } 
         });
         tocarCampainha(); // You can use a different sound if you have one
      }
      lastBillRequestCountRef.current = contasCount;

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
  }, [slug]);

  // --- ACTIONS ---
  const mudarStatus = async (id: number, status: number) => {
    const prom = atualizarStatusPedido(slug, id, status);
    await toast.promise(prom, {
      loading: 'Atualizando...',
      success: 'Status alterado!',
      error: 'Erro.'
    });
    fetchPedidos(false);
    if(selectedPedido?.id === id && status !== 1) setSelectedPedido(null);
  };

  const handleFinalizar = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!paymentPedido) return;

    const form = e.target as HTMLFormElement;
    const meio = form.pagamento.value;
    const troco = form.troco?.value ? parseFloat(form.troco.value) : null;

    const res = await finalizarPedidoCompleto(slug, paymentPedido.id, meio, troco);
    
    if(res.success) {
        toast.success("Mesa Fechada com Sucesso!");
        
        if(confirm("Deseja imprimir o cupom final?")) {
            imprimirCupom(paymentPedido, meio, troco);
        }

        setPaymentPedido(null);
        fetchPedidos(false);
    } else {
        toast.error("Erro ao finalizar.");
    }
  };

  // --- THERMAL PRINTING ---
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
                <p style="font-size: 14px;">${pedido.origem}</p>
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

            <br><div style="text-align: center;">*** CONTA FECHADA ***</div>
        </body>
        <script>window.print(); setTimeout(() => window.close(), 1000);<\/script>
      </html>
    `);
    janela.document.close();
  };

  // --- LIST FILTERS ---
  const novos = pedidos.filter(p => p.status === 1);
  const preparo = pedidos.filter(p => p.status === 2);
  const entrega = pedidos.filter(p => p.status === 3);
  // Status 9: Bill Requests
  const solicitacoes = pedidos.filter(p => p.status === 9);

  return (
    <div>
      <Toaster position="top-right" />

      {/* --- NEW 4-COLUMN LAYOUT --- */}
      <div className="row">
        
        {/* COLUMN 1: BILL REQUESTS (High Priority) */}
        <div className="col-md-3">
            <div className="card border-0" style={{ backgroundColor: '#fff3cd' }}> {/* Yellow Background */}
                <div className="card-header text-dark font-bold" style={{ backgroundColor: '#ffc107' }}>
                    <i className="fa fa-money-bill-wave mg-r-5"></i> PEDIRAM A CONTA ({solicitacoes.length})
                </div>
                <div className="card-body pd-10" style={{ minHeight: '200px', maxHeight: '70vh', overflowY: 'auto' }}>
                    {solicitacoes.length === 0 && <p className="text-muted text-center small mg-t-20">Nenhuma solicitação.</p>}
                    
                    {solicitacoes.map(p => (
                        <div key={p.id} className="card mg-b-10 shadow animate__animated animate__pulse animate__infinite">
                            <div className="card-body pd-10">
                                <div className="d-flex justify-content-between">
                                    <span className="badge badge-dark">#{p.id}</span>
                                    <span className="badge badge-danger font-bold" style={{fontSize: '12px'}}>{p.origem}</span>
                                </div>
                                <h6 className="mg-t-10 font-bold">{p.nome_cliente}</h6>
                                <h4 className="text-success font-bold text-center mg-t-10 mb-2">{p.total_formatado}</h4>
                                
                                <button 
                                    onClick={() => setPaymentPedido(p)} 
                                    className="btn btn-success btn-block font-bold"
                                    style={{ boxShadow: '0 2px 5px rgba(0,0,0,0.2)' }}
                                >
                                    <i className="fa fa-print"></i> FECHAR E IMPRIMIR
                                </button>
                                
                                {/* Option to revert status if it was a mistake */}
                                <button onClick={() => mudarStatus(p.id, 3)} className="btn btn-link btn-block btn-sm tx-11 text-muted">
                                    Voltar para Mesa
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        {/* COLUMN 2: NEW ORDERS */}
        <div className="col-md-3">
            <div className="card bg-danger-soft border-0">
                <div className="card-header bg-danger text-white font-bold">NOVOS ({novos.length})</div>
                <div className="card-body pd-10" style={{ minHeight: '200px', maxHeight: '70vh', overflowY: 'auto' }}>
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

        {/* COLUMN 3: PREPARING */}
        <div className="col-md-3">
            <div className="card bg-warning-soft border-0">
                <div className="card-header bg-warning text-dark font-bold">PREPARO ({preparo.length})</div>
                <div className="card-body pd-10" style={{ minHeight: '200px', maxHeight: '70vh', overflowY: 'auto' }}>
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
                                    <i className="fa fa-motorcycle"></i> Pronto
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        {/* COLUMN 4: CASHIER/DELIVERY */}
        <div className="col-md-3">
             <div className="card bg-success-soft border-0">
                <div className="card-header bg-success text-white font-bold">CAIXA ({entrega.length})</div>
                <div className="card-body pd-10" style={{ minHeight: '200px', maxHeight: '70vh', overflowY: 'auto' }}>
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
                                    <i className="fa fa-dollar-sign"></i> RECEBER
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>

      </div>

      {/* --- DETAILS MODAL --- */}
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

      {/* --- PAYMENT MODAL --- */}
      {paymentPedido && (
        <div className="modal-overlay" style={{position:'fixed', top:0, left:0, width:'100%', height:'100%', background:'rgba(0,0,0,0.6)', zIndex:1000, display:'flex', justifyContent:'center', alignItems:'center'}}>
            <div className="bg-white rounded pd-25 shadow-lg animate__animated animate__zoomIn" style={{width:'350px'}}>
                <div className="text-center mb-4">
                    <h3 className="text-success font-bold">{paymentPedido.total_formatado}</h3>
                    <p>Receber de: {paymentPedido.nome_cliente}</p>
                    <p className="text-danger font-bold">{paymentPedido.origem}</p>
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
                        <button type="submit" className="btn btn-success flex-fill font-bold">CONFIRMAR E IMPRIMIR</button>
                    </div>
                </form>
            </div>
        </div>
      )}

    </div>
  );
}