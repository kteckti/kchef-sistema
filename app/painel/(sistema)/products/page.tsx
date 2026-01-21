import { prisma } from '@/src/lib/prisma';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';

// Componentes
import ProductForm from './ProductForm';
import DeleteButton from './DeleteButton';
import VisibilityButton from './VisibilityButton';
import StatusButton from './StatusButton';
import ProductThumbnail from './ProductThumbnail'; // <--- Importe o novo componente

function formatarDias(visivel: string | null) {
  if (!visivel || visivel === 'G') return <span className="badge badge-success">Todos os dias</span>;

  const diasMap: Record<string, string> = {
    '1': 'Seg', '2': 'Ter', '3': 'Qua', '4': 'Qui',
    '5': 'Sex', '6': 'Sáb', '0': 'Dom'
  };

  const diasSelecionados = visivel.split(',').map(d => diasMap[d] || d);

  return <span className="tx-12">{diasSelecionados.join(', ')}</span>;
}

export default async function ProductsPage() {
  const cookieStore = cookies();
  const lojaId = cookieStore.get('painel_session')?.value;
  if (!lojaId) redirect('/painel/login');

  const idu = parseInt(lojaId);

  // 1. Busca Categorias
  const categorias = await prisma.categoria.findMany({
    where: { idu },
    orderBy: { posicao: 'asc' }
  });

  // 2. Busca Produtos
  const produtos = await prisma.produto.findMany({
    where: { idu },
    include: { categoria: true },
    orderBy: { nome: 'asc' }
  });

  return (
    <>
      <div className="slim-pageheader">
        <ol className="breadcrumb slim-breadcrumb">
          <li className="breadcrumb-item"><a href="/painel/dashboard">Home</a></li>
          <li className="breadcrumb-item active" aria-current="page">Produtos</li>
        </ol>
        <h6 className="slim-pagetitle">Produtos</h6>
      </div>

      {/* FORMULÁRIO DE CADASTRO */}
      <ProductForm categories={categorias} />

      {/* LISTAGEM */}
      <div className="section-wrapper">
        <label className="section-title"><i className="fa fa-list"></i> Lista de Produtos</label>
        <hr />

        <div className="table-responsive">
          <table className="table display responsive nowrap">
            <thead>
              <tr>
                <th>IMG</th>
                <th>Categoria</th>
                <th>Nome</th>
                <th>Valor</th>
                <th>Visível</th>
                <th>Status</th>
                <th className="text-center">Ações</th>
              </tr>
            </thead>
            <tbody>
              {produtos.map((prod) => (
                <tr key={prod.id}>
                  {/* AQUI ESTÁ A MUDANÇA: Usamos o componente Thumbnail */}
                  <td>
                    <ProductThumbnail foto={prod.foto} nome={prod.nome} />
                  </td>
                  
                  <td>{prod.categoria?.nome || 'Sem Categoria'}</td>
                  <td>{prod.nome}</td>
                  <td style={{ fontWeight: 'bold' }}>
                    R$ {Number(prod.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td>
                    {formatarDias(prod.visivel)}
                  </td>
                  <td>
                    {prod.status === 1 ? <span className="text-success">Ativo</span> : <span className="text-danger">Bloqueado</span>}
                  </td>

                  <td className="text-center">
                    <div className="btn-group">
                      <VisibilityButton productId={prod.id} currentValue={prod.visivel} />
                      <StatusButton id={prod.id} status={prod.status} />
                      <Link href={`/painel/products/${prod.id}/variations`} className="btn btn-info btn-sm" title="Tamanhos"><i className="fa fa-braille"></i></Link>
                      <Link href={`/painel/products/${prod.id}/optionals`} className="btn btn-warning btn-sm" title="Opcionais"><i className="fa fa-plus-square"></i></Link>
                      <Link href={`/painel/products/${prod.id}/edit`} className="btn btn-primary btn-sm" title="Editar"><i className="fa fa-pencil"></i></Link>
                      <DeleteButton id={prod.id} />
                    </div>
                  </td>
                </tr>
              ))}

              {produtos.length === 0 && (
                <tr><td colSpan={7} className="text-center">Nenhum produto cadastrado.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}