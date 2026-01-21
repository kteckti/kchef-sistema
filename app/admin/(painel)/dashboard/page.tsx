import { prisma } from '@/src/lib/prisma';
import Link from 'next/link';
import { revalidatePath } from 'next/cache';
import NewClientModal from './NewClientModal';


export default async function DashboardPage() {
  // --- 1. Buscando Dados (Backend) ---
  const hoje = new Date();

  // Total cadastrados
  const totalEmpresas = await prisma.config.count();

  // Ativas (Data expiração > hoje E status = 1)
  const totalAtivas = await prisma.config.count({
    where: {
      expiracao: { gt: hoje },
      status: 1
    }
  });

  // Vencidas (Data expiração < hoje)
  const totalVencidas = await prisma.config.count({
    where: {
      expiracao: { lt: hoje }
    }
  });

  // Bloqueadas (Status = 3)
  const totalBloqueadas = await prisma.config.count({
    where: { status: 3 }
  });

  // Lista de Clientes
  const clientes = await prisma.config.findMany({
    orderBy: { id: 'desc' }
  });

  // --- 2. Ação de Excluir (Server Action) ---
  async function deleteClient(formData: FormData) {
    'use server'
    const id = parseInt(formData.get('id') as string);

    // Deleta em cascata (simulando o PHP original)
    await prisma.bairro.deleteMany({ where: { idu: id } });
    // await prisma.banner.deleteMany({ where: { idu: id } });
    await prisma.categoria.deleteMany({ where: { idu: id } });
    await prisma.fundoTopo.deleteMany({ where: { idu: id } });
    // await prisma.logo.deleteMany({ where: { idu: id } }); // Logo usa string no IDU no schema, verifique se pode dar erro
    await prisma.opcional.deleteMany({ where: { idu: id } });
    await prisma.produto.deleteMany({ where: { idu: id } });
    await prisma.config.delete({ where: { id: id } });

    revalidatePath('/admin/dashboard');
  }

  // --- 3. Renderização (HTML) ---
  return (
    <>
      {/* Cards de Estatísticas */}
      <div className="card card-dash-one mg-t-20">
        <div className="row no-gutters">
          <div className="col-lg-3">
            <i className="icon ion-ios-pie-outline"></i>
            <div className="dash-content">
              <label className="tx-success">Empresas Cadastradas</label>
              <h2>{totalEmpresas}</h2>
            </div>
          </div>
          <div className="col-lg-3">
            <i className="icon ion-ios-stopwatch-outline"></i>
            <div className="dash-content">
              <label className="tx-purple">Empresas Ativas</label>
              <h2>{totalAtivas}</h2>
            </div>
          </div>
          <div className="col-lg-3">
            <i className="icon ion-ios-stopwatch-outline"></i>
            <div className="dash-content">
              <label className="tx-warning">Empresas Vencidas</label>
              <h2>{totalVencidas}</h2>
            </div>
          </div>
          <div className="col-lg-3">
            <i className="icon ion-ios-analytics-outline"></i>
            <div className="dash-content">
              <label className="tx-danger">Empresas Bloqueadas</label>
              <h2>{totalBloqueadas}</h2>
            </div>
          </div>
        </div>
      </div>

      {/* Botões de Atalho */}
      <div className="section-wrapper mg-t-20">
        <div className="section-title">

          <NewClientModal />
          
          <Link href="/admin/settings" className="btn btn-success btn-sm" style={{ marginRight: 5 }}>
            <i className="fa fa-plus" aria-hidden="true"></i> Configurações
          </Link>
          <Link href="/admin/profile" className="btn btn-info btn-sm">
            <i className="fa fa-plus" aria-hidden="true"></i> Dados do Usuário
          </Link>
        </div>
        <hr />

        {/* Tabela de Clientes */}
        <div className="table-responsive">
          <table className="table display responsive nowrap">
            <thead>
              <tr>
                <th>ID</th>
                <th>Empresa</th>
                <th>Expira em</th>
                <th>Cliente</th>
                <th>Email</th>
                <th>WhatsApp</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {clientes.map((cli) => {
                // CORREÇÃO: Verifica se 'cli.expiracao' existe antes de calcular
                // Se for null (sem expiração), definimos um valor padrão ou tratamos visualmente

                const diffDays = cli.expiracao
                  ? Math.ceil((new Date(cli.expiracao).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
                  : null; // Se não tiver data (null), a variável fica null

                return (
                  <tr key={cli.id}>
                    <td>{cli.id}</td>
                    <td>{cli.nomeempresa}</td>
                    <td>
                      {diffDays === null ? (
                        // CASO 1: Se for nulo, é Vitalício (ou sem data definida)
                        <span className="text-info">Vitalício</span>
                      ) : diffDays >= 1 ? (
                        // CASO 2: Tem dias sobrando
                        <span style={{ color: '#00CC00' }}>{diffDays} dias</span>
                      ) : (
                        // CASO 3: Acabaram os dias
                        <span style={{ color: '#FF6600' }}>Já expirou</span>
                      )}
                    </td>
                    <td>{cli.nomeadmin}</td>
                    <td>{cli.email}</td>
                    <td>
                      <a href={`https://api.whatsapp.com/send?phone=55${cli.celular}`} target="_blank">
                        {cli.celular}
                      </a>
                    </td>
                    <td>
                      {cli.status === 1 && <span className="btn btn-success btn-sm">Ativo</span>}
                      {cli.status === 2 && <span className="btn btn-info btn-sm">Novo Cliente</span>}
                      {cli.status === 3 && <span className="btn btn-danger btn-sm">Bloqueado</span>}
                    </td>
                    <td className="flex gap-2">
                      {/* Botão Ver (Leva para página de detalhes) */}
                      <Link href={`/admin/clients/${cli.id}`} className="btn btn-purple btn-sm" style={{ marginRight: 5 }}>
                        <i className="fa fa-eye"></i>
                      </Link>

                      {/* Botão Deletar (Formulário Server Action) */}
                      <form action={deleteClient} style={{ display: 'inline' }}>
                        <input type="hidden" name="id" value={cli.id} />
                        <button type="submit" className="btn btn-danger btn-sm">
                          <i className="fa fa-times"></i>
                        </button>
                      </form>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}