import { prisma } from '../../../../src/lib/prisma';
import { cookies } from 'next/headers';
import { deleteGroupAction } from './actions';
import Link from 'next/link';
import GroupForm from './GroupForm';
import { redirect } from 'next/navigation'; // <--- IMPORTANTE: Importar o redirect

// Componente para deletar
function DeleteGroupButton({ id }: { id: number }) {
  return (
    <form action={deleteGroupAction} style={{display: 'inline', marginLeft: 5}}>
      <input type="hidden" name="id" value={id} />
      <button className="btn btn-danger btn-sm"><i className="fa fa-times"></i></button>
    </form>
  )
}

export default async function GroupsPage() {
  const cookieStore = cookies();
  const lojaId = cookieStore.get('painel_session')?.value;
  
  // --- CORREÇÃO AQUI ---
  // Se não tiver cookie, redireciona para login antes de tentar usar o ID
  if (!lojaId) {
    redirect('/painel/login');
  }

  const idu = parseInt(lojaId);

  // Segurança extra: se o ID não for número válido
  if (isNaN(idu)) {
     redirect('/painel/login');
  }
  // ---------------------

  const grupos = await prisma.grupo.findMany({
    where: { idu }, // Agora o 'idu' é garantido como número
    orderBy: { posicao: 'asc' }
  });

  return (
    <>
      <div className="slim-pageheader">
        <ol className="breadcrumb slim-breadcrumb">
          <li className="breadcrumb-item"><a href="/painel/dashboard">Home</a></li>
          <li className="breadcrumb-item active" aria-current="page">Grupos de Opcionais</li>
        </ol>
        <h6 className="slim-pagetitle">Grupos de Opcionais</h6>
      </div>

      <GroupForm />

      <div className="section-wrapper">
        <div className="table-responsive">
          <table className="table mg-b-0">
            <thead>
              <tr>
                <th>Nome Interno</th>
                <th>Nome Externo</th>
                <th>Regra</th>
                <th>Itens</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {grupos.map((g) => (
                <tr key={g.id}>
                  <td>{g.nomeinterno}</td>
                  <td>{g.nomegrupo}</td>
                  <td>
                    {g.obrigatorio === 1 && <span className="badge badge-warning">Obrigatório</span>}
                    {g.obrigatorio === 2 && <span className="badge badge-info">Até {g.quantidade} itens</span>}
                    {g.obrigatorio === 3 && <span className="badge badge-purple">Sabores</span>}
                  </td>
                  <td>
                     <Link href={`/painel/groups/${g.id}/options`} className="btn btn-warning btn-sm">
                        Itens <i className="fa fa-arrow-right"></i>
                     </Link>
                  </td>
                  <td>
                    <DeleteGroupButton id={g.id} />
                  </td>
                </tr>
              ))}
              {grupos.length === 0 && <tr><td colSpan={5}>Nenhum grupo cadastrado.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}