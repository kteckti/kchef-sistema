'use client'

import { useRef, useState } from 'react';
import { createProductAction, updateProductAction } from './actions';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import CurrencyInput from 'react-currency-input-field';

interface ProductFormProps {
  categories: any[];
  initialData?: any;
}

export default function ProductForm({ categories, initialData }: ProductFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();
  const isEditing = !!initialData;

  // Estado para o Preview da Imagem
  const [preview, setPreview] = useState<string | null>(
    initialData?.foto ? `/img/fotos_produtos/${initialData.foto}` : null
  );

  // Manipula a seleção de arquivo para mostrar preview
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);
    }
  };

  const handleSubmit = async (formData: FormData) => {
    // --- TRATAMENTO DO VALOR (MOEDA) ---
    // O CurrencyInput envia "R$ 25,00". O banco precisa de "25.00".
    const valorBruto = formData.get('valor') as string;
    if (valorBruto) {
      // Remove "R$ ", remove pontos de milhar, troca vírgula por ponto
      const valorLimpo = valorBruto
        .replace('R$', '')
        .replace(/\./g, '') // Remove pontos de milhar (1.000)
        .replace(',', '.')  // Troca vírgula decimal por ponto
        .trim();

      formData.set('valor', valorLimpo);
    }

    let result;

    if (isEditing) {
      result = await updateProductAction(formData);
    } else {
      result = await createProductAction(formData);
    }

    if (result?.error) {
      toast.error(result.error);
    } else if (result?.success || !result?.error) {
      // !result?.error é um fallback caso a action não retorne objeto explícito de success
      toast.success(isEditing ? 'Produto atualizado!' : 'Produto cadastrado!');

      if (isEditing) {
        router.push('/painel/products');
        router.refresh();
      } else {
        formRef.current?.reset();
        setPreview(null); // Limpa o preview

        // Limpa o campo de moeda visualmente
        const currencyField = document.getElementsByName('valor')[0] as HTMLInputElement;
        if (currencyField) currencyField.value = '';
      }
    }
  };

  return (
    <div className="section-wrapper mg-b-20">
      <label className="section-title">
        <i className="fa fa-check-square-o"></i> {isEditing ? 'EDITAR PRODUTO' : 'CADASTRO DE PRODUTOS'}
      </label>
      <hr />

      <form ref={formRef} action={handleSubmit}>
        {isEditing && <input type="hidden" name="id" value={initialData.id} />}

        <div className="form-layout">
          <div className="row mg-b-25">

            {/* NOME */}
            <div className="col-lg-4">
              <div className="form-group">
                <label className="form-control-label">Nome: <span className="tx-danger">*</span></label>
                <input
                  type="text"
                  className="form-control"
                  name="nome"
                  required
                  defaultValue={initialData?.nome || ''}
                />
              </div>
            </div>

            {/* INGREDIENTES */}
            <div className="col-lg-8">
              <div className="form-group">
                <label className="form-control-label">Ingredientes / Descrição:</label>
                <input
                  type="text"
                  className="form-control"
                  name="ingredientes"
                  placeholder="Ex: Pão, carne, queijo..."
                  defaultValue={initialData?.ingredientes === "N" ? "" : initialData?.ingredientes || ''}
                />
              </div>
            </div>
          </div>

          <div className="row mg-b-25">

            {/* CATEGORIA */}
            <div className="col-lg-3">
              <div className="form-group">
                <label className="form-control-label">Categoria: <span className="tx-danger">*</span></label>
                <select
                  className="form-control"
                  name="categoria"
                  required
                  defaultValue={initialData?.categoriaId || ""}
                >
                  <option value="" disabled>Selecione...</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.nome}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* VALOR COM MÁSCARA */}
            <div className="col-lg-2">
              <div className="form-group">
                <label className="form-control-label">Valor: <span className="tx-danger">*</span></label>
                <CurrencyInput
                  id="valor-input"
                  name="valor"
                  className="form-control"
                  placeholder="R$ 0,00"
                  defaultValue={initialData?.valor}
                  decimalsLimit={2}
                  decimalScale={2}
                  decimalSeparator=","
                  groupSeparator="."
                  prefix="R$ "
                  allowNegativeValue={false}
                  intlConfig={{ locale: 'pt-BR', currency: 'BRL' }}
                  required
                />
              </div>
            </div>

            {/* UPLOAD DE IMAGEM */}
            <div className="col-lg-3">
              <div className="form-group">
                <label className="form-control-label">Imagem: </label>

                {/* Removemos a estrutura 'custom-file' que estava invisível */}
                <input
                  type="file"
                  name="foto"
                  className="form-control"
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{
                    padding: '3px',   // Ajuste para não ficar colado
                    height: 'auto',   // Garante que a altura se ajuste
                    cursor: 'pointer'
                  }}
                />

                <small className="text-muted" style={{ fontSize: '11px' }}>
                  Formatos: JPG, PNG, WEBP
                </small>
              </div>
            </div>

            {/* PREVIEW DA IMAGEM */}
            <div className="col-lg-4">
              {preview ? (
                <div style={{ padding: '5px', border: '1px solid #ddd', borderRadius: '4px', display: 'inline-block', marginTop: '30px' }}>
                  <img
                    src={preview}
                    alt="Preview"
                    style={{ height: '80px', objectFit: 'cover', borderRadius: '4px' }}
                  />
                </div>
              ) : (
                <div style={{ marginTop: '30px', color: '#ccc', fontStyle: 'italic' }}>
                  Sem imagem selecionada
                </div>
              )}
            </div>
          </div>

          {/* DIAS DISPONÍVEIS (Visibilidade) */}
          <div className="row mg-b-25">
            <div className="col-lg-12">
              <label className="form-control-label mg-b-10">Dias Disponíveis no Cardápio:</label>
              <div className="row">
                {['1', '2', '3', '4', '5', '6', '0'].map((dia, idx) => {
                  const labels = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
                  // Lógica para marcar os checkboxes na edição
                  const isChecked = initialData?.visivel && (initialData.visivel === 'G' || initialData.visivel.split(',').includes(dia));

                  return (
                    <div key={dia} className="col-auto">
                      <label className="ckbox">
                        <input
                          type="checkbox"
                          name="visivel"
                          value={dia}
                          defaultChecked={!!isChecked}
                        />
                        <span>{labels[idx]}</span>
                      </label>
                    </div>
                  )
                })}
              </div>
              <small className="text-muted">Se nenhum for selecionado ou todos forem marcados, o produto aparecerá todos os dias.</small>
            </div>
          </div>

          <div className="form-layout-footer" style={{ textAlign: 'center' }}>
            <button type="submit" className="btn btn-primary bd-0">
              {isEditing ? 'Atualizar Dados' : 'Salvar'} <i className="fa fa-arrow-right"></i>
            </button>

            {isEditing && (
              <button
                type="button"
                className="btn btn-secondary bd-0 mg-l-10"
                onClick={() => router.push('/painel/products')}
              >
                Cancelar
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}