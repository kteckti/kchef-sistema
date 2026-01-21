'use client'

import { deleteProductAction } from './actions';
import { toast } from 'react-hot-toast';

export default function DeleteButton({ id }: { id: number }) {
  
  const handleDelete = async () => {
    // Pergunta de confirmação antes de apagar (Opcional, mas recomendado)
    const confirmacao = window.confirm("Tem certeza que deseja excluir este produto?");
    if (!confirmacao) return;

    // Criamos um FormData manualmente para enviar para a Server Action
    const formData = new FormData();
    formData.append('id', id.toString());

    // Chamamos a ação e esperamos a resposta
    const result = await deleteProductAction(formData);

    if (result?.success) {
      toast.success(result.message, { style: { background: '#23BF08', color: '#fff' } });
    } else if (result?.error) {
      toast.error(result.error);
    }
  };

  return (
    <button 
      onClick={handleDelete} 
      className="btn btn-danger btn-sm" 
      title="Excluir Produto"
      style={{ cursor: 'pointer' }}
    >
      <i className="icon fa fa-times"></i>
    </button>
  );
}