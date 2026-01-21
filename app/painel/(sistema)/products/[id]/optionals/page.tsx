import { prisma } from '../../../../../../src/lib/prisma';
import { cookies } from 'next/headers';
import { linkGroupAction, unlinkGroupAction } from './actions';
import { redirect } from 'next/navigation';

export default async function ProductOptionalsPage({ params }: { params: { id: string } }) {
  const produtoId = parseInt(params.id);
  const cookieStore = cookies();
  const session = cookieStore.get('painel_session'); // Pega o cookie com segurança

  // --- TRAVA DE SEGURANÇA ---
  // Se não tiver sessão, manda pro login e PARA de executar o resto
  if (!session || !session.value) {
    redirect('/painel/login');
  }

  const lojaId = parseInt(session.value);
  // --------------------------

  // 1. Buscar o Produto
  const produto = await prisma.produto.findUnique({ where: { id: produtoId } });

  // 2. Buscar TODOS os Grupos da loja (para o Select)
  const todosGrupos = await prisma.grupo.findMany({
    where: { idu: lojaId },
    orderBy: { nomeinterno: 'asc' }
  });

  // 3. Buscar os Grupos JÁ VINCULADOS a este produto
  const vinculados = await prisma.produtoGrupo.findMany({
    where: { idp: produtoId },
    include: { grupo: true } // Trazer os dados do grupo
  });

  return (
    <>
      <div className="slim-pageheader">
        <ol className="breadcrumb slim-breadcrumb">
          <li className="breadcrumb-item"><a href="/painel/products">Produtos</a></li>
          <li className="breadcrumb-item active">Opcionais</li>
        </ol>
        <h6 className="slim-pagetitle">{produto?.nome} - Configurar Opcionais</h6>
      </div>

      <div className="section-wrapper mg-b-20">
        <label className="section-title">Vincular Grupo de Opcionais</label>
        <hr />
        
        <form action={linkGroupAction}>
          <input type="hidden" name="produtoId" value={produtoId} />
          <div className="row">
            <div className="col-lg-8">
              <select name="grupoId" className="form-control" required>
                <option value="">Selecione um Grupo...</option>
                {todosGrupos.map(g => (
                   <option key={g.id} value={g.id}>{g.nomeinterno} - {g.nomegrupo}</option>
                ))}
              </select>
              {todosGrupos.length === 0 && <small className="text-danger">Nenhum grupo cadastrado. <a href="/painel/groups">Clique aqui para criar.</a></small>}
            </div>
            <div className="col-lg-4">
              <button className="btn btn-success btn-block" disabled={todosGrupos.length === 0}>
                <i className="fa fa-plus"></i> Adicionar ao Produto
              </button>
            </div>
          </div>
        </form>
      </div>

      <div className="section-wrapper">
        <label className="section-title">Grupos Ativos neste Produto</label>
        <hr />
        <div className="table-responsive">
          <table className="table mg-b-0">
            <thead>
              <tr>
                <th>Grupo</th>
                <th>Regra</th>
                <th>Ação</th>
              </tr>
            </thead>
            <tbody>
              {vinculados.map((v) => (
                <tr key={v.id}>
                  <td>{v.grupo.nomeinterno} ({v.grupo.nomegrupo})</td>
                  <td>Máx: {v.grupo.quantidade}</td>
                  <td>
                    <form action={unlinkGroupAction}>
                      <input type="hidden" name="id" value={v.id} />
                      <input type="hidden" name="produtoId" value={produtoId} />
                      <button className="btn btn-danger btn-sm"><i className="fa fa-trash"></i> Remover</button>
                    </form>
                  </td>
                </tr>
              ))}
              {vinculados.length === 0 && <tr><td colSpan={3}>Nenhum opcional configurado para este produto.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}