'use client'

import { useState, useEffect } from 'react';
import ProductModal from './ProductModal';
import { toast } from 'react-hot-toast';
import LogoutMesaButton from '@/app/[slug]/components/LogoutMesaButton';
import OrderHistoryModal from './OrderHistoryModal';

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

    // CORREÇÃO 1: Extrair o slug de dentro da empresa para usar no botão de logout
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
                    borderRadius: '12px'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
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

                    {/* ÁREA DOS BOTÕES (Acompanhar + Sair) */}
                    <div style={{ flexShrink: 0, marginLeft: '10px', display: 'flex', gap: '8px' }}>

                        {/* BOTÃO ACOMPANHAR PEDIDOS */}
                        <button
                            onClick={() => setIsHistoryOpen(true)}
                            className="btn-acompanhar"
                            style={{
                                backgroundColor: '#f8f9fa', // Cor suave
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
                                height: '100%' // Garante alinhamento com o botão de sair
                            }}
                        >
                            <i className="fa fa-list-alt"></i>
                            <span className="d-none d-sm-inline">Pedidos</span> {/* Oculta texto em telas mto pequenas se precisar */}
                        </button>

                        {/* BOTÃO SAIR EXISTENTE */}
                        <LogoutMesaButton slug={empresa.url} mesaId={mesaId} />
                    </div>
                </div>
                {/* RENDERIZAÇÃO DO MODAL DE HISTÓRICO */}
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
        </div>
    );
}