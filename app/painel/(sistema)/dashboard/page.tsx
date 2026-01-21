import { cookies } from 'next/headers';
import { prisma } from '../../../../src/lib/prisma';
import Image from 'next/image';
import WhatsAppSender from '../../components/WhatsAppSender';
import { redirect } from 'next/navigation';

export default async function DashboardLojaPage() {
  // 1. Pega o ID da loja no cookie
  const cookieStore = cookies();
  const lojaId = cookieStore.get('painel_session')?.value;

  if (!lojaId) redirect('/painel/login');

  // 2. Busca dados da loja
  const loja = await prisma.config.findUnique({
    where: { id: parseInt(lojaId) }
  });

  if (!loja) return <div>Loja não encontrada.</div>;

  // 3. Busca o Logo
  const logoData = await prisma.logo.findFirst({ where: { idu: loja.id } });
  const logoUrl = logoData?.foto ? `/img/logomarca/${logoData.foto}` : '/img/logo-padrao.png';

  // URL Base (usada para gerar QR Code e Links)
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

  // Agora o link aponta para a estrutura correta: slug/mesa/id/cardapio
  // Definimos uma mesa padrão (ex: 01) para o link geral do dashboard, 
  // ou você pode tornar o número da mesa dinâmico se tiver essa informação.
  const mesaPadrao = "01";
  const linkCardapio = `${baseUrl}/${loja.url}/mesa/${mesaPadrao}/cardapio`;

  return (
    <>
      <div className="slim-pageheader">
        <ol className="breadcrumb slim-breadcrumb">
          <li className="breadcrumb-item"><a href="#">Home</a></li>
          <li className="breadcrumb-item active" aria-current="page">Dashboard</li>
        </ol>
        <h6 className="slim-pagetitle">Bem-vindo, {loja.nomeadmin}</h6>
      </div>

      {/* CARD 1: WHATSAPP */}
      <div className="row row-sm mg-t-20">
        <div className="col-lg-12">
          <div className="card card-info">
            <div className="card-body pd-40">
              <div className="row">
                <div className="col-md-3 text-center mb-4 mb-md-0">
                  <img src="/img/wp.png" width="150" className="img-thumbnail" alt="WhatsApp" />
                </div>
                <div className="col-md-9 text-justify">
                  <h3 className="tx-inverse mg-b-20" style={{ fontSize: '18px' }}>
                    <i className="fa fa-external-link mg-r-10" aria-hidden="true"></i>
                    ENVIAR LINK NO WHATSAPP
                  </h3>
                  <WhatsAppSender lojaNome={loja.nomeempresa} lojaUrl={loja.url} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CARD 2: QR CODE */}
      <div className="row row-sm mg-t-20">
        <div className="col-lg-12">
          <div className="card card-info">
            <div className="card-body pd-40">
              <div className="row">
                <div className="col-md-3 text-center mb-4 mb-md-0">
                  <a href={`https://api.qrserver.com/v1/create-qr-code/?data=${linkCardapio}&size=400x400`} target="_blank">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?data=${linkCardapio}&size=200x200`}
                      alt="QR Code"
                      className="img-thumbnail"
                    />
                  </a>
                </div>
                <div className="col-md-9 text-justify">
                  <h3 className="tx-inverse mg-b-20" style={{ fontSize: '18px' }}>
                    <i className="fa fa-qrcode mg-r-10" aria-hidden="true"></i>
                    SEU QRCODE PARA DELIVERY E RETIRADA
                  </h3>
                  <p className="mg-b-20">Este é o QR code para seus clientes acessarem o cardápio de delivery e retirada. Utilize-o em materiais, impressos ou onde você quiser!</p>
                  <span className="tx-12 text-muted">
                    <i className="fa fa-arrow-left mg-r-5"></i> Clique na imagem para baixar em maior resolução.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CARD 3: LINKS ÚTEIS */}
      <div className="row row-sm mg-t-20 mb-4">
        <div className="col-lg-12">
          <div className="card card-info">
            <div className="card-body pd-40">
              <div className="row">
                <div className="col-md-3 text-center mb-4 mb-md-0">
                  <img src={logoUrl} width="150" className="img-thumbnail rounded-circle" alt="Logo" style={{ height: '150px', objectFit: 'cover' }} />
                </div>
                <div className="col-md-9 text-justify">
                  <h3 className="tx-inverse mg-b-20" style={{ fontSize: '18px' }}>
                    <i className="fa fa-link mg-r-10" aria-hidden="true"></i>
                    URLs DE ACESSO AO SEU SISTEMA
                  </h3>

                  <p className="mg-b-10">Link do Cardápio:</p>
                  <h5 className="tx-danger mg-b-20">
                    <a href={linkCardapio} target="_blank" className="tx-danger hover-primary">
                      <i className="fa fa-link mg-r-5"></i> {linkCardapio}
                    </a>
                  </h5>
                  <p className="tx-13">Utilize a URL acima para que seus clientes possam acessar seu cardápio através do whatasapp ou suas redes sociais preferidas.</p>

                  <hr />

                  <div className="row">
                    <div className="col-md-6">
                      <span>URL do seu PDV: <br />
                        <span className="tx-info tx-bold">
                          <i className="fa fa-link"></i> {baseUrl}/painel/pdv
                        </span>
                      </span>
                    </div>
                    <div className="col-md-6">
                      <span>URL Tela Cozinha: <br />
                        <span className="tx-teal tx-bold">
                          <i className="fa fa-link"></i> {baseUrl}/painel/cozinha
                        </span>
                      </span>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}