import Header from "../components/website/Header";
import Footer from "../components/website/Footer";

export default function ServicesPage() {
  return (
    <>
      <Header />

      <section className="page-header" style={{ marginTop: '100px' }}>
        <div className="container">
            <h1 className="fw-bold display-4">Nossos Serviços</h1>
            <p className="lead">Soluções completas para transformar sua infraestrutura de TI</p>
        </div>
      </section>

      <section className="py-5">
        <div className="container">
            <div className="row g-4">
                {/* Exemplo de card de serviço - Repita para todos os seus serviços */}
                <div className="col-md-6 col-lg-4">
                    <div className="service-card h-100 shadow-sm border-0">
                        <div className="service-img" style={{backgroundImage: "url('/assets/img/services/outsourcingti.jpg')"}}></div>
                        <div className="service-content p-4">
                            <h4 className="fw-bold mb-3">Outsourcing de TI</h4>
                            <p className="text-muted">Atuamos no suporte, monitoramento e manutenção dos ambientes de TI.</p>
                            <a href="https://wa.me/5515996641070" target="_blank" className="btn btn-outline-primary btn-sm rounded-pill mt-2">Saber Mais</a>
                        </div>
                    </div>
                </div>

                <div className="col-md-6 col-lg-4">
                    <div className="service-card h-100 shadow-sm border-0">
                        <div className="service-img" style={{backgroundImage: "url('/assets/img/services/redes.jpg')"}}></div>
                        <div className="service-content p-4">
                            <h4 className="fw-bold mb-3">Redes</h4>
                            <p className="text-muted">Desenvolvemos soluções em infraestrutura de redes para garantir conectividade estável.</p>
                            <a href="https://wa.me/5515996641070" target="_blank" className="btn btn-outline-primary btn-sm rounded-pill mt-2">Saber Mais</a>
                        </div>
                    </div>
                </div>

                <div className="col-md-6 col-lg-4">
                    <div className="service-card h-100 shadow-sm border-0">
                        <div className="service-img" style={{backgroundImage: "url('/assets/img/services/security.jpg')"}}></div>
                        <div className="service-content p-4">
                            <h4 className="fw-bold mb-3">Segurança da Informação</h4>
                            <p className="text-muted">Atuamos na prevenção, detecção e resposta a ameaças.</p>
                            <a href="https://wa.me/5515996641070" target="_blank" className="btn btn-outline-primary btn-sm rounded-pill mt-2">Saber Mais</a>
                        </div>
                    </div>
                </div>
                {/* Adicione os outros cards aqui seguindo o modelo... */}
            </div>
        </div>
    </section>

    <section className="py-5" id="contato">
        <div className="container">
            <div className="row align-items-center">
                <div className="col-lg-5 mb-5 mb-lg-0">
                    <h2 className="fw-bold mb-4">Pronto para otimizar sua infraestrutura de TI?</h2>
                    <p className="mb-4">Entre em contato com a nossa equipe e descubra como podemos ajudar.</p>
                    
                    <div className="d-flex align-items-center mb-3">
                        <i className="fa-regular fa-envelope fa-2x feature-icon me-3"></i>
                        <div>
                            <h6 className="fw-bold mb-0">Email</h6>
                            <a href="mailto:kteckti@gmail.com" className="text-decoration-none contact-link">kteckti@gmail.com</a>
                        </div>
                    </div>
                </div>

                <div className="col-lg-6 offset-lg-1">
                    <div className="card border-0 shadow-lg p-4">
                        <div className="card-body">
                            <h3 className="fw-bold mb-4">Fale Conosco</h3>
                            {/* FORMULÁRIO */}
                            <form action="https://formspree.io/f/xdanglnw" id="contactForm" method="POST">
                                <div className="mb-3">
                                    <label className="form-label">Nome Completo</label>
                                    <input type="text" name="nome" className="form-control" placeholder="Seu nome" />
                                </div>
                                <div className="row">
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Email</label>
                                        <input type="email" name="email" className="form-control" placeholder="seu@email.com" />
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">WhatsApp</label>
                                        <input type="tel" name="wpp" className="form-control" placeholder="(00) 00000-0000" />
                                    </div>
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Serviço de Interesse</label>
                                    <select className="form-select" name="servico">
                                        <option>Escolha o serviço...</option>
                                        <option value="1">Outsourcing de TI</option>
                                        <option value="2">Redes e Cibersegurança</option>
                                        <option value="3">Backup em Nuvem</option>
                                        <option value="4">Consultoria ISP</option>
                                        <option value="5">Telefonia VoIP</option>
                                        <option value="6">Omnichannel</option>
                                    </select>
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Mensagem</label>
                                    <textarea className="form-control" rows={4} placeholder="Como podemos ajudar?" name="mensagem"></textarea>
                                </div>
                                <div className="mb-3 form-check">
                                    <input type="checkbox" className="form-check-input" id="terms" />
                                    <label className="form-check-label small" htmlFor="terms">Eu concordo com os Termos e Condições</label>
                                </div>
                                <button type="submit" className="btn btn-custom w-100">Enviar Mensagem</button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    {/* Modal de Sucesso (Precisa existir para o script.js funcionar) */}
    <div className="modal fade" id="modalSucesso" tabIndex={-1} aria-labelledby="modalLabel" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content text-center p-4">
                <div className="modal-body">
                    <div className="mb-3 text-success">
                        <i className="fas fa-check-circle fa-4x"></i>
                    </div>
                    <h3 className="fw-bold text-success mb-3">Mensagem Enviada!</h3>
                    <p className="text-muted mb-4">Obrigado pelo contato. Nossa equipe responderá em breve.</p>
                    <button type="button" className="btn btn-custom px-4" data-bs-dismiss="modal">Fechar</button>
                </div>
            </div>
        </div>
    </div>

    <Footer />
    </>
  );
}