import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-white py-5 border-top">
        <div className="container">
            <div className="row gy-4">
                <div className="col-lg-4">
                    <img src="/assets/img/logo2.jpeg" className="mb-3" alt="Kteck Logo" style={{ maxHeight: '60px' }} />
                    <p className="text-muted small">A Kteck é especializada em consultoria e soluções de infraestrutura de redes, segurança e automação para empresas.</p>
                    <a href="https://wa.me/5515996641070?text=Ol%C3%A1%20Kteck!%20Desejo%20saber%20mais%20sobre%20os%20servi%C3%A7os" className="btn btn-custom btn-sm" target="_blank">Fale Conosco</a>
                </div>
                <div className="col-lg-2">
                    <h5 className="fw-bold mb-3">Links Rápidos</h5>
                    <ul className="list-unstyled">
                        <li className="mb-2"><Link href="/#home" className="text-muted small text-decoration-none">Home</Link></li>
                        <li className="mb-2"><Link href="/#sobre" className="text-muted small text-decoration-none">Sobre Nós</Link></li>
                        <li className="mb-2"><Link href="/servicos" className="text-muted small text-decoration-none">Serviços</Link></li>
                    </ul>
                </div>
                <div className="col-lg-3">
                    <h5 className="fw-bold mb-3">Contato</h5>
                    <ul className="list-unstyled text-muted small">
                        <li className="mb-2"><strong>Matriz - Sorocaba:</strong><br/> (15) 99664-1070</li>
                        <li className="mb-2"><strong>E-mail:</strong><br/> kteckti@gmail.com</li>
                    </ul>
                    <div className="social-icons mt-3">
                        <a href="#" className="me-2"><i className="fab fa-instagram"></i></a>
                        <a href="https://wa.me/5515996641070?text=Ol%C3%A1%20Kteck!%20Desejo%20saber%20mais%20sobre%20os%20servi%C3%A7os" target="_blank" className="me-2"><i className="fab fa-whatsapp"></i></a>
                        <a href="#"><i className="fab fa-facebook-f"></i></a>
                    </div>
                </div>
                <div className="col-lg-3 text-center text-lg-end">
                    <p className="small text-muted mb-0">Desenvolvido por:<br/><span className="fw-bold">Kayky Marinho - Kteck</span></p>
                </div>
            </div>
            <div className="row mt-5 pt-3 border-top">
                <div className="col text-center">
                    <p className="small text-muted mb-0">&copy; {new Date().getFullYear()} Kteck Solutions. Todos os direitos reservados.</p>
                </div>
            </div>
        </div>
    </footer>
  );
}
