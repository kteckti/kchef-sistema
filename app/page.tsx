'use client' // <--- Obrigatório para o Swiper funcionar

import Header from "./components/website/Header";
import Footer from "./components/website/Footer";
import Link from "next/link";

// Importações do Swiper React
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay } from 'swiper/modules';

// Importações dos Estilos do Swiper (Obrigatório)
import 'swiper/css';
import 'swiper/css/pagination';

export default function HomePage() {
  return (
    <>
      <Header />
      
      <main>
        {/* HERO SECTION */}
        <section className="hero-section text-center" id="home">
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-lg-10">
                        <h1 className="hero-title">Especialistas em Redes, Segurança e Automação para Empresas.</h1>
                        <p className="lead mb-4" style={{color: '#f5f5f5'}}>Há mais de 8 anos ajudamos empresas e provedores a construírem infraestruturas de TI seguras, escaláveis e de alta performance.</p>
                        <a href="https://wa.me/5515996641070?text=Ol%C3%A1%20Kteck!%20Desejo%20saber%20mais%20sobre%20os%20servi%C3%A7os" className="btn btn-custom" target="_blank">Fale com um Especialista</a>
                    </div>
                </div>
            </div>
        </section>

        {/* SOBRE NÓS */}
        <section className="py-5" id="sobre">
            <div className="container">
                <div className="row align-items-center">
                    <div className="col-lg-6 mb-4 mb-lg-0">
                        <h2 className="fw-bold mb-3">Consultoria em Redes e Segurança da Informação</h2>
                        <p className="text-muted">A Kteck Solutions é uma empresa especializada em consultoria de TI, redes e cibersegurança. Atuamos de forma estratégica ao lado de empresas de todos os ramos, oferecendo soluções modernas, seguras e alinhadas às melhores práticas do mercado, com foco em performance, confiabilidade e proteção da informação.</p>
                        <a href="#" className="btn btn-custom mt-3">Mais sobre nós</a>
                    </div>
                    <div className="col-lg-6">
                        <img src="/assets/img/rm407-124.jpg" className="img-fluid rounded shadow" alt="Sobre Kteck" />
                    </div>
                </div>
            </div>
        </section>

        {/* BENEFÍCIOS */}
        <section className="py-5 bg-light" id="beneficios">
            <div className="container">
                <div className="text-center mb-5">
                    <p className="text-uppercase text-primary fw-bold">Benefícios</p>
                    <h2 className="fw-bold">Por que escolher a Kteck Solutions?</h2>
                </div>
                <div className="row g-4">
                    <div className="col-md-6 col-lg-3">
                        <div className="feature-box text-center">
                            <div className="feature-icon"><i className="fa-solid fa-headset"></i></div>
                            <h4>Suporte 24/7</h4>
                            <p className="small text-muted">Nossa equipe está sempre preparada para atender sua empresa com agilidade e eficiência, sempre que você precisar.</p>
                        </div>
                    </div>
                    <div className="col-md-6 col-lg-3">
                        <div className="feature-box text-center">
                            <div className="feature-icon"><i className="fa-solid fa-user-tie"></i></div>
                            <h4>Consultoria Especializada</h4>
                            <p className="small text-muted">Oferecemos consultoria de TI especializada, auxiliando sua empresa no planejamento, implementação e otimização de soluções tecnológicas.</p>
                        </div>
                    </div>
                    <div className="col-md-6 col-lg-3">
                        <div className="feature-box text-center">
                            <div className="feature-icon"><i className="fa-solid fa-chart-line"></i></div>
                            <h4>Escalabilidade</h4>
                            <p className="small text-muted">Oferecemos soluções de escalabilidade em TI para preparar sua empresa para crescer com segurança e eficiência.</p>
                        </div>
                    </div>
                    <div className="col-md-6 col-lg-3">
                        <div className="feature-box text-center">
                            <div className="feature-icon"><i className="fa-solid fa-shield-halved"></i></div>
                            <h4>Segurança Avançada</h4>
                            <p className="small text-muted">Oferecemos soluções completas em segurança da informação para proteger os dados e sistemas da sua empresa.</p>
                        </div>
                    </div>
                </div>
                <div className="text-center mt-5">
                    <a href="https://wa.me/5515996641070?text=Ol%C3%A1%20Kteck!%20Desejo%20saber%20mais%20sobre%20os%20servi%C3%A7os" className="btn btn-custom" target="_blank">Fale com um Especialista</a>
                </div>
            </div>
        </section>

        {/* ESTATÍSTICAS */}
        <section className="dark-section text-center">
            <div className="container">
                <h2 className="mb-5">Por que a Kteck é a parceira ideal?</h2>
                <div className="row">
                    <div className="col-md-3">
                        <div className="stat-number">+5</div>
                        <p>Anos de experiência</p>
                    </div>
                    <div className="col-md-3">
                        <div className="stat-number">+10</div>
                        <p>Projetos de redes</p>
                    </div>
                    <div className="col-md-3">
                        <div className="stat-number">+10</div>
                        <p>Fornecedores Parceiros</p>
                    </div>
                    <div className="col-md-3">
                        <div className="stat-number">+100</div>
                        <p>Empresas satisfeitas</p>
                    </div>
                </div>
            </div>
        </section>

        {/* CARROSSEL DE SERVIÇOS (CORRIGIDO COM SWIPER REACT) */}
        <section className="py-5" id="servicos">
            <div className="container">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h2 className="fw-bold">Nossos Serviços</h2>
                    <Link href="/servicos" className="btn btn-outline-light rounded-pill" style={{color: '#333', borderColor: '#333'}}>
                        Ver todos
                    </Link>
                </div>

                {/* Componente Swiper React */}
                <Swiper
                    modules={[Pagination, Autoplay]}
                    spaceBetween={30}
                    slidesPerView={1}
                    pagination={{ clickable: true }}
                    autoplay={{ delay: 3000, disableOnInteraction: false }}
                    breakpoints={{
                        640: {
                            slidesPerView: 1,
                        },
                        768: {
                            slidesPerView: 2,
                        },
                        1024: {
                            slidesPerView: 3,
                        },
                    }}
                    className="servicesSwiper pb-5" // pb-5 para dar espaço aos pontinhos (pagination)
                >
                    <SwiperSlide>
                        <div className="service-card">
                            <div className="service-img" style={{backgroundImage: "url('/assets/img/services/redes.jpg')"}}></div>
                            <div className="service-content">
                                <h5>Redes</h5>
                                <p className="small text-muted">Desenvolvemos soluções em infraestrutura de redes para garantir conectividade estável, segura e de alto desempenho.</p>
                                <a href="https://wa.me/5515996641070" target="_blank" className="btn btn-outline-primary btn-sm rounded-pill mt-2">Saber Mais</a>
                            </div>
                        </div>
                    </SwiperSlide>

                    <SwiperSlide>
                        <div className="service-card">
                            <div className="service-img" style={{backgroundImage: "url('/assets/img/services/outsourcingti.jpg')"}}></div>
                            <div className="service-content">
                                <h5>Outsourcing de TI</h5>
                                <p className="small text-muted">Atuamos no suporte, monitoramento e manutenção dos ambientes de TI.</p>
                                <a href="https://wa.me/5515996641070" target="_blank" className="btn btn-outline-primary btn-sm rounded-pill mt-2">Saber Mais</a>
                            </div>
                        </div>
                    </SwiperSlide>

                    <SwiperSlide>
                        <div className="service-card">
                            <div className="service-img" style={{backgroundImage: "url('/assets/img/services/security.jpg')"}}></div>
                            <div className="service-content">
                                <h5>Segurança da Informação</h5>
                                <p className="small text-muted">Atuamos na prevenção, detecção e resposta a ameaças.</p>
                                <a href="https://wa.me/5515996641070" target="_blank" className="btn btn-outline-primary btn-sm rounded-pill mt-2">Saber Mais</a>
                            </div>
                        </div>
                    </SwiperSlide>
                </Swiper>

            </div>
        </section>
      </main>
      
      <Footer />
    </>
  );
}