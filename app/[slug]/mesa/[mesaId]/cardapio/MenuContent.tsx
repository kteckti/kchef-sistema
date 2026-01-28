'use client'

import { useState, useEffect } from 'react';
import ProductModal from './ProductModal';
import { toast } from 'react-hot-toast'; // Ainda usado para adicionar ao carrinho
import LogoutMesaButton from '@/app/[slug]/components/LogoutMesaButton';
import OrderHistoryModal from './OrderHistoryModal';
import StaffLogoutButton from '@/app/[slug]/components/StaffLogoutButton';

// Action de fechar conta
import { solicitarFechamentoMesa } from '../../../actions'; 

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
    empresa: any;
    categorias: any[];
    produtos: Produto[];
    mesaId: string;
    nomeCliente: string;
    celularCliente: string;
};

export default function MenuContent({ empresa, categorias, produtos, mesaId, nomeCliente, celularCliente}: Props) {
    const [selectedProduct, setSelectedProduct] = useState<Produto | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeCategory, setActiveCategory] = useState<number>(categorias[0]?.id || 0);
    const [cartTotal, setCartTotal] = useState(0);
    const [cartCount, setCartCount] = useState(0);

    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    
    // States do Botão de Conta
    const [closingTable, setClosingTable] = useState(false);
    
    // --- NOVOS MODAIS PERSONALIZADOS ---
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false); // Pergunta "Tem certeza?"
    const [isBillModalOpen, setIsBillModalOpen] = useState(false);       // Sucesso "Conta pedida"
    const [billMessage, setBillMessage] = useState('');

    const slug = empresa.url;
    const cartKey = `cart_${slug}_mesa_${mesaId}`;

    useEffect(() => {
        const updateCartInfo = () => {
            const cart = JSON.parse(localStorage.getItem(cartKey) || '[]');
            setCartCount(cart.length);
            const total = cart.reduce((acc: number, item: any) => acc + item.total, 0);
            setCartTotal(total);
        };
        updateCartInfo();
        window.addEventListener('cartUpdated', updateCartInfo);
        return () => window.removeEventListener('cartUpdated', updateCartInfo);
    }, [cartKey]);

    const handleAddToCart = (item: any) => {
        const currentCart = JSON.parse(localStorage.getItem(cartKey) || '[]');
        const newItem = { ...item, cartId: Date.now() };
        const updatedCart = [...currentCart, newItem];
        localStorage.setItem(cartKey, JSON.stringify(updatedCart));

        window.dispatchEvent(new Event('cartUpdated'));
        toast.success('Adicionado ao seu carrinho!');
    };

    // 1. O botão chama esta função: APENAS ABRE A PERGUNTA
    const handlePedirContaClick = () => {
        setIsConfirmModalOpen(true);
    };

    // 2. Se o usuário clicar em "SIM" no modal, roda esta função
    const processarFechamento = async () => {
        setIsConfirmModalOpen(false); // Fecha a pergunta
        setClosingTable(true);        // Mostra loading no botão

        const res = await solicitarFechamentoMesa(slug, mesaId, nomeCliente, celularCliente);
        
        setClosingTable(false);

        if (res.error) {
            toast.error(res.error);
        } else {
            // SUCESSO: Abre o Modal de Confirmação Final
            setBillMessage(res.message || "Conta solicitada com sucesso! Aguarde o garçom.");
            setIsBillModalOpen(true);
        }
    };

    const openProduct = (prod: Produto) => {
        setSelectedProduct(prod);
        setIsModalOpen(true);
    };

    const scrollToCategory = (catId: number) => {
        setActiveCategory(catId);
        const element = document.getElementById(`cat-${catId}`);
        if (element) {
            const y = element.getBoundingClientRect().top + window.scrollY - 100;
            window.scrollTo({ top: y, behavior: 'smooth' });
        }
    };

    return (
        <div className="main-wrapper">

            {/* 1. HEADER */}
            <header className="header-container">
                <div className="banner-area">
                    {empresa.fundoTopo ? (
                        <img
                            src={`/img/fundo_banner/${empresa.fundoTopo}`}
                            className="banner-img"
                            alt="Capa"
                            onError={(e) => e.currentTarget.src = '/img/fundo_banner/padrao.jpg'}
                        />
                    ) : (
                        <div style={{ width: '100%', height: '100%', background: empresa.cormenu || '#333' }}></div>
                    )}
                </div>

                <div className="brand-info" style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '15px',
                    boxSizing: 'border-box',
                    width: '95%',
                    maxWidth: '1200px',
                    margin: '10px auto 0px',
                    backgroundColor: '#fff',
                    borderRadius: '12px',
                    flexWrap: 'wrap',
                    gap: '10px'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: '200px' }}>
                        <div className="brand-logo" style={{ flexShrink: 0 }}>
                            <div style={{ width: '60px', height: '60px', background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', overflow: 'hidden' }}>
                                <i className="fa fa-user" style={{ fontSize: '24px', color: '#999' }}></i>
                            </div>
                        </div>
                        <div className="brand-texts" style={{ minWidth: 0 }}>
                            <h1 style={{ margin: 0, fontSize: '16px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: '#333' }}>
                                {empresa.nomeempresa}
                            </h1>
                            <p style={{ margin: 0, fontSize: '13px', color: '#666' }}>
                                Olá, <strong>{nomeCliente}</strong> • Mesa {mesaId}
                            </p>
                        </div>
                    </div>

                    <div style={{ flexShrink: 0, display: 'flex', gap: '8px', alignItems: 'center' }}>

                        <StaffLogoutButton slug={empresa.url} mesaId={mesaId} />

                        <button
                            onClick={() => setIsHistoryOpen(true)}
                            title="Meus Pedidos"
                            style={{
                                backgroundColor: '#f8f9fa',
                                color: '#333',
                                border: '1px solid #ddd',
                                padding: '8px 12px',
                                borderRadius: '8px',
                                fontSize: '12px',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '5px',
                                height: '35px'
                            }}
                        >
                            <i className="fa fa-list-alt"></i>
                            <span className="d-none d-sm-inline">Pedidos</span>
                        </button>

                        {/* BOTÃO PEDIR CONTA (Agora abre o Modal de Pergunta) */}
                        <button
                            onClick={handlePedirContaClick}
                            disabled={closingTable}
                            title="Pedir a Conta"
                            style={{
                                backgroundColor: '#fff0f0',
                                color: '#dc3545',
                                border: '1px solid #dc3545',
                                padding: '8px 12px',
                                borderRadius: '8px',
                                fontSize: '12px',
                                fontWeight: 'bold',
                                cursor: closingTable ? 'wait' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '5px',
                                height: '35px',
                                opacity: closingTable ? 0.7 : 1
                            }}
                        >
                            {closingTable ? (
                                <i className="fa fa-spinner fa-spin"></i>
                            ) : (
                                <>
                                    <i className="fa fa-file-invoice-dollar"></i>
                                    <span className="d-none d-sm-inline">Conta</span>
                                </>
                            )}
                        </button>

                        <LogoutMesaButton slug={empresa.url} mesaId={mesaId} />
                    </div>
                </div>
                
                <OrderHistoryModal
                    isOpen={isHistoryOpen}
                    onClose={() => setIsHistoryOpen(false)}
                    slug={empresa.url}
                    mesaId={mesaId}
                    nomeCliente={nomeCliente}
                    celularCliente={celularCliente}
                    color={empresa.cormenu || '#000'}
                />
            </header>

            {/* 2. CATEGORIAS */}
            <nav className="category-nav">
                <div className="category-list">
                    {categorias.map((cat) => (
                        <button
                            key={cat.id}
                            className={`cat-btn ${activeCategory === cat.id ? 'active' : ''}`}
                            onClick={() => scrollToCategory(cat.id)}
                        >
                            {cat.nome}
                        </button>
                    ))}
                </div>
            </nav>

            {/* 3. PRODUTOS */}
            <div className="products-container">
                {categorias.map((cat) => {
                    const prods = produtos.filter(p => p.categoria === cat.id);
                    if (prods.length === 0) return null;

                    return (
                        <div key={cat.id} id={`cat-${cat.id}`}>
                            <h3 className="category-title">{cat.nome}</h3>
                            <div>
                                {prods.map((prod) => (
                                    <div key={prod.id} className="product-card" onClick={() => openProduct(prod)}>
                                        <div className="product-info">
                                            <div>
                                                <div className="product-name">{prod.nome}</div>
                                                {prod.ingredientes && prod.ingredientes !== 'N' && (
                                                    <div className="product-desc">{prod.ingredientes}</div>
                                                )}
                                            </div>
                                            <div className="product-price">
                                                {prod.valor > 0 ? `R$ ${prod.valor.toFixed(2).replace('.', ',')}` : 'A partir de...'}
                                            </div>
                                        </div>

                                        <div className="product-image-box">
                                            {prod.foto ? (
                                                <img src={`/img/fotos_produtos/${prod.foto}`} alt={prod.nome} />
                                            ) : (
                                                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ccc' }}>
                                                    <i className="fa fa-image fa-2x"></i>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* 4. CARRINHO FLUTUANTE */}
            {cartCount > 0 && (
                <div
                    className="floating-cart"
                    onClick={() => window.location.href = `/${slug}/mesa/${mesaId}/carrinho`}
                    style={{ backgroundColor: empresa.cormenu || '#3d734a' }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div className="cart-count" style={{ color: empresa.cormenu || '#3d734a' }}>
                            {cartCount}
                        </div>
                        <span className="cart-text">Ver meu pedido</span>
                    </div>
                    <div className="cart-total">
                        R$ {cartTotal.toFixed(2).replace('.', ',')}
                    </div>
                </div>
            )}

            <ProductModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                product={selectedProduct}
                color={empresa.cormenu || '#3d734a'}
                onAddToCart={handleAddToCart}
            />

            {/* --- MODAL 1: PERGUNTA DE CONFIRMAÇÃO --- */}
            {isConfirmModalOpen && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 10001,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
                    backdropFilter: 'blur(2px)'
                }}>
                    <div className="animate__animated animate__zoomIn" style={{
                        backgroundColor: '#fff', borderRadius: '15px', padding: '25px',
                        textAlign: 'center', boxShadow: '0 5px 25px rgba(0,0,0,0.2)',
                        maxWidth: '320px', width: '100%'
                    }}>
                        <div style={{ color: '#dc3545', fontSize: '40px', marginBottom: '15px' }}>
                            <i className="fa-solid fa-circle-question"></i>
                        </div>
                        <h5 style={{ fontWeight: 'bold', marginBottom: '10px' }}>Finalizar Atendimento?</h5>
                        <p style={{ fontSize: '14px', color: '#666', marginBottom: '20px' }}>
                            Deseja pedir a conta da <strong>Mesa {mesaId}</strong> agora?
                        </p>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button 
                                onClick={() => setIsConfirmModalOpen(false)}
                                className="btn btn-light w-50 fw-bold"
                            >
                                Não
                            </button>
                            <button 
                                onClick={processarFechamento}
                                className="btn btn-danger w-50 fw-bold"
                            >
                                Sim, Fechar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- MODAL 2: SUCESSO (CONTA PEDIDA) --- */}
            {isBillModalOpen && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 10002,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
                    backdropFilter: 'blur(3px)'
                }}>
                    <div className="animate__animated animate__fadeInUp" style={{
                        backgroundColor: '#fff', borderRadius: '20px', padding: '30px',
                        textAlign: 'center', boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
                        maxWidth: '350px', width: '100%'
                    }}>
                        <div style={{ 
                            color: '#28a745', fontSize: '60px', marginBottom: '15px',
                            display: 'block' 
                        }}>
                            <i className="fa-regular fa-circle-check"></i>
                        </div>
                        
                        <h4 style={{ fontWeight: '800', marginBottom: '10px', color: '#333' }}>
                            Conta Solicitada!
                        </h4>
                        
                        <p style={{ color: '#666', marginBottom: '25px', lineHeight: '1.5', fontSize: '15px' }}>
                            {billMessage}
                        </p>
                        
                        <button 
                            onClick={() => setIsBillModalOpen(false)}
                            className="btn btn-success w-100"
                            style={{ 
                                borderRadius: '50px', fontWeight: 'bold', padding: '12px',
                                fontSize: '16px', boxShadow: '0 4px 15px rgba(40, 167, 69, 0.3)'
                            }}
                        >
                            Entendi, aguardar
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}