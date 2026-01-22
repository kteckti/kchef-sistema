'use client'
import { useState } from 'react';
import FuncionarioModal from './FuncionarioModal';
import { excluirFuncionario } from './actions';
import { toast } from 'react-hot-toast';

export function ListaItem({ funcionario }: { funcionario: any }) {
  const [isEditOpen, setIsEditOpen] = useState(false);

  const handleDelete = async () => {
    if(!confirm('Tem certeza que deseja excluir este funcionário?')) return;
    const res = await excluirFuncionario(funcionario.id);
    if(res.error) toast.error(res.error);
    else toast.success("Excluído com sucesso");
  };

  // Cores das badges
  const getBadge = (funcao: string) => {
    switch(funcao) {
        case 'GERENTE': return 'badge-danger';
        case 'CAIXA': return 'badge-warning';
        case 'COZINHA': return 'badge-info';
        default: return 'badge-success'; // Atendimento
    }
  }

  return (
    <>
      <tr>
        <td className="font-bold">{funcionario.nome}</td>
        <td>{funcionario.login}</td>
        <td>
            <span className={`badge ${getBadge(funcionario.funcao)}`}>
                {funcionario.funcao}
            </span>
        </td>
        <td className="text-center">
           <button onClick={() => setIsEditOpen(true)} className="btn btn-sm btn-outline-primary mg-r-5">
             <i className="fa fa-pencil"></i>
           </button>
           <button onClick={handleDelete} className="btn btn-sm btn-outline-danger">
             <i className="fa fa-trash"></i>
           </button>
        </td>
      </tr>
      <FuncionarioModal 
        isOpen={isEditOpen} 
        onClose={() => setIsEditOpen(false)} 
        funcionario={funcionario} 
      />
    </>
  );
}