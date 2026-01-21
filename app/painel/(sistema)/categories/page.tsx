import { prisma } from '../../../../src/lib/prisma';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import Image from 'next/image';

// --- Server Actions ---
async function createCategory(formData: FormData) {
  'use server'
  const cookieStore = cookies();
  const lojaId = cookieStore.get('painel_session')?.value;
  if (!lojaId) return;

  const nome = formData.get('nome') as string;
  const posicao = formData.get('posicao') as string;
  
  // TODO: Implementar Upload de Imagem real depois.
  // Por enquanto, salvamos 'off.jpg' se não tiver upload.
  const foto = 'off.jpg'; 

  await prisma.categoria.create({
    data: {
      idu: parseInt(lojaId),
      nome: nome,
      posicao: parseInt(posicao) || 0,
      url: foto // Campo 'url' no banco guarda o nome do arquivo
    }
  });
  revalidatePath('/painel/categories');
}

async function deleteCategory(formData: FormData) {
  'use server'
  const id = formData.get('id') as string;
  // No futuro: Verificar se tem produtos antes de deletar
  await prisma.categoria.delete({ where: { id: parseInt(id) } });
  revalidatePath('/painel/categories');
}
// ----------------------

export default async function CategoriesPage() {
  const cookieStore = cookies();
  const lojaId = cookieStore.get('painel_session')?.value;
  
  if (!lojaId) redirect('/painel/login');

  const categorias = await prisma.categoria.findMany({
    where: { idu: parseInt(lojaId) },
    orderBy: { posicao: 'asc' }
  });

  return (
    <>
      <div className="slim-pageheader">
        <ol className="breadcrumb slim-breadcrumb">
          <li className="breadcrumb-item"><a href="/painel/dashboard">Home</a></li>
          <li className="breadcrumb-item active" aria-current="page">Categorias</li>
        </ol>
        <h6 className="slim-pagetitle">Cadastrar Categoria</h6>
      </div>

      <div className="section-wrapper mg-b-20">
        <label className="section-title"><i className="fa fa-check-square-o"></i> Nova Categoria</label>
        <hr />
        
        <form action={createCategory}>
          <div className="row">
            <div className="col-lg-4">
              <div className="form-group">
                <label className="form-control-label">Nome: <span className="tx-danger">*</span></label>
                <input type="text" className="form-control" name="nome" required placeholder="Ex: Lanches" />
              </div>
            </div>
            <div className="col-lg-2">
              <div className="form-group">
                <label className="form-control-label">Posição: <span className="tx-danger">*</span></label>
                <input type="number" className="form-control" name="posicao" defaultValue="1" required />
              </div>
            </div>
             <div className="col-lg-6">
              <div className="form-group">
                <label className="form-control-label">Imagem (Em breve):</label>
                <input type="file" className="form-control" disabled title="Upload será implementado na próxima etapa" />
              </div>
            </div>
          </div>
          <div className="form-layout-footer" style={{textAlign: 'center'}}>
            <button className="btn btn-primary bd-0">Salvar <i className="fa fa-arrow-right"></i></button>
          </div>
        </form>
        
        <div className="alert alert-danger mg-t-20">
           <i className="fa fa-exclamation-triangle"></i> ATENÇÃO - Ao excluir uma categoria, todos os produtos relacionados a ela podem ficar órfãos.
        </div>
      </div>

      <div className="section-wrapper">
        <label className="section-title"><i className="fa fa-list"></i> Lista de Categorias</label>
        <hr />
        <div className="table-responsive">
          <table className="table mg-b-0">
            <thead>
              <tr>
                <th>IMG</th>
                <th>Nome</th>
                <th>Posição</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {categorias.map((cat) => (
                <tr key={cat.id}>
                  <td>
                    {/* Imagem Placeholder por enquanto */}
                    <div style={{width: 40, height: 40, background: '#eee', borderRadius: 4, display:'flex', alignItems:'center', justifyContent:'center'}}>
                      <i className="fa fa-image text-muted"></i>
                    </div>
                  </td>
                  <td>{cat.nome}</td>
                  <td>{cat.posicao}</td>
                  <td>
                    <form action={deleteCategory}>
                      <input type="hidden" name="id" value={cat.id} />
                      <button className="btn btn-danger btn-sm"><i className="fa fa-times"></i></button>
                    </form>
                  </td>
                </tr>
              ))}
              {categorias.length === 0 && (
                 <tr><td colSpan={4} className="text-center">Nenhuma categoria cadastrada.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}