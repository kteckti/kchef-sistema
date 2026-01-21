import { prisma } from '@/src/lib/prisma'; // Ajuste o import conforme seu projeto
import Link from 'next/link';
import VariationForm from './VariationForm';
import { deleteVariationAction, toggleVariationStatusAction } from './actions';

// Botão de Status
function StatusButton({ id, status, produtoId }: { id: number, status: number, produtoId: number }) {
  const toggle = toggleVariationStatusAction.bind(null, id, status, produtoId);
  return (
    <form action={toggle} style={{display: 'inline'}}>
      <button className={`btn btn-sm ${status === 1 ? 'btn-danger' : 'btn-success'}`}>
        <i className={`fa ${status === 1 ? 'fa-eye-slash' : 'fa-eye'}`}></i>
      </button>
    </form>
  )
}

// Botão Deletar
function DeleteButton({ id, produtoId }: { id: number, produtoId: number }) {
  return (
    <form action={deleteVariationAction} style={{display: 'inline', marginLeft: 5}}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="produtoId" value={produtoId} />
      <button className="btn btn-warning btn-sm"><i className="fa fa-times"></i></button>
    </form>
  )
}

export default async function VariationsPage({ params }: { params: { id: string } }) {
  const produtoId = parseInt(params.id);
  
  // 1. Buscamos do banco (vem como Decimal)
  const variacoesRaw = await prisma.tamanho.findMany({
    where: { produtoId: produtoId },
    orderBy: { valor: 'asc' }
  });

  // 2. CONVERTEMOS PARA NUMBER (Essa é a correção)
  const variacoes = variacoesRaw.map(v => ({
    ...v,
    valor: Number(v.valor) // Transforma o objeto Decimal em número normal
  }));

  const produto = await prisma.produto.findUnique({ 
    where: { id: produtoId }
  });

  if (!produto) return <div>Produto não encontrado</div>;

  return (
    <>
       <div className="slim-pageheader">
        <ol className="breadcrumb slim-breadcrumb">
          <li className="breadcrumb-item"><a href="/painel/dashboard">Home</a></li>
          <li className="breadcrumb-item"><a href="/painel/products">Produtos</a></li>
          <li className="breadcrumb-item active" aria-current="page">Variações</li>
        </ol>
        <h6 className="slim-pagetitle">{produto.nome}</h6>
      </div>

      <div className="alert alert-info">
        <i className="fa fa-info-circle"></i> O valor do produto será definido pela opção que o cliente escolher abaixo.
      </div>

      <VariationForm produtoId={produtoId} />

      <div className="section-wrapper">
        <label className="section-title">Lista de Variações</label>
        <hr />
        <div className="table-responsive">
          <table className="table mg-b-0">
            <thead>
              <tr>
                <th>Nome</th> {/* MUDOU DE Descrição PARA Nome */}
                <th>Preço</th> {/* MUDOU DE Valor PARA Preço */}
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {variacoes.map((v) => (
                <tr key={v.id}>
                  <td>{v.descricao}</td> {/* MUDOU DE v.descricao PARA v.nome */}
                  <td>R$ {Number(v.valor).toLocaleString('pt-BR', {minimumFractionDigits: 2})}</td> {/* v.preco */}
                  <td>{v.status === 1 ? 'ATIVO' : 'INATIVO'}</td>
                  <td>
                    <StatusButton id={v.id} status={v.status} produtoId={produtoId} />
                    <DeleteButton id={v.id} produtoId={produtoId} />
                  </td>
                </tr>
              ))}
              {variacoes.length === 0 && <tr><td colSpan={4}>Nenhuma variação cadastrada.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}