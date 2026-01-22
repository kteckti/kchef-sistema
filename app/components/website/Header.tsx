'use client'

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

export default function Header() {
  const pathname = usePathname();
  const isHome = pathname === '/';

  const [scrollPosition, setScrollPosition] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollPosition(window.scrollY);
    };

    // Executa imediatamente para garantir o estado correto ao carregar
    handleScroll();

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lógica:
  // Se NÃO for home -> isSolid = true (Fundo Azul #102A43 Sempre)
  // Se FOR home e rolou > 50px -> isSolid = true (Fundo Azul #102A43)
  // Se FOR home e topo -> isSolid = false (Transparente)
  const isSolid = !isHome || scrollPosition > 50;

  return (
    <header 
      className={`fixed-top transition-all ${isSolid ? 'scrolled' : ''}`}
    >
        <div className="container">
            {/* MUDANÇA PRINCIPAL: Usamos sempre 'navbar-dark' para ter texto branco,
                pois o fundo #102A43 é escuro. */}
            <nav className="navbar navbar-expand-lg navbar-dark">
                
                <Link className="navbar-brand" href="/">
                    {/* Como o fundo é sempre escuro (ou imagem ou azul), a logo 
                        deve estar sempre branca/clara */}
                     <img 
                        src="/assets/img/logo_oficial.png" 
                        width="200px" 
                        alt="Kteck" 
                        // Se sua logo original for escura, mantemos o filtro para inverter sempre.
                        // Se ela já for branca, remova o style abaixo.
                        style={{ filter: 'brightness(0) invert(1)' }}
                    />
                </Link>

                <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                    <span className="navbar-toggler-icon"></span>
                </button>

                <div className="collapse navbar-collapse justify-content-end" id="navbarNav">
                    <ul className="navbar-nav align-items-center">
                        <li className="nav-item">
                            {/* Adicionei 'nav-link' do bootstrap para espaçamento correto */}
                            <Link className="nav-link nav-link-menu" href="/#home">Home</Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link nav-link-menu" href="/#sobre">Sobre Nós</Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link nav-link-menu" href="/servicos">Serviços</Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link nav-link-menu" href="/#contato">Contato</Link>
                        </li>
                        <li className="nav-item ms-3">
                            <a href="#" className="btn btn-custom btn-sm">
                                Meus Chamados
                            </a>
                        </li>
                    </ul>
                </div>
            </nav>
        </div>
    </header>
  );
}