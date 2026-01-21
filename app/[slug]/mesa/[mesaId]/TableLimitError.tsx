'use client' // <--- Isso permite usar onClick

interface Props {
  mesaId: string;
  limit: number;
}

export default function TableLimitError({ mesaId, limit }: Props) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-sm">
        <i className="fa fa-exclamation-triangle text-red-500 text-5xl mb-4"></i>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Mesa Inválida</h2>
        <p className="text-gray-600">
          A mesa <strong>{mesaId}</strong> não está disponível. 
          O limite deste estabelecimento é de {limit} mesas.
        </p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-6 px-4 py-2 bg-gray-800 text-white rounded-md cursor-pointer hover:bg-gray-700 transition"
        >
          Tentar Novamente
        </button>
      </div>
    </div>
  );
}