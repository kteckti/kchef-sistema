import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import CozinhaContent from "./CozinhaContent";

interface Props {
  params: { slug: string }
}

export default async function CozinhaPage({ params }: Props) {
  const { slug } = params;

  // Proteção (Login Funcionário)
  const cookieStore = cookies();
  const sessionCookie = cookieStore.get(`staff_session_${slug}`);
  if (!sessionCookie) {
    redirect(`/${slug}/funcionario/login?callbackUrl=/${slug}/cozinha`);
  }

  return (
    <div style={{ minHeight: '100vh', background: '#222', color: '#fff', padding: '15px' }}>
      <div className="d-flex justify-content-between align-items-center mb-4 border-bottom border-secondary pb-3">
        <div>
          <h2 className="fw-bold mb-0 text-white">
            <i className="fa fa-fire text-warning me-2"></i> KDS - Cozinha
          </h2>
          <small className="text-secondary">Pedidos em ordem de chegada</small>
        </div>
        <div>
            <a href={`/${slug}/pdv`} className="btn btn-outline-light btn-sm">
                <i className="fa fa-desktop me-2"></i> Ir para PDV
            </a>
        </div>
      </div>
      
      <CozinhaContent slug={slug} />
    </div>
  );
}