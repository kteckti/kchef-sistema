'use client'

import Link from 'next/link';
import { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import LojaLogoutButton from '../components/LojaLogoutButton';

export default function LojaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isProductsOpen, setIsProductsOpen] = useState(false);
  const [isConfigOpen, setIsConfigOpen] = useState(false);

  // Estados para lotação (Exemplos que serão alimentados pela sua página ou Contexto)
  const [lotação, setLotação] = useState({ ocupadas: 0, total: 10, porcentagem: 0 });

  return (
    <>
      <Toaster position="top-center" />

      <div className="slim-navbar" style={{ display: 'block' }}>
        <div className="container">
          <ul className="nav">
            <li className="nav-item">
              <Link className="nav-link" href="/painel/dashboard">
                <i className="icon ion-ios-home-outline"></i>
                <span>INICIAL</span>
              </Link>
            </li>

            {/* NOVO BOTÃO MESAS COM PORCENTAGEM */}
            <li className="nav-item">
              <Link className="nav-link" href="/painel/tables">
                <i className="icon ion-ios-grid-view-outline"></i>
                <span>MESAS</span>
              </Link>
            </li>

            <li className={`nav-item with-sub ${isProductsOpen ? 'show' : ''}`}>
              <a className="nav-link" href="#" onClick={(e) => {
                e.preventDefault();
                setIsConfigOpen(false);
                setIsProductsOpen(!isProductsOpen);
              }}>
                <i className="icon ion-ios-cart-outline"></i>
                <span>PRODUTOS</span>
              </a>
              <div className="sub-item">
                <ul>
                  <li><Link href="/painel/products" onClick={() => setIsProductsOpen(false)}>Listar Produtos</Link></li>
                  <li><Link href="/painel/categories" onClick={() => setIsProductsOpen(false)}>Categorias</Link></li>
                  <li><Link href="/painel/groups" onClick={() => setIsProductsOpen(false)}>Grupos de Opcionais</Link></li>
                </ul>
              </div>
            </li>

            <li className="nav-item">
              <Link className="nav-link" href="/painel/orders">
                <i className="icon ion-ios-list-outline"></i>
                <span>PEDIDOS</span>
              </Link>
            </li>

            <li className={`nav-item with-sub ${isConfigOpen ? 'show' : ''}`}>
              <a className="nav-link" href="#" onClick={(e) => {
                e.preventDefault();
                setIsProductsOpen(false);
                setIsConfigOpen(!isConfigOpen);
              }}>
                <i className="icon ion-ios-gear-outline"></i>
                <span>CONFIGURAÇÕES</span>
              </a>
              <div className="sub-item">
                <ul>
                  <li><Link href="/painel/company" onClick={() => setIsConfigOpen(false)}>Minha Empresa</Link></li>
                  <li className="logout-wrapper"><LojaLogoutButton /></li>
                </ul>
              </div>
            </li>
          </ul>
        </div>
      </div>

      <div className="slim-mainpanel">
        <div className="container">{children}</div>
      </div>

      <style jsx>{`
  /* 1. CORREÇÃO DA BARRA PRINCIPAL: Removemos o flex do nav-item para não quebrar a linha */
  .nav-item.with-sub {
    position: relative;
    display: block; /* Volta ao padrão do Slim para não criar espaços no meio da barra */
  }

  /* Impede que o hover nativo do Slim apareça e cause conflito */
  .nav-item.with-sub:hover .sub-item {
    display: none;
  }

  /* 2. CONTAINER DO DROPDOWN: Ajustado para ser fixo e centralizado em relação ao botão */
  .nav-item.with-sub.show .sub-item {
    display: block !important;
    position: absolute;
    top: 100%;
    left: 0;
    background-color: #fff;
    border: 1px solid #dee2e6;
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
    width: 220px;
    z-index: 10000;
    padding: 0;
    border-radius: 8px;
    margin-top: 5px;
    overflow: hidden;
    text-align: left; /* Garante que tudo dentro do dropdown comece na esquerda */
  }

  /* 3. LISTA INTERNA */
  .sub-item ul {
    list-style: none;
    padding: 0 !important;
    margin: 0 !important;
    width: 100% !important;
  }

  .sub-item ul li {
    width: 100% !important;
    padding: 0 !important;
    margin: 0 !important;
    display: block !important;
  }

  /* 4. LINKS E BOTÕES: Forçamos o alinhamento à esquerda e ocupação total */
  .sub-item ul li :global(a), 
  .sub-item ul li :global(button) {
    display: block !important;
    width: 100% !important;
    box-sizing: border-box !important;
    padding: 12px 20px !important;
    color: #495057 !important;
    text-decoration: none !important;
    font-size: 13px !important;
    background: transparent !important;
    border: none !important;
    text-align: left !important; /* CORREÇÃO: Força o texto (e botão sair) para a esquerda */
    transition: all 0.2s ease;
  }

  /* 5. HOVER */
  .sub-item ul li :global(a:hover), 
  .sub-item ul li :global(button:hover) {
    background-color: #f1f3f5 !important;
    color: #3d734a !important;
  }

  /* Divisor visual para o Logout */
  .logout-wrapper {
    border-top: 1px solid #f1f1f1;
    width: 100%;
  }

  /* Ajuste para o ícone de seta não quebrar o alinhamento do texto pai */
  .nav-link i.fa-angle-down {
    margin-left: 5px;
    font-size: 12px;
  }
    .badge-lotação {
    margin-left: 8px;
    padding: 2px 6px;
    border-radius: 4px;
    color: #fff;
    font-size: 10px;
    font-weight: bold;
    display: inline-block;
    line-height: 1;
  }
  
  /* Ajuste para o ícone de mesas */
  .ion-ios-grid-view-outline {
    font-size: 20px;
  }
`}</style>
    </>
  );
}