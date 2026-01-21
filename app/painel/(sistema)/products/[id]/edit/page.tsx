import { prisma } from '../../../../../../src/lib/prisma';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import ProductForm from '../../ProductForm'; // Importa o form que acabamos de editar

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const cookieStore = cookies();
  const lojaId = cookieStore.get('painel_session')?.value; // Nome corrigido
  
  if (!lojaId) redirect('/painel/login');
  
  const idu = parseInt(lojaId);
  const produtoId = parseInt(params.id);

  if (isNaN(produtoId)) redirect('/painel/products');

  // 1. Busca o Produto (Garante que pertence à loja 'idu')
  const produto = await prisma.produto.findFirst({
    where: { id: produtoId, idu: idu }
  });

  if (!produto) {
    return <div className="alert alert-danger">Produto não encontrado ou sem permissão.</div>;
  }

  // 2. Busca Categorias (Para preencher o select)
  const categorias = await prisma.categoria.findMany({
    where: { idu },
    orderBy: { posicao: 'asc' }
  });

  // 3. Conversão do Decimal para Number (Evitar erro "Plain Object")
  const produtoSerializado = {
    ...produto,
    valor: Number(produto.valor) 
  };

  return (
    <>
      <div className="slim-pageheader">
        <ol className="breadcrumb slim-breadcrumb">
          <li className="breadcrumb-item"><a href="/painel/dashboard">Home</a></li>
          <li className="breadcrumb-item"><a href="/painel/products">Produtos</a></li>
          <li className="breadcrumb-item active" aria-current="page">Editar</li>
        </ol>
        <h6 className="slim-pagetitle">Editar: {produto.nome}</h6>
      </div>

      {/* Passamos o 'initialData', o que ativa o Modo Edição do Form */}
      <ProductForm categories={categorias} initialData={produtoSerializado} />
    </>
  );
}