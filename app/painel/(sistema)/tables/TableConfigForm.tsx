'use client'

import { updateTableCountAction } from './actions';
import { toast } from 'react-hot-toast';

interface Props {
  lojaId: number;
  totalAtual: number;
}

export default function TableConfigForm({ lojaId, totalAtual }: Props) {
  
  const handleAction = async (formData: FormData) => {
    const res = await updateTableCountAction(formData);
    
    if (res.success) {
      toast.success("Quantidade de mesas atualizada!");
    } else {
      toast.error(res.error || "Erro ao atualizar");
    }
  };

  return (
    <form action={handleAction}>
      <input type="hidden" name="id" value={lojaId} />
      <div className="d-flex align-items-center">
        <label className="mg-r-10 mg-b-0 tx-12 tx-bold">TOTAL DE MESAS:</label>
        <input 
          name="totalMesas" 
          type="number" 
          className="form-control" 
          style={{ width: 80 }} 
          defaultValue={totalAtual} 
          min="1"
        />
        <button type="submit" className="btn btn-primary mg-l-5 btn-sm">
          Salvar
        </button>
      </div>
    </form>
  );
}