import Link from "next/link";

export default function Footer() {
  return (
    <footer>
        <div className="container">
            <div className="row gy-4">
                <div className="col-lg-4">
                    <img src="/assets/img/logo2.jpeg" className="mb-3" alt="Logo" />
                    <p className="text-muted small">A Kteck é especializada em consultoria e soluções de infraestrutura de redes.</p>
                    <a href="https://wa.me/5515996641070?text=Ol%C3%A1%20Kteck!%20Desejo%20saber%20mais%20sobre%20os%20servi%C3%A7os" className="btn btn-custom btn-sm" target="_blank">Fale Conosco</a>
                </div>
                <div className="col-lg-2">
                    <h5 className="fw-bold mb-3">Links Rápidos</h5>
                    <ul className="list-unstyled">
                        <li><Link href="/#home" className="text-muted small">Home</Link></li>
                        <li><Link href="/#sobre" className="text-muted small">Sobre Nós</Link></li>
                        <li><Link href="/servicos" className="text-muted small">Serviços</Link></li>
                    </ul>
                </div>
                <div className="col-lg-3">
                    <h5 className="fw-bold mb-3">Contato</h5>
                    <ul className="list-unstyled text-muted small">
                        <li className="mb-2"><strong>Matriz - Sorocaba:</strong> (15) 99664-1070</li>
                        <li>kteckti@gmail.com</li>
                    </ul>
                    <div className="social-icons mt-3">
                        <a href="#"><i className="fab fa-instagram"></i></a>
                        <a href="https://wa.me/5515996641070?text=Ol%C3%A1%20Kteck!%20Desejo%20saber%20mais%20sobre%20os%20servi%C3%A7os" target="_blank"><i className="fab fa-whatsapp"></i></a>
                        <a href="#"><i className="fab fa-facebook-f"></i></a>
                    </div>
                </div>
                <div className="col-lg-3 text-center text-lg-end">
                    <p className="small text-muted mb-0">Desenvolvido por:<br/>Kayky Marinho - Kteck</p>
                </div>
            </div>
            <div className="row mt-5 pt-3 border-top">
                <div className="col text-center">
                    <p className="small text-muted mb-0">&copy; 2026 Kteck Solutions. Todos os direitos reservados.</p>
                </div>
            </div>
        </div>
    </footer>
  );
}