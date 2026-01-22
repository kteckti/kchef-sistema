// Inicializar Carrossel de Clientes
const clientsSwiper = new Swiper('.clientsSwiper', {
    slidesPerView: 2,
    spaceBetween: 30,
    loop: true,
    autoplay: {
        delay: 2500,
        disableOnInteraction: false,
    },
    breakpoints: {
        640: { slidesPerView: 3 },
        768: { slidesPerView: 4 },
        1024: { slidesPerView: 5 },
    }
});

// Inicializar Slider de Serviços
const servicesSwiper = new Swiper('.servicesSwiper', {
    slidesPerView: 1,
    spaceBetween: 20,
    pagination: {
        el: '.swiper-pagination',
        clickable: true,
    },
    breakpoints: {
        768: { slidesPerView: 2 },
        1024: { slidesPerView: 3 },
    }
});

// --- 1. Lógica do Menu de Navegação (Transparente -> Sólido) ---
const navbar = document.querySelector('header');

if (navbar) {
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
}

// --- 2. Rolagem Suave para Links Internos ---
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        // Apenas previne o padrão se o link for para a mesma página
        const targetId = this.getAttribute('href');
        if (targetId !== "#" && document.querySelector(targetId)) {
            e.preventDefault();
            const targetElement = document.querySelector(targetId);
            const headerOffset = 90; 
            const elementPosition = targetElement.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.scrollY - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: "smooth"
            });
        }
    });
});

// --- 3. Inicialização dos Swipers (Com verificação de existência) ---

// Verifica se existe o elemento .clientsSwiper antes de iniciar
if (document.querySelector('.clientsSwiper')) {
    const clientsSwiper = new Swiper('.clientsSwiper', {
        slidesPerView: 2,
        spaceBetween: 30,
        loop: true,
        autoplay: {
            delay: 2500,
            disableOnInteraction: false,
        },
        breakpoints: {
            640: { slidesPerView: 3 },
            768: { slidesPerView: 4 },
            1024: { slidesPerView: 5 },
        }
    });
}

// Verifica se existe o elemento .servicesSwiper antes de iniciar
if (document.querySelector('.servicesSwiper')) {
    const servicesSwiper = new Swiper('.servicesSwiper', {
        slidesPerView: 1,
        spaceBetween: 20,
        pagination: {
            el: '.swiper-pagination',
            clickable: true,
        },
        breakpoints: {
            768: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
        }
    });
}

// --- 4. Envio do Formulário com Formspree (AJAX JSON) ---
const contactForm = document.getElementById('contactForm');

if (contactForm) {
    contactForm.addEventListener('submit', async function (event) {
        event.preventDefault();

        const form = event.target;
        // Transforma os dados do formulário em um Objeto JavaScript
        const data = new FormData(form);
        const object = {};
        data.forEach((value, key) => object[key] = value);
        // Transforma o objeto em String JSON
        const json = JSON.stringify(object);

        const submitButton = form.querySelector('button[type="submit"]');
        const originalBtnText = submitButton.innerText;
        
        submitButton.disabled = true;
        submitButton.innerText = "Enviando...";

        try {
            const response = await fetch(form.action, {
                method: "POST",
                body: json, // Envia o JSON
                headers: {
                    'Content-Type': 'application/json', // Avisa que é JSON
                    'Accept': 'application/json'
                }
            });

            if (response.ok) {
                form.reset();
                const successModal = new bootstrap.Modal(document.getElementById('modalSucesso'));
                successModal.show();
            } else {
                const responseData = await response.json();
                if (responseData.errors) {
                    alert("Erro: " + responseData.errors.map(error => error.message).join(", "));
                } else {
                    alert("Ocorreu um erro ao enviar. Tente novamente.");
                }
            }
        } catch (error) {
            alert("Erro de conexão. Verifique sua internet.");
            console.error(error);
        } finally {
            submitButton.disabled = false;
            submitButton.innerText = originalBtnText;
        }
    });
}