'use client'

import { useEffect, useState, useCallback } from 'react'; // Adicione useCallback se quiser otimizar, mas não é obrigatório aqui
import { getOrdersAction, getProductsForSelectAction } from './actions';
import OrderCard from './OrderCard';
import NewOrderModal from './NewOrderModal';

export default function OrdersPage() {
  const [pedidos, setPedidos] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // A função que recarrega a tela
  const fetchOrders = async () => {
    const data = await getOrdersAction(0);
    setPedidos(data);
    setLoading(false);
  };

  useEffect(() => {
    // Carrega produtos
    const loadProducts = async () => {
        const prodData = await getProductsForSelectAction();
        
        // CORREÇÃO: Não precisamos mais fazer .map aqui!
        // A action já devolve { id, nome, valor, tamanhos: { nome, preco } } tudo certinho.
        setProducts(prodData);
    };
    loadProducts();
    
    // Carrega pedidos
    fetchOrders();

    const interval = setInterval(() => {
      fetchOrders();
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  const pendentes = pedidos.filter(p => p.status === 1);
  const preparo = pedidos.filter(p => p.status === 2);
  const entrega = pedidos.filter(p => p.status === 3);

  return (
    <>
      {/* ... (cabeçalho da página) ... */}

      <div className="row mg-b-20">
        <div className="col-12 text-right">
             {/* PASSAMOS O onSuccess={fetchOrders} */}
             <NewOrderModal products={products} onSuccess={fetchOrders} />
        </div>
      </div>

      {loading && <div className="text-center">Carregando pedidos...</div>}

      <div className="row row-sm">
        
        {/* COLUNA 1 */}
        <div className="col-lg-4">
          <h6 className="tx-gray-800 tx-uppercase tx-bold mg-b-15">
            <i className="fa fa-circle text-warning mg-r-5"></i> Pedidos Novos ({pendentes.length})
          </h6>
          {pendentes.map(p => (
              // PASSAMOS O onUpdate={fetchOrders}
              <OrderCard key={p.id} pedido={p} onUpdate={fetchOrders} />
          ))}
          {/* ... */}
        </div>

        {/* COLUNA 2 */}
        <div className="col-lg-4">
          <h6 className="tx-gray-800 tx-uppercase tx-bold mg-b-15">
             <i className="fa fa-circle text-primary mg-r-5"></i> Em Andamento ({preparo.length})
          </h6>
          {preparo.map(p => (
              // PASSAMOS O onUpdate={fetchOrders}
              <OrderCard key={p.id} pedido={p} onUpdate={fetchOrders} />
          ))}
          {/* ... */}
        </div>

        {/* COLUNA 3 */}
        <div className="col-lg-4">
           <h6 className="tx-gray-800 tx-uppercase tx-bold mg-b-15">
             <i className="fa fa-circle text-success mg-r-5"></i> Concluídos / Entrega ({entrega.length})
           </h6>
          {entrega.map(p => (
              // PASSAMOS O onUpdate={fetchOrders}
              <OrderCard key={p.id} pedido={p} onUpdate={fetchOrders} />
          ))}
          {/* ... */}
        </div>

      </div>
    </>
  );
}