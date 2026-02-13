import Header from "../components/website/Header";
import Footer from "../components/website/Footer";

export default function ServicesPage() {
  return (
    <>
      <Header />

      <section className="page-header bg-dark text-white py-5" style={{ marginTop: '80px', backgroundImage: 'linear-gradient(rgba(16, 42, 67, 0.9), rgba(16, 42, 67, 0.9)), url("/assets/img/6020105.jpg")', backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <div className="container py-lg-5 text-center">
            <h1 className="fw-bold display-4 hero-title mb-3" style={{ background: 'linear-gradient(45deg, #f5f5f5, #007bff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Nossos Serviços</h1>
            <p className="lead text-light">Soluções completas para transformar sua infraestrutura de TI com segurança e performance.</p>
        </div>
      </section>

      <section className="py-5 bg-light">
        <div className="container py-lg-5">
            <div className="row g-4">
                <div className="col-md-6 col-lg-4">
                    <div className="service-card h-100 shadow-sm border-0 bg-white rounded-3 overflow-hidden">
                        <div className="service-img" style={{backgroundImage: "url('/assets/img/services/outsourcingti.jpg')", height: '200px', backgroundSize: 'cover', backgroundPosition: 'center'}}></div>
                        <div className="service-content p-4">
                            <h4 className="fw-bold mb-3 text-dark">Outsourcing de TI</h4>
                            <p className="text-muted small">Suporte técnico especializado, monitoramento proativo e manutenção contínua do seu ambiente tecnológico.</p>
                            <a href="https://wa.me/5515996641070" target="_blank" className="btn btn-outline-primary btn-sm rounded-pill mt-2 px-3">Saber Mais</a>
                        </div>
                    </div>
                </div>

                <div className="col-md-6 col-lg-4">
                    <div className="service-card h-100 shadow-sm border-0 bg-white rounded-3 overflow-hidden">
                        <div className="service-img" style={{backgroundImage: "url('/assets/img/services/redes.jpg')", height: '200px', backgroundSize: 'cover', backgroundPosition: 'center'}}></div>
                        <div className="service-content p-4">
                            <h4 className="fw-bold mb-3 text-dark">Redes</h4>
                            <p className="text-muted small">Projeto, implementação e otimização de infraestrutura de redes para garantir máxima conectividade e estabilidade.</p>
                            <a href="https://wa.me/5515996641070" target="_blank" className="btn btn-outline-primary btn-sm rounded-pill mt-2 px-3">Saber Mais</a>
                        </div>
                    </div>
                </div>

                <div className="col-md-6 col-lg-4">
                    <div className="service-card h-100 shadow-sm border-0 bg-white rounded-3 overflow-hidden">
                        <div className="service-img" style={{backgroundImage: "url('/assets/img/services/security.jpg')", height: '200px', backgroundSize: 'cover', backgroundPosition: 'center'}}></div>
                        <div className="service-content p-4">
                            <h4 className="fw-bold mb-3 text-dark">Segurança da Informação</h4>
                            <p className="text-muted small">Proteção avançada contra ameaças digitais, auditorias de segurança e implementação de firewalls e políticas de backup.</p>
                            <a href="https://wa.me/5515996641070" target="_blank" className="btn btn-outline-primary btn-sm rounded-pill mt-2 px-3">Saber Mais</a>
                        </div>
                    </div>
                </div>

                <div className="col-md-6 col-lg-4">
                    <div className="service-card h-100 shadow-sm border-0 bg-white rounded-3 overflow-hidden">
                        <div className="service-img" style={{backgroundImage: "url('/assets/img/services/cloud.jpg')", height: '200px', backgroundSize: 'cover', backgroundPosition: 'center'}}></div>
                        <div className="service-content p-4">
                            <h4 className="fw-bold mb-3 text-dark">Cloud & Migração</h4>
                            <p className="text-muted small">Migração segura para a nuvem, gestão de servidores cloud e soluções de alta disponibilidade para seus sistemas.</p>
                            <a href="https://wa.me/5515996641070" target="_blank" className="btn btn-outline-primary btn-sm rounded-pill mt-2 px-3">Saber Mais</a>
                        </div>
                    </div>
                </div>

                <div className="col-md-6 col-lg-4">
                    <div className="service-card h-100 shadow-sm border-0 bg-white rounded-3 overflow-hidden">
                        <div className="service-img" style={{backgroundImage: "url('/assets/img/services/automacao.jpg')", height: '200px', backgroundSize: 'cover', backgroundPosition: 'center'}}></div>
                        <div className="service-content p-4">
                            <h4 className="fw-bold mb-3 text-dark">Automação Empresarial</h4>
                            <p className="text-muted small">Otimização de processos através de soluções inteligentes de hardware e software para aumentar a produtividade.</p>
                            <a href="https://wa.me/5515996641070" target="_blank" className="btn btn-outline-primary btn-sm rounded-pill mt-2 px-3">Saber Mais</a>
                        </div>
                    </div>
                </div>

                <div className="col-md-6 col-lg-4">
                    <div className="service-card h-100 shadow-sm border-0 bg-white rounded-3 overflow-hidden">
                        <div className="service-img" style={{backgroundImage: "url('/assets/img/services/omni.jpg')", height: '200px', backgroundSize: 'cover', backgroundPosition: 'center'}}></div>
                        <div className="service-content p-4">
                            <h4 className="fw-bold mb-3 text-dark">Omnichannel & VoIP</h4>
                            <p className="text-muted small">Integração de canais de comunicação e telefonia IP para um atendimento ao cliente unificado e eficiente.</p>
                            <a href="https://wa.me/5515996641070" target="_blank" className="btn btn-outline-primary btn-sm rounded-pill mt-2 px-3">Saber Mais</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <section className="py-5 bg-white" id="contato">
        <div className="container py-lg-5">
            <div className="row align-items-center">
                <div className="col-lg-5 mb-5 mb-lg-0">
                    <h2 className="fw-bold mb-4 text-dark">Pronto para otimizar sua infraestrutura de TI?</h2>
                    <p className="mb-4 text-muted">Nossa equipe de especialistas está pronta para diagnosticar suas necessidades e propor as melhores soluções tecnológicas.</p>
                    
                    <div className="d-flex align-items-center mb-4">
                        <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: '50px', height: '50px' }}>
                            <i className="fa-regular fa-envelope fa-lg"></i>
                        </div>
                        <div>
                            <h6 className="fw-bold mb-0 text-dark">Email</h6>
                            <a href="mailto:kteckti@gmail.com" className="text-decoration-none text-primary">kteckti@gmail.com</a>
                        </div>
                    </div>

                    <div className="d-flex align-items-center">
                        <div className="bg-success text-white rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: '50px', height: '50px' }}>
                            <i className="fa-brands fa-whatsapp fa-lg"></i>
                        </div>
                        <div>
                            <h6 className="fw-bold mb-0 text-dark">WhatsApp</h6>
                            <a href="https://wa.me/5515996641070" target="_blank" className="text-decoration-none text-success">(15) 99664-1070</a>
                        </div>
                    </div>
                </div>

                <div className="col-lg-6 offset-lg-1">
                    <div className="card border-0 shadow-lg p-4 rounded-4">
                        <div className="card-body">
                            <h3 className="fw-bold mb-4 text-dark">Fale Conosco</h3>
                            <form action="https://formspree.io/f/xdanglnw" id="contactForm" method="POST">
                                <div className="mb-3">
                                    <label className="form-label text-dark fw-semibold">Nome Completo</label>
                                    <input type="text" name="nome" className="form-control form-control-lg fs-6" placeholder="Seu nome" required />
                                </div>
                                <div className="row">
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label text-dark fw-semibold">Email</label>
                                        <input type="email" name="email" className="form-control form-control-lg fs-6" placeholder="seu@email.com" required />
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label text-dark fw-semibold">WhatsApp</label>
                                        <input type="tel" name="wpp" className="form-control form-control-lg fs-6" placeholder="(15) 00000-0000" required />
                                    </div>
                                </div>
                                <div className="mb-3">
                                    <label className="form-label text-dark fw-semibold">Serviço de Interesse</label>
                                    <select className="form-select form-select-lg fs-6" name="servico" required>
                                        <option value="">Escolha o serviço...</option>
                                        <option value="Outsourcing de TI">Outsourcing de TI</option>
                                        <option value="Redes e Cibersegurança">Redes e Cibersegurança</option>
                                        <option value="Backup em Nuvem">Backup em Nuvem</option>
                                        <option value="Consultoria ISP">Consultoria ISP</option>
                                        <option value="Telefonia VoIP">Telefonia VoIP</option>
                                        <option value="Omnichannel">Omnichannel</option>
                                    </select>
                                </div>
                                <div className="mb-3">
                                    <label className="form-label text-dark fw-semibold">Mensagem</label>
                                    <textarea className="form-control form-control-lg fs-6" rows={4} placeholder="Como podemos ajudar?" name="mensagem" required></textarea>
                                </div>
                                <div className="mb-4 form-check">
                                    <input type="checkbox" className="form-check-input" id="terms" required />
                                    <label className="form-check-label small text-muted" htmlFor="terms">Eu concordo com os Termos e Condições</label>
                                </div>
                                <button type="submit" className="btn btn-custom btn-lg w-100 fw-bold">Enviar Mensagem</button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <div className="modal fade" id="modalSucesso" tabIndex={-1} aria-labelledby="modalLabel" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg text-center p-4 rounded-4">
                <div className="modal-body">
                    <div className="mb-3 text-success">
                        <i className="fas fa-check-circle fa-4x"></i>
                    </div>
                    <h3 className="fw-bold text-success mb-3">Mensagem Enviada!</h3>
                    <p className="text-muted mb-4">Obrigado pelo contato. Nossa equipe de especialistas entrará em contato com você em breve.</p>
                    <button type="button" className="btn btn-custom px-5" data-bs-dismiss="modal">Fechar</button>
                </div>
            </div>
        </div>
    </div>

    <Footer />
    </>
  );
}
