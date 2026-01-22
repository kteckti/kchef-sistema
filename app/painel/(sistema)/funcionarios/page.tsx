import { getFuncionarios, excluirFuncionario } from './actions';
import FuncionarioModal from './FuncionarioModal';
import AddButton from './AddButton'; // Vamos criar um componente cliente pequeno para o botão

export default async function FuncionariosPage() {
  const funcionarios = await getFuncionarios();

  return (
    <div>
       <div className="d-flex justify-content-between align-items-center mg-b-20">
          <h3 className="text-dark font-bold">Equipe</h3>
          <AddButton /> {/* Botão Cliente para abrir o modal */}
       </div>

       <div className="card card-table">
          <div className="card-header">
            <h6 className="slim-card-title">Lista de Funcionários</h6>
          </div>
          <div className="table-responsive">
            <table className="table mg-b-0 tx-13">
              <thead>
                <tr className="tx-10">
                  <th>Nome</th>
                  <th>Login</th>
                  <th>Função</th>
                  <th className="text-center">Ações</th>
                </tr>
              </thead>
              <tbody>
                {funcionarios.length === 0 && (
                    <tr><td colSpan={4} className="text-center pd-20">Nenhum funcionário cadastrado.</td></tr>
                )}
                {funcionarios.map(f => (
                  <ListaItem key={f.id} funcionario={f} />
                ))}
              </tbody>
            </table>
          </div>
       </div>
    </div>
  );
}

// Pequeno componente para gerenciar o item da lista e edição (Client Component embutido)
import { ListaItem } from './ListaItem';