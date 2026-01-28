import Link from 'next/link';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import PDVContent from "./PDVContent";
import { prisma } from '@/src/lib/prisma';

interface Props {
  params: { slug: string }
}

export default async function PDVPage({ params }: Props) {
  const { slug } = params;
  
  // 1. Verificação de Segurança (Login Funcionário)
  const cookieStore = cookies();
  const sessionCookie = cookieStore.get(`staff_session_${slug}`);

  if (!sessionCookie) {
    // Redireciona para login de funcionário
    redirect(`/${slug}/funcionario/login?callbackUrl=/${slug}/pdv`);
  }

  // 2. Buscar infos da empresa (opcional, só pra garantir que o slug existe)
  const empresa = await prisma.config.findUnique({ where: { url: slug } });
  if(!empresa) return <div>Loja não encontrada.</div>;

  return (
    <div style={{ minHeight: '100vh', background: '#f0f2f5', padding: '20px' }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        
        <div>
          <h3 className="fw-bold text-dark mb-0">
            <i className="fa fa-desktop me-2"></i> PDV - {empresa.nomeempresa}
          </h3>
          <p className="text-muted small mb-0">Monitoramento em tempo real</p>
        </div>

        <div className="d-flex align-items-center gap-3">
            <Link href={`/${slug}/pdv/novo`} className="btn btn-primary fw-bold shadow-sm">
                <i className="fa fa-plus-circle me-2"></i> Novo Pedido
            </Link>

            <span className="badge bg-success p-2">
                <i className="fa fa-circle text-white me-2 blink"></i> Online
            </span>
            
            {/* Botão de Sair (limpa cookie via server action ou link para rota de logout) */}
            {/* Você pode criar um botão client side para deletar o cookie depois */}
        </div>
      </div>
      
      {/* Passamos o slug para o componente cliente saber quem chamar */}
      <PDVContent slug={slug} />
    </div>
  );
}