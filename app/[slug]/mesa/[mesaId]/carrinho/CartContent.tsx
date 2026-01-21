'use client'

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { finalizarPedidoAction } from './actions'; 

interface CartProps {
  empresa: any;
  mesaId: string;
  nomeCliente: string;
  slug: string;
}

export default function CartContent({ empresa, mesaId, nomeCliente, slug }: CartProps) {
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [isSending, setIsSending] = useState(false);
  
  // NOVO STATE: Controla se o modal de sucesso está visível
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  // Guardamos o ID do pedido para mostrar no sucesso (opcional)
  const [pedidoCriadoId, setPedidoCriadoId] = useState<number | null>(null);

  const router = useRouter();
  const cartKey = `cart_${empresa.url}_mesa_${mesaId}`;

  useEffect(() => {
    const items = JSON.parse(localStorage.getItem(cartKey) || '[]');
    setCartItems(items);
  }, [cartKey]);

  const removeItem = (cartId: number) => {
    const updated = cartItems.filter(item => item.cartId !== cartId);
    setCartItems(updated);
    localStorage.setItem(cartKey, JSON.stringify(updated));
    window.dispatchEvent(new Event('cartUpdated'));
    toast.error("Item removido");
  };

  const totalGeral = cartItems.reduce((acc, item) => acc + item.total, 0);

  const handleFinalizarPedido = async () => {
    if (isSending) return;

    try {
      setIsSending(true);
      
      const res = await finalizarPedidoAction({
        slug: slug,
        mesaId: mesaId,
        nomeCliente: nomeCliente,
        celular: "", 
        itens: cartItems,
        subtotal: totalGeral,
        totalGeral: totalGeral,
        pessoas: 1 
      });

      if (res.success) {
        // 1. Limpa o carrinho
        localStorage.removeItem(cartKey);
        window.dispatchEvent(new Event('cartUpdated'));
        setCartItems([]); // Zera visualmente o fundo

        // 2. Salva o ID (se quiser mostrar)
        if(res.pedidoId) setPedidoCriadoId(res.pedidoId);

        // 3. ABRE O MODAL DE SUCESSO (Não redireciona ainda)
        setShowSuccessModal(true);
        
      } else {
        toast.error(res.error || "Erro ao enviar pedido");
      }
    } catch (error) {
      toast.error("Erro de conexão. Tente novamente.");
    } finally {
      setIsSending(false);
    }
  };

  // Função chamada pelo botão do Modal
  const handleVoltarCardapio = () => {
    router.push(`/${empresa.url}/mesa/${mesaId}/cardapio`);
  };

  // Se estiver vazio e NÃO estiver mostrando o modal de sucesso, mostra msg de vazio
  if (cartItems.length === 0 && !showSuccessModal) {
    return (
      <div className="main-wrapper text-center pd-40">
        <i className="fa fa-shopping-basket fa-4x text-muted mg-b-20"></i>
        <h4>Seu carrinho está vazio</h4>
        <Link href={`/${empresa.url}/mesa/${mesaId}/cardapio`} className="btn btn-primary mg-t-20">
          Voltar ao Cardápio
        </Link>
      </div>
    );
  }

  return (
    <div className="main-wrapper" style={{ background: '#fafafa', minHeight: '100vh', position: 'relative' }}>
      
      {/* --- HEADER --- */}
      <header className="pd-20 bg-white shadow-sm d-flex align-items-center">
        <Link href={`/${empresa.url}/mesa/${mesaId}/cardapio`} className="tx-gray-800 mg-r-15">
          <i className="fa fa-arrow-left tx-20"></i>
        </Link>
        <h5 className="mg-b-0 font-bold">Meu Pedido</h5>
      </header>

      {/* --- CONTEÚDO DO CARRINHO --- */}
      {!showSuccessModal && (
        <>
            <div className="pd-20">
                <div className="mg-b-15 pd-b-10 bd-b">
                    <span className="tx-12 text-muted uppercase font-bold">Cliente:</span>
                    <span className="mg-l-5 tx-14 font-bold tx-inverse">{nomeCliente}</span>
                    <span className="mg-l-10 tx-12 badge badge-info">Mesa {mesaId}</span>
                </div>

                <p className="tx-12 text-muted uppercase font-bold mg-b-10">Itens selecionados</p>
                
                {cartItems.map((item) => (
                <div key={item.cartId} className="product-card mg-b-10">
                    <div className="product-info">
                    <div>
                        <div className="product-name">{item.quantity}x {item.product.nome}</div>
                        {item.obs && <div className="product-desc text-warning">Obs: {item.obs}</div>}
                    </div>
                    <div className="product-price">R$ {item.total.toFixed(2).replace('.', ',')}</div>
                    </div>
                    <button 
                    onClick={() => removeItem(item.cartId)}
                    className="btn btn-link text-danger pd-0"
                    style={{ alignSelf: 'center' }}
                    >
                    <i className="fa fa-trash-o tx-20"></i>
                    </button>
                </div>
                ))}

                <div className="bg-white pd-20 rounded-12 mg-t-20 shadow-sm">
                <div className="d-flex justify-content-between mg-b-5">
                    <span>Subtotal</span>
                    <span>R$ {totalGeral.toFixed(2).replace('.', ',')}</span>
                </div>
                <hr />
                <div className="d-flex justify-content-between tx-18 font-bold tx-inverse">
                    <span>Total</span>
                    <span className="text-success">R$ {totalGeral.toFixed(2).replace('.', ',')}</span>
                </div>
                </div>
            </div>

            <div className="pd-20 sticky-bottom bg-white border-top">
                <button 
                className="btn btn-primary btn-block btn-lg font-bold uppercase py-3"
                style={{ 
                    backgroundColor: empresa.cormenu || '#3d734a', 
                    border: 'none', 
                    borderRadius: '12px',
                    opacity: isSending ? 0.7 : 1 
                }}
                disabled={isSending}
                onClick={handleFinalizarPedido}
                >
                {isSending ? 'Enviando...' : 'Confirmar Pedido'}
                </button>
            </div>
        </>
      )}

      {/* --- MODAL DE SUCESSO (JANELA SOBREPOSTA) --- */}
      {showSuccessModal && (
        <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.6)', // Fundo escuro transparente
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
        }}>
            <div style={{
                backgroundColor: '#fff',
                borderRadius: '20px',
                padding: '40px 30px',
                textAlign: 'center',
                maxWidth: '400px',
                width: '100%',
                boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
                animation: 'fadeIn 0.3s ease-in-out'
            }}>
                <div style={{ 
                    width: '80px', height: '80px', 
                    background: '#d4edda', borderRadius: '50%', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 20px auto'
                }}>
                    <i className="fa fa-check text-success" style={{ fontSize: '40px' }}></i>
                </div>

                <h3 style={{ color: '#333', marginBottom: '10px', fontWeight: 'bold' }}>Pedido Confirmado!</h3>
                
                <p style={{ color: '#666', marginBottom: '30px', fontSize: '16px' }}>
                    Recebemos o seu pedido <br/>
                    <strong>{pedidoCriadoId ? `#${pedidoCriadoId}` : ''}</strong> e ele já está sendo preparado.
                </p>

                <button 
                    onClick={handleVoltarCardapio}
                    className="btn btn-block btn-lg"
                    style={{
                        backgroundColor: empresa.cormenu || '#28a745',
                        color: '#fff',
                        borderRadius: '12px',
                        fontWeight: 'bold',
                        padding: '12px',
                        border: 'none',
                        cursor: 'pointer'
                    }}
                >
                    Voltar ao Cardápio
                </button>
            </div>
        </div>
      )}
    </div>
  );
}