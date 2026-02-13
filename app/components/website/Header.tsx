'use client'

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

export default function Header() {
  const pathname = usePathname();
  // Verificamos se estamos na home ou em uma âncora da home
  const isHome = pathname === '/' || pathname === '/#home' || pathname === '/#sobre' || pathname === '/#contato';

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

  // Lógica corrigida:
  // Se NÃO for home -> isSolid é SEMPRE true.
  // Se FOR home -> isSolid depende da rolagem (> 50px).
  const isSolid = !isHome || scrollPosition > 50;

  return (
    <header 
      className={`fixed-top transition-all ${isSolid ? 'scrolled' : ''}`}
      style={{ 
        backgroundColor: isSolid ? '#102A43' : 'transparent',
        transition: 'background-color 0.3s ease-in-out',
        boxShadow: isSolid ? '0 4px 12px rgba(0,0,0,0.1)' : 'none'
      }}
    >
        <div className="container">
            <nav className="navbar navbar-expand-lg navbar-dark">
                
                <Link className="navbar-brand" href="/">
                     <img 
                        src="/assets/img/logo_oficial.png" 
                        width="200px" 
                        alt="Kteck" 
                        style={{ filter: 'brightness(0) invert(1)' }}
                    />
                </Link>

                <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                    <span className="navbar-toggler-icon"></span>
                </button>

                <div className="collapse navbar-collapse justify-content-end" id="navbarNav">
                    <ul className="navbar-nav align-items-center">
                        <li className="nav-item">
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
                        <li className="nav-item">
                            <Link className="nav-link nav-link-menu" href="/painel/login">Painel dos Clientes</Link>
                        </li>
                        <li className="nav-item ms-lg-3 mt-3 mt-lg-0">
                            <a href="https://wa.me/5515996641070" target="_blank" className="btn btn-custom btn-sm">
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
