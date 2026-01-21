import Link from 'next/link';
// Importe o componente que acabamos de criar
import LogoutButton from '../components/LogoutButton'; 
import SessionGuard from '../components/SessionGuard';
import "../../slim.css";

import { Toaster } from 'react-hot-toast';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SessionGuard />

      <Toaster position="top-center" />

      <div className="slim-navbar" style={{display: 'block'}}></div>
      
      <div className="slim-navbar" style={{display: 'block'}}>
        <div className="container">
          <ul className="nav">
            <li className="nav-item">
              <Link className="nav-link" href="/admin/dashboard">
                <i className="icon ion-ios-home-outline"></i>
                <span>PAINEL ADMINISTRATIVO</span>
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" href="/admin/settings">
                <i className="icon ion-ios-gear-outline"></i>
                <span>CONFIGURAÇÕES</span>
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" href="/admin/profile">
                <i className="icon ion-ios-person-outline"></i>
                <span>MEU PERFIL</span>
              </Link>
            </li>
            <li className="nav-item">
               {/* Substituímos o <form> inteiro por este componente */}
               <LogoutButton />
            </li>
          </ul>
        </div>
      </div>

      <div className="slim-mainpanel">
        <div className="container">
          {children}
        </div>
      </div>

      <div className="slim-footer">
        <div className="container">
          <p>Copyright 2026 &copy; Todos os direitos reservados.</p>
        </div>
      </div>
    </>
  );
}