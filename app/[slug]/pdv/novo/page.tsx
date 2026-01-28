import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getDadosCardapio } from "../actions";
import NovoPedidoContent from "./NovoPedidoContent";

interface Props {
  params: { slug: string }
}

export default async function NovoPedidoPage({ params }: Props) {
  const { slug } = params;

  // 1. Verificação de Segurança (Login Funcionário)
  const cookieStore = cookies();
  const sessionCookie = cookieStore.get(`staff_session_${slug}`);

  if (!sessionCookie) {
    redirect(`/${slug}/funcionario/login?callbackUrl=/${slug}/pdv/novo`);
  }

  // 2. Busca os dados passando o SLUG
  const categorias = await getDadosCardapio(slug);

  return (
    <div className="container-fluid pd-20" style={{ padding: '20px', minHeight: '100vh', background: '#f8f9fa' }}>
       <div className="d-flex justify-content-between align-items-center mg-b-20 mb-4">
          <h4 className="tx-dark font-bold mg-b-0 text-dark">
            <i className="fa fa-plus-circle mg-r-10 me-2"></i> Novo Pedido (Balcão)
          </h4>
          
          {/* Link dinâmico para voltar ao monitor correto */}
          <Link href={`/${slug}/pdv`} className="btn btn-secondary btn-sm shadow-sm">
            <i className="fa fa-arrow-left me-2"></i> Voltar ao Monitor
          </Link>
       </div>

       {/* Passando o slug para o componente cliente */}
       <NovoPedidoContent categorias={categorias} slug={slug} />
    </div>
  );
}