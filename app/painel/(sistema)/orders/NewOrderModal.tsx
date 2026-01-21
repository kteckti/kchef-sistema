'use client'

import { useState, useMemo, useRef } from 'react';
import { createOrderAction } from './actions';
import { toast } from 'react-hot-toast';

interface CartItem {
  id: number;
  nome: string;
  valor: number;
  quantidade: number;
  observacao?: string;
}

// Interface para os produtos vindos do banco
interface ProductData {
    id: number;
    nome: string;
    valor: number;
    tamanhos: { id: number; nome: string; preco: number }[];
}

export default function NewOrderModal({ products, onSuccess }: { products: any[], onSuccess: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  
  // Estados do Produto sendo adicionado
  const [searchTerm, setSearchTerm] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  // Produto "pendente" (selecionado na busca, mas aguardando escolha de tamanho ou obs)
  const [pendingProduct, setPendingProduct] = useState<ProductData | null>(null);
  const [selectedSizeId, setSelectedSizeId] = useState<number | null>(null);
  const [currentPrice, setCurrentPrice] = useState<number>(0); // Preço atual (base ou do tamanho)
  const [itemObs, setItemObs] = useState(""); 

  // Refs
  const obsInputRef = useRef<HTMLInputElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Estado do Pedido
  const [tipoEntrega, setTipoEntrega] = useState("BALCAO");

  const filteredProducts = useMemo(() => {
    if (!searchTerm) return [];
    // Se já escolhemos um pendente e o nome bate, esconde a lista
    if (pendingProduct && searchTerm === pendingProduct.nome) return [];

    return products.filter(p => 
      p.nome.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [products, searchTerm, pendingProduct]);

  // 1. Ao clicar no produto da lista
  const handleSelectProduct = (product: ProductData) => {
      setSearchTerm(product.nome);
      setPendingProduct(product);
      setShowSuggestions(false);
      setSelectedSizeId(null); // Reseta tamanho anterior

      // Se tiver tamanhos, define preço 0 (obriga a escolher) e NÃO foca na obs ainda
      if (product.tamanhos && product.tamanhos.length > 0) {
          setCurrentPrice(0);
      } else {
          // Se não tiver tamanho, usa o preço base e foca na Obs
          setCurrentPrice(product.valor);
          setTimeout(() => obsInputRef.current?.focus(), 100);
      }
  };

  // 2. Ao clicar em um tamanho
  const handleSelectSize = (tamanho: { id: number, nome: string, preco: number }) => {
      setSelectedSizeId(tamanho.id);
      setCurrentPrice(tamanho.preco);
      // Foca na obs agora
      setTimeout(() => obsInputRef.current?.focus(), 100);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchTerm(e.target.value);
      setPendingProduct(null); // Limpa seleção anterior se mudar o texto
      setShowSuggestions(true);
  };

  // 3. Adicionar ao Carrinho
  const addToCart = () => {
    if (!pendingProduct) {
        toast.error("Selecione um produto.");
        return;
    }

    // Validação de Tamanho
    const temTamanhos = pendingProduct.tamanhos && pendingProduct.tamanhos.length > 0;
    if (temTamanhos && !selectedSizeId) {
        toast.error("Selecione o tamanho do produto.");
        return;
    }

    // Monta o nome (Ex: "Coca Cola" ou "Pizza Calabresa - G")
    let nomeFinal = pendingProduct.nome;
    if (temTamanhos && selectedSizeId) {
        const tamanhoNome = pendingProduct.tamanhos.find(t => t.id === selectedSizeId)?.nome;
        nomeFinal = `${pendingProduct.nome} - ${tamanhoNome}`;
    }

    // Verifica item idêntico no carrinho
    const existingIndex = cart.findIndex(
        item => item.id === pendingProduct.id && item.observacao === itemObs && item.nome === nomeFinal
    );
    
    if (existingIndex >= 0) {
      const newCart = [...cart];
      newCart[existingIndex].quantidade += 1;
      setCart(newCart);
    } else {
      setCart([...cart, { 
          id: pendingProduct.id, 
          nome: nomeFinal, 
          valor: currentPrice, 
          quantidade: 1,
          observacao: itemObs 
      }]);
    }

    // Reset total
    setItemObs("");
    setSearchTerm("");
    setPendingProduct(null);
    setSelectedSizeId(null);
    setCurrentPrice(0);
    setTimeout(() => {
        searchInputRef.current?.focus();
    }, 100);
  };

  const removeFromCart = (index: number) => {
    const newCart = [...cart];
    newCart.splice(index, 1);
    setCart(newCart);
  };

  const handleSave = async (formData: FormData) => {
    if (cart.length === 0) {
      toast.error("Adicione produtos ao pedido.");
      return;
    }
    
    const mesa = formData.get('mesa');
    if (tipoEntrega === 'MESA' && !mesa) {
        toast.error("Informe o número da mesa.");
        return;
    
    }

    const res = await createOrderAction(formData);

    if (res?.success) {
      toast.success(res.message);
      setIsOpen(false);
      setCart([]);
      setTipoEntrega("BALCAO");
      
      onSuccess(); // <--- CHAMA A ATUALIZAÇÃO AQUI
    } else {
      toast.error(res?.error || "Erro");
    }
  };

  const total = cart.reduce((acc, item) => acc + (item.valor * item.quantidade), 0);

  return (
    <>
      <button onClick={() => setIsOpen(true)} className="btn btn-primary">
        <i className="fa fa-plus"></i> Novo Pedido
      </button>

      {isOpen && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <div className="modal-header bg-gray-200">
              <h6 className="modal-title">PDV - Novo Pedido</h6>
              <button onClick={() => setIsOpen(false)} className="close" style={{border:'none', background:'transparent', fontSize:20}}>&times;</button>
            </div>

            <form action={handleSave}>
              <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto', minHeight: '450px' }}>
                
                {/* DADOS CLIENTE (MANTIDO IGUAL) */}
                <div className="row">
                  <div className="col-6 form-group">
                    <input name="nome" className="form-control" placeholder="Nome do Cliente" required />
                  </div>
                  <div className="col-6 form-group">
                    <input name="celular" className="form-control" placeholder="Celular (99) 99999-9999" />
                  </div>
                </div>
                <div className="row">
                  <div className="col-6 form-group">
                    <select 
                        name="tipo_entrega" 
                        className="form-control"
                        value={tipoEntrega}
                        onChange={(e) => setTipoEntrega(e.target.value)}
                    >
                      <option value="BALCAO">Balcão / Retirada</option>
                      <option value="DELIVERY">Delivery (+R$ 5,00)</option>
                      <option value="MESA">Mesa (Local)</option>
                    </select>
                  </div>
                  {tipoEntrega === 'MESA' && (
                      <div className="col-6 form-group">
                        <input name="mesa" className="form-control" placeholder="Nº Mesa" required autoFocus />
                      </div>
                  )}
                  <div className="col-6 form-group">
                    <select name="pagamento" className="form-control">
                      <option value="DINHEIRO">Dinheiro</option>
                      <option value="CARTAO">Cartão</option>
                      <option value="PIX">PIX</option>
                    </select>
                  </div>
                </div>

                <hr />

                {/* AREA DE ADICIONAR PRODUTOS */}
                <h6 className="tx-gray-800 tx-uppercase tx-bold tx-14 mg-b-10">Adicionar Itens</h6>
                
                <div className="bg-gray-100 pd-10 bd rounded" style={{position: 'relative'}}>
                    
                    {/* Campo de Busca */}
                    <div className="form-group mg-b-10">
                        <label className="tx-12 text-muted">Busque o produto:</label>
                        <input 
                            ref={searchInputRef}
                            type="text" 
                            className="form-control" 
                            placeholder="Digite o nome..."
                            value={searchTerm}
                            onChange={handleSearchChange}
                            onFocus={() => setShowSuggestions(true)}
                            autoComplete="off"
                        />

                        {/* LISTA FLUTUANTE */}
                        {showSuggestions && searchTerm && filteredProducts.length > 0 && (
                            <div style={styles.suggestionsBox}>
                                {filteredProducts.map(p => (
                                    <div 
                                        key={p.id} 
                                        style={styles.suggestionItem}
                                        onClick={() => handleSelectProduct(p)}
                                    >
                                        <span style={{fontWeight: 'bold'}}>{p.nome}</span>
                                        {/* Mostra "A partir de..." se tiver tamanhos, ou preço fixo */}
                                        {p.tamanhos && p.tamanhos.length > 0 ? (
                                            <span className="text-muted tx-12">Escolher tamanho &raquo;</span>
                                        ) : (
                                            <span className="text-success">R$ {p.valor.toFixed(2)}</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* SELEÇÃO DE TAMANHO (Só aparece se o produto tiver tamanhos) */}
                    {pendingProduct && pendingProduct.tamanhos && pendingProduct.tamanhos.length > 0 && (
                        <div className="mg-b-10 animate-fade-in">
                            <label className="tx-12 tx-bold text-primary">Selecione o Tamanho:</label>
                            <div className="d-flex flex-wrap">
                                {pendingProduct.tamanhos.map(t => (
                                    <button
                                        key={t.id}
                                        type="button"
                                        onClick={() => handleSelectSize(t)}
                                        className={`btn btn-sm mg-r-5 mg-b-5 ${selectedSizeId === t.id ? 'btn-primary' : 'btn-outline-secondary'}`}
                                    >
                                        {t.nome} <br/>
                                        <small>R$ {t.preco.toFixed(2)}</small>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Preço e Obs */}
                    <div className="d-flex align-items-end mg-t-10">
                        <div style={{flex: 1, marginRight: 5}}>
                            <label className="tx-12 text-muted mg-b-0">Observação:</label>
                            <input 
                                ref={obsInputRef}
                                className="form-control form-control-sm"
                                placeholder="Ex: Sem cebola"
                                value={itemObs}
                                onChange={(e) => setItemObs(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addToCart(); } }}
                            />
                        </div>
                        
                        <div style={{minWidth: '100px', textAlign: 'right', marginRight: 10}}>
                             <span className="tx-14 tx-bold text-success display-block">
                                R$ {currentPrice.toFixed(2)}
                             </span>
                        </div>

                        <button type="button" onClick={addToCart} className="btn btn-info btn-sm">
                            ADD
                        </button>
                    </div>
                </div>

                {/* LISTA CARRINHO */}
                <div className="table-responsive mg-t-15 border">
                  <table className="table table-sm table-striped mg-b-0">
                    <thead className="thead-light">
                      <tr>
                        <th>Qtd</th>
                        <th>Item</th>
                        <th>Total</th>
                        <th style={{width: 30}}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {cart.map((item, index) => (
                        <tr key={index}>
                          <td className="align-middle">{item.quantidade}x</td>
                          <td className="align-middle">
                              <div>{item.nome}</div>
                              {item.observacao && <small className="text-danger">Obs: {item.observacao}</small>}
                          </td>
                          <td className="align-middle">R$ {(item.valor * item.quantidade).toFixed(2)}</td>
                          <td className="align-middle">
                            <button type="button" onClick={() => removeFromCart(index)} className="btn btn-xs btn-danger">
                                <i className="fa fa-trash"></i>
                            </button>
                          </td>
                        </tr>
                      ))}
                      {cart.length === 0 && <tr><td colSpan={4} className="text-center text-muted pd-20">Carrinho vazio</td></tr>}
                    </tbody>
                  </table>
                </div>
                
                <h5 className="text-right mg-t-15 text-success">Total: R$ {total.toFixed(2)}</h5>
                <input type="hidden" name="cart_json" value={JSON.stringify(cart)} />

              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setIsOpen(false)} className="btn btn-secondary">Cancelar</button>
                <button type="submit" className="btn btn-primary">Concluir Pedido</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

const styles: any = {
  overlay: {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1050,
    display: 'flex', alignItems: 'center', justifyContent: 'center'
  },
  modal: {
    backgroundColor: '#fff', width: '100%', maxWidth: '600px',
    borderRadius: '5px', boxShadow: '0 5px 15px rgba(0,0,0,0.5)',
    display: 'flex', flexDirection: 'column'
  },
  suggestionsBox: {
      position: 'absolute',
      top: '70px', 
      left: 10, 
      right: 10,
      backgroundColor: '#fff',
      border: '1px solid #ddd',
      borderRadius: '4px',
      boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
      zIndex: 100,
      maxHeight: '200px',
      overflowY: 'auto',
      textAlign: 'left'
  },
  suggestionItem: {
      padding: '10px',
      borderBottom: '1px solid #eee',
      cursor: 'pointer',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
  }
};