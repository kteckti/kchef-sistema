'use client'

import { useState } from 'react';
import { toast, Toaster } from 'react-hot-toast';
import { salvarPedidoBalcao } from '../actions';
import { useRouter } from 'next/navigation';

// ATUALIZAÇÃO: Recebendo 'slug' nas props
export default function NovoPedidoContent({ categorias, slug }: { categorias: any[], slug: string }) {
  const router = useRouter();
  
  // Estados do Pedido
  const [cart, setCart] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [cliente, setCliente] = useState({ nome: '', celular: '' });
  const [pagamento, setPagamento] = useState('DINHEIRO');
  const [troco, setTroco] = useState('');
  const [loading, setLoading] = useState(false);

  // --- LÓGICA DO CARRINHO ---
  const addToCart = (produto: any) => {
    const itemExistente = cart.find(i => i.id === produto.id);
    
    if (itemExistente) {
      setCart(cart.map(i => i.id === produto.id ? { ...i, quantidade: i.quantidade + 1 } : i));
    } else {
      setCart([...cart, { ...produto, quantidade: 1, observacao: '' }]);
    }
    toast.success(`${produto.nome} adicionado!`, { position: 'bottom-center' });
  };

  const removeFromCart = (index: number) => {
    const newCart = [...cart];
    newCart.splice(index, 1);
    setCart(newCart);
  };

  const updateQuantity = (index: number, delta: number) => {
    const newCart = [...cart];
    const item = newCart[index];
    const novaQtd = item.quantidade + delta;
    
    if (novaQtd <= 0) {
      removeFromCart(index);
    } else {
      item.quantidade = novaQtd;
      setCart(newCart);
    }
  };

  // --- CÁLCULOS ---
  const total = cart.reduce((acc, item) => acc + (Number(item.valor) * item.quantidade), 0);

  // --- FINALIZAR ---
  const handleSubmit = async () => {
    if (cart.length === 0) return toast.error("O carrinho está vazio!");
    if (!cliente.nome) return toast.error("Informe o nome do cliente.");

    setLoading(true);

    const payload = {
      itens: cart,
      nome_cliente: cliente.nome,
      celular: cliente.celular,
      forma_pagamento: pagamento,
      troco: troco ? parseFloat(troco) : null
    };

    // ATUALIZAÇÃO: Passando o slug para a action
    const res = await salvarPedidoBalcao(slug, payload);
    
    if (res.error) {
      toast.error(res.error);
      setLoading(false);
    } else {
      toast.success("Pedido lançado com sucesso!");
      // ATUALIZAÇÃO: Redireciona para a rota correta da loja
      router.push(`/${slug}/pdv`); 
    }
  };

  return (
    <div className="row">
      <Toaster />
      
      {/* --- COLUNA ESQUERDA: PRODUTOS --- */}
      <div className="col-lg-8">
        
        {/* Barra de Pesquisa */}
        <div className="card mg-b-20 p-3">
            <input 
                type="text" 
                className="form-control form-control-lg" 
                placeholder="🔍 Buscar produto..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>

        {/* Listagem */}
        <div style={{ maxHeight: '75vh', overflowY: 'auto' }}>
            {categorias.map(cat => {
                // Filtra produtos pela busca
                const produtosFiltrados = cat.produtos.filter((p: any) => 
                    p.nome.toLowerCase().includes(searchTerm.toLowerCase())
                );

                if (produtosFiltrados.length === 0) return null;

                return (
                    <div key={cat.id} className="mg-b-20">
                        <h5 className="font-bold text-primary border-bottom pb-2">{cat.nome}</h5>
                        <div className="row">
                            {produtosFiltrados.map((prod: any) => (
                                <div key={prod.id} className="col-md-4 col-sm-6 mg-b-15">
                                    <div 
                                        className="card h-100 shadow-sm product-card-hover" 
                                        style={{ cursor: 'pointer', transition: 'transform 0.2s' }}
                                        onClick={() => addToCart(prod)}
                                    >
                                        <div className="card-body p-3">
                                            <h6 className="font-bold mb-1">{prod.nome}</h6>
                                            <p className="text-muted small mb-2 text-truncate">{prod.descricao}</p>
                                            <h5 className="text-success font-bold mb-0">
                                                R$ {Number(prod.valor).toFixed(2).replace('.', ',')}
                                            </h5>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
      </div>

      {/* --- COLUNA DIREITA: CARRINHO E DADOS (STICKY) --- */}
      <div className="col-lg-4">
        <div className="card shadow-lg" style={{ position: 'sticky', top: '20px' }}>
            <div className="card-header bg-dark text-white font-bold">
                <i className="fa fa-shopping-cart mg-r-10"></i> Resumo do Pedido
            </div>
            
            {/* Lista do Carrinho */}
            <div className="card-body p-0" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {cart.length === 0 ? (
                    <div className="text-center p-4 text-muted">Carrinho vazio</div>
                ) : (
                    <table className="table table-sm table-striped mb-0">
                        <tbody>
                            {cart.map((item, idx) => (
                                <tr key={idx}>
                                    <td className="align-middle pl-3">
                                        <div className="font-bold">{item.nome}</div>
                                        <small className="text-muted">R$ {Number(item.valor).toFixed(2)}</small>
                                    </td>
                                    <td className="align-middle text-center" style={{ width: '100px' }}>
                                        <div className="input-group input-group-sm">
                                            <button className="btn btn-outline-secondary" onClick={() => updateQuantity(idx, -1)}>-</button>
                                            <span className="form-control text-center px-1">{item.quantidade}</span>
                                            <button className="btn btn-outline-secondary" onClick={() => updateQuantity(idx, 1)}>+</button>
                                        </div>
                                    </td>
                                    <td className="align-middle text-right pr-3 font-bold">
                                        {(item.valor * item.quantidade).toFixed(2)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Total e Dados */}
            <div className="card-footer bg-light">
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <span className="h5 mb-0">TOTAL:</span>
                    <span className="h4 font-bold text-success mb-0">R$ {total.toFixed(2).replace('.', ',')}</span>
                </div>
                
                <hr />
                
                <div className="form-group mb-2">
                    <label className="tx-12 font-bold">Cliente</label>
                    <input 
                        className="form-control form-control-sm" 
                        placeholder="Nome do cliente..." 
                        value={cliente.nome}
                        onChange={(e) => setCliente({...cliente, nome: e.target.value})}
                    />
                </div>
                <div className="form-group mb-3">
                    <input 
                        className="form-control form-control-sm" 
                        placeholder="Celular (Opcional)..." 
                        value={cliente.celular}
                        onChange={(e) => setCliente({...cliente, celular: e.target.value})}
                    />
                </div>

                <div className="form-group mb-2">
                    <label className="tx-12 font-bold">Pagamento</label>
                    <select 
                        className="form-control form-control-sm"
                        value={pagamento}
                        onChange={(e) => setPagamento(e.target.value)}
                    >
                        <option value="DINHEIRO">Dinheiro</option>
                        <option value="CARTAO">Cartão</option>
                        <option value="PIX">PIX</option>
                    </select>
                </div>

                {pagamento === 'DINHEIRO' && (
                    <div className="form-group mb-3 animate__animated animate__fadeIn">
                        <label className="tx-12 font-bold">Valor entregue (Troco)</label>
                        <input 
                            type="number" 
                            className="form-control form-control-sm" 
                            placeholder="R$ 0,00"
                            value={troco}
                            onChange={(e) => setTroco(e.target.value)}
                        />
                        {troco && parseFloat(troco) > total && (
                            <small className="text-success font-bold d-block mt-1">
                                Troco: R$ {(parseFloat(troco) - total).toFixed(2)}
                            </small>
                        )}
                    </div>
                )}

                <button 
                    className="btn btn-primary btn-block font-bold py-2 mt-3"
                    onClick={handleSubmit}
                    disabled={loading || cart.length === 0}
                >
                    {loading ? <i className="fa fa-spinner fa-spin"></i> : <><i className="fa fa-check"></i> LANÇAR PEDIDO</>}
                </button>
            </div>
        </div>
      </div>
    </div>
  );
}