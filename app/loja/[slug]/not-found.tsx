import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="page-error-wrapper" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f5f5f5' }}>
      <div>
        <h1 className="error-title" style={{ fontSize: '80px', color: '#102a43' }}>404</h1>
        <h2 className="tx-color-03 tx-24 mg-b-20">Loja não encontrada.</h2>
        <p className="tx-color-03 mg-b-30">A URL que você tentou acessar não pertence a nenhuma loja ativa.</p>
        
        <Link href="/" className="btn btn-primary btn-oblong">
          <i className="fa fa-home"></i> Ir para a Página Inicial
        </Link>
      </div>
    </div>
  );
}