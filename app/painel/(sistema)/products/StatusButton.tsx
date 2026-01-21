'use client'

import { toggleProductStatusAction } from './actions';
import { toast } from 'react-hot-toast';

interface Props {
  id: number;
  status: number;
}

export default function StatusButton({ id, status }: Props) {
  
  const handleToggle = async () => {
    try {
      const result = await toggleProductStatusAction(id, status);
      
      if (result?.error) {
        toast.error(result.error);
      } 
      // Se der sucesso, o server action já faz o revalidatePath, 
      // então a ícone muda sozinho.
      
    } catch (error) {
      toast.error("Erro ao alterar status.");
    }
  };

  return (
    <button 
      onClick={handleToggle}
      className={status === 1 ? "btn btn-danger btn-sm" : "btn btn-success btn-sm"}
      title={status === 1 ? "Desativar" : "Ativar"}
      style={{ display: 'inline-block', marginRight: '5px' }} // Ajuste visual
    >
      <i className={status === 1 ? "fa fa-eye-slash" : "fa fa-eye"}></i>
    </button>
  );
}