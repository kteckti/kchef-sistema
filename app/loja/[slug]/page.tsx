import { prisma } from '../../../src/lib/prisma';
import { notFound } from 'next/navigation';
import Image from 'next/image';

// Função para gerar os Metadados (Título da página, descrição pro WhatsApp, etc)
export async function generateMetadata({ params }: { params: { slug: string } }) {
  const loja = await prisma.config.findFirst({
    where: { url: params.slug } // Procura pelo campo 'url' do banco antigo
  });

  if (!loja) return { title: 'Loja não encontrada' };

  return {
    title: `Cardápio Digital - ${loja.nomeempresa}`,
    description: 'Faça seu pedido online!',
  };
}

export default async function LojaPage({ params }: { params: { slug: string } }) {
  // 1. Busca a loja baseada no nome que está na URL (slug)
  const loja = await prisma.config.findFirst({
    where: { 
      url: params.slug // O campo 'url' no seu banco deve ser 'juarex', etc.
    }
  });

  // Se não achar a loja, mostra página 404
  if (!loja) {
    notFound(); 
  }

  // 2. Busca dados visuais (Logo e Fundo)
  const logo = await prisma.logo.findFirst({ where: { idu: loja.id } });
  const fundo = await prisma.fundoTopo.findFirst({ where: { idu: loja.id } });

  const logoUrl = logo?.foto ? `/img/logomarca/${logo.foto}` : '/img/logo-padrao.png';
  const fundoUrl = fundo?.foto ? `/img/fundo_banner/${fundo.foto}` : '';

  return (
    <div className="slim-body" style={{ backgroundColor: loja.corfundo || '#f5f5f5', minHeight: '100vh' }}>
      
      {/* HEADER DA LOJA */}
      <div 
        className="slim-navbar" 
        style={{
          height: '300px', 
          backgroundImage: fundoUrl ? `url(${fundoUrl})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          display: 'flex',
          alignItems: 'center',
          position: 'relative'
        }}
      >
        {/* Overlay escuro para melhorar leitura se tiver imagem */}
        <div style={{position: 'absolute', top: 0, left:0, right:0, bottom:0, background: 'rgba(0,0,0,0.4)'}}></div>

        <div className="container" style={{position: 'relative', zIndex: 2}}>
          <div className="row align-items-center">
            
            {/* Logo */}
            <div className="col-md-4 text-center">
              <img 
                src={logoUrl} 
                alt={loja.nomeempresa} 
                style={{
                    width: '150px', 
                    height: '150px', 
                    borderRadius: '50%', 
                    border: '4px solid #fff',
                    objectFit: 'cover'
                }}
              />
            </div>

            {/* Dados da Loja */}
            <div className="col-md-8 text-white text-center text-md-left mt-3 mt-md-0">
              <h1 style={{ fontWeight: 'bold', textShadow: '2px 2px 4px #000' }}>
                {loja.nomeempresa}
              </h1>
              <p style={{ textShadow: '1px 1px 2px #000' }}>
                <i className="icon ion-ios-location"></i> {loja.cidade} - {loja.uf}
              </p>
              
              {loja.funcionamento === 1 ? (
                 <span className="badge badge-success" style={{fontSize: '14px', padding: '10px 20px'}}>ABERTO</span>
              ) : (
                 <span className="badge badge-danger" style={{fontSize: '14px', padding: '10px 20px'}}>FECHADO</span>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* ÁREA DE PRODUTOS (Placeholder) */}
      <div className="container mg-t-40">
        <div className="section-wrapper">
          <label className="section-title">Cardápio</label>
          <p className="mg-b-20 text-muted">Selecione uma categoria abaixo:</p>
          
          <div className="alert alert-info">
             Aqui entrarão as categorias e produtos da loja <strong>{loja.nomeempresa}</strong>.
          </div>
        </div>
      </div>

    </div>
  );
}