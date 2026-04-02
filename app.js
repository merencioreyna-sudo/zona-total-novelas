// ===== CONFIGURACIÓN =====
const SHEET_URL = 'https://script.google.com/macros/s/AKfycbzwkX14x-LawXPfPWvShgzvaFzZW3XB5dFzvyseANEUamg5gq2pySryBzkmUiid6cbRCw/exec';
let todasLasNovelas = [];
let novelaActual = null;
let capituloActual = 1;

// ===== DOM ELEMENTS =====
const novelasGrid = document.getElementById('novelasGrid');
const novelasCounter = document.getElementById('novelasCounter');
const menuToggle = document.getElementById('menuToggle');
const mobileMenu = document.getElementById('mobileMenu');
const menuOverlay = document.getElementById('menuOverlay');
const closeMenu = document.getElementById('closeMenu');
const modalOverlay = document.getElementById('novelaModal');
const closeModal = document.getElementById('closeModal');
const modalTitulo = document.getElementById('modalTitulo');
const modalSinopsis = document.getElementById('modalSinopsis');
const modalPais = document.getElementById('modalPais');
const modalAnio = document.getElementById('modalAnio');
const modalGenero = document.getElementById('modalGenero');
const modalTotalCaps = document.getElementById('modalTotalCaps');
const modalEstado = document.getElementById('modalEstado');
const videoIframe = document.getElementById('videoIframe');
const capitulosLista = document.getElementById('capitulosLista');
const capituloActualSpan = document.getElementById('capituloActual');
const capAnteriorBtn = document.getElementById('capAnterior');
const capSiguienteBtn = document.getElementById('capSiguiente');

// ===== CARGAR NOVELAS DESDE GOOGLE SHEETS =====
async function cargarNovelas() {
    try {
        mostrarLoading(true);
        const response = await fetch(SHEET_URL);
        const data = await response.json();
        
        console.log('Datos recibidos:', data); // 👈 VER EN CONSOLA
        
        if (data.success && data.data) {
            todasLasNovelas = data.data;
            console.log('Novelas cargadas:', todasLasNovelas); // 👈 VER EN CONSOLA
            renderizarNovelas(todasLasNovelas);
            actualizarContador(todasLasNovelas.length);
        } else {
            console.error('Error al cargar novelas:', data.error);
            mostrarError('No se pudieron cargar las novelas. Intenta más tarde.');
        }
    } catch (error) {
        console.error('Error de conexión:', error);
        mostrarError('Error de conexión. Verifica tu internet.');
    } finally {
        mostrarLoading(false);
    }
}

// ===== MOSTRAR LOADING =====
function mostrarLoading(mostrar) {
    if (mostrar) {
        novelasGrid.innerHTML = '<div class="loading-message"><i class="fas fa-spinner fa-spin"></i> Cargando novelas...</div>';
    }
}

function mostrarError(mensaje) {
    novelasGrid.innerHTML = `<div class="loading-message"><i class="fas fa-exclamation-triangle"></i> ${mensaje}</div>`;
}

// ===== RENDERIZAR NOVELAS (CORREGIDO: usa mayúsculas como viene de Sheets) =====
function renderizarNovelas(novelas) {
    if (!novelas || novelas.length === 0) {
        novelasGrid.innerHTML = '<div class="loading-message"><i class="fas fa-book-open"></i> No hay novelas disponibles por ahora.</div>';
        return;
    }

    novelasGrid.innerHTML = novelas.map(novela => `
        <div class="novela-card" data-id="${novela.ID}">
            <div class="novela-imagen">
                <img src="${novela.Imagen || 'https://via.placeholder.com/300x450?text=Zona+Total'}" alt="${novela.Titulo}">
                <span class="estado-tag ${novela.Estado === 'Completa' ? 'estado-completa' : 'estado-emision'}">
                    ${novela.Estado || 'En emisión'}
                </span>
            </div>
            <div class="novela-info">
                <h3 class="novela-titulo">${novela.Titulo || 'Sin título'}</h3>
                <div class="novela-detalles-card">
                    <span><i class="fas fa-globe"></i> ${novela.Pais || 'Desconocido'}</span>
                    <span><i class="fas fa-calendar"></i> ${novela.Anio || 'N/A'}</span>
                </div>
                <div class="novela-capitulos">
                    <i class="fas fa-list"></i> ${novela.CapitulosTotales || 0} capítulos
                </div>
            </div>
        </div>
    `).join('');

    document.querySelectorAll('.novela-card').forEach(card => {
        card.addEventListener('click', () => {
            const id = card.dataset.id;
            const novela = todasLasNovelas.find(n => n.ID === id);
            if (novela) abrirModal(novela);
        });
    });
}

function actualizarContador(total) {
    if (novelasCounter) {
        novelasCounter.innerHTML = `📖 ${total} novelas`;
    }
}

// ===== FILTRAR POR CATEGORÍA =====
// ===== FILTRAR POR CATEGORÍA =====
function filtrarPorCategoria(categoria) {
    console.log('Filtrando por:', categoria);
    console.log('Novelas disponibles:', todasLasNovelas);
    
    let filtradas = [...todasLasNovelas];
    
    switch(categoria) {
        case 'turcas':
            filtradas = filtradas.filter(n => {
                const pais = n.Pais?.toLowerCase() || '';
                return pais.includes('turca') || pais.includes('turquia');
            });
            break;
        case 'mexicanas':
            filtradas = filtradas.filter(n => {
                const pais = n.Pais?.toLowerCase() || '';
                return pais.includes('mexicana') || pais.includes('mexico');
            });
            break;
        case 'colombianas':
            filtradas = filtradas.filter(n => {
                const pais = n.Pais?.toLowerCase() || '';
                return pais.includes('colombiana') || pais.includes('colombia');
            });
            break;
        case 'romanticas':
            filtradas = filtradas.filter(n => {
                const pais = n.Pais?.toLowerCase() || '';
                return pais.includes('romantica') || pais.includes('romántica');
            });
            break;
        case 'clasicas':
            filtradas = filtradas.filter(n => {
                const anio = parseInt(n.Anio);
                return anio && anio < 2010;
            });
            break;
        default:
            filtradas = [...todasLasNovelas];
    }
    
    console.log('Resultado filtrado:', filtradas);
    renderizarNovelas(filtradas);
    actualizarContador(filtradas.length);
}

// ===== ABRIR MODAL =====
function abrirModal(novela) {
    novelaActual = novela;
    capituloActual = 1;
    
    modalTitulo.textContent = novela.Titulo || 'Sin título';
    modalSinopsis.textContent = novela.Sinopsis || 'Sin sinopsis disponible.';
    modalPais.textContent = novela.Pais || 'Desconocido';
    modalAnio.textContent = novela.Anio || 'N/A';
    modalTotalCaps.textContent = `${novela.CapitulosTotales || 0} capítulos`;
    modalEstado.textContent = novela.Estado || 'En emisión';
    modalEstado.className = `estado-badge ${novela.Estado === 'Completa' ? 'estado-completa' : 'estado-emision'}`;
    
    cargarCapitulo(1);
    generarListaCapítulos(novela.CapitulosTotales || 0);
    
    modalOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// ===== CARGAR CAPÍTULO =====
function cargarCapitulo(numero) {
    if (!novelaActual) return;
    
    capituloActual = numero;
    const totalCaps = novelaActual.CapitulosTotales || 0;
    
    capituloActualSpan.textContent = `Capítulo ${capituloActual} de ${totalCaps}`;
    
    document.querySelectorAll('.cap-boton').forEach(btn => {
        const btnNum = parseInt(btn.dataset.cap);
        if (btnNum === capituloActual) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    let urlBase = novelaActual.EmbedBaseUrl || '';
    
    // Agregar número de capítulo si la URL tiene {capitulo}
    let urlFinal = urlBase;
    if (urlBase.includes('{capitulo}')) {
        urlFinal = urlBase.replace('{capitulo}', numero);
    } else if (urlBase && !urlBase.includes('{capitulo}') && !urlBase.includes('/embed/') && !urlBase.includes('player.')) {
        // Si no tiene marcador y no es un embed, asumimos que hay que agregar el número al final
        urlFinal = urlBase + numero;
    }
    
    // Convertir cualquier URL a formato embed
    urlFinal = convertirCualquierURL(urlFinal);
    
    if (urlFinal) {
        videoIframe.src = urlFinal;
        console.log('Reproduciendo:', urlFinal);
    } else {
        videoIframe.src = '';
        console.error('No se pudo generar la URL del video');
    }
}

// ===== CONVERTIR CUALQUIER URL A FORMATO EMBED =====
function convertirCualquierURL(url) {
    if (!url) return '';
    
    // 1. YOUTUBE - Formato watch?v=
    if (url.includes('youtube.com/watch?v=')) {
        let id = url.split('v=')[1];
        if (id.includes('&')) id = id.split('&')[0];
        return `https://www.youtube.com/embed/${id}`;
    }
    
    // 2. YOUTUBE - Formato youtu.be/
    if (url.includes('youtu.be/')) {
        let id = url.split('youtu.be/')[1];
        if (id.includes('?')) id = id.split('?')[0];
        return `https://www.youtube.com/embed/${id}`;
    }
    
    // 3. YOUTUBE - Ya es embed (dejarlo igual)
    if (url.includes('youtube.com/embed/') || url.includes('youtube-nocookie.com/embed/')) {
        return url;
    }
    
    // 4. VIMEO - Formato normal
    if (url.includes('vimeo.com/') && !url.includes('player.vimeo.com')) {
        let id = url.split('vimeo.com/')[1];
        if (id.includes('?')) id = id.split('?')[0];
        return `https://player.vimeo.com/video/${id}`;
    }
    
    // 5. VIMEO - Ya es player (dejarlo igual)
    if (url.includes('player.vimeo.com/video/')) {
        return url;
    }
    
    // 6. DAILYMOTION
    if (url.includes('dailymotion.com/video/')) {
        let id = url.split('/video/')[1];
        if (id.includes('_')) id = id.split('_')[0];
        if (id.includes('?')) id = id.split('?')[0];
        return `https://www.dailymotion.com/embed/video/${id}`;
    }
    
    // 7. TWITCH
    if (url.includes('twitch.tv/videos/')) {
        let id = url.split('/videos/')[1];
        if (id.includes('?')) id = id.split('?')[0];
        return `https://player.twitch.tv/?video=${id}&parent=${window.location.hostname}`;
    }
    
    // 8. FACEBOOK
    if (url.includes('facebook.com/') && url.includes('/videos/')) {
        let id = url.split('/videos/')[1];
        if (id.includes('?')) id = id.split('?')[0];
        return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}`;
    }
    
    // 9. GOOGLE DRIVE
    if (url.includes('drive.google.com/file/d/')) {
        let id = url.split('/file/d/')[1];
        if (id.includes('/')) id = id.split('/')[0];
        if (id.includes('?')) id = id.split('?')[0];
        return `https://drive.google.com/file/d/${id}/preview`;
    }
    
    // 10. Streamtape
    if (url.includes('streamtape.com/e/')) {
        return url;
    }
    
    // 11. Si ya tiene embed (cualquier sitio)
    if (url.includes('/embed/') || url.includes('player.') || url.includes('embed.')) {
        return url;
    }
    
    // 12. Si no se reconoce, devolver la URL original
    return url;
}
function generarListaCapítulos(total) {
    if (!capitulosLista) return;
    
    if (total === 0) {
        capitulosLista.innerHTML = '<div class="cap-boton" style="cursor: default;">No hay capítulos disponibles</div>';
        return;
    }
    
    let html = '';
    for (let i = 1; i <= total; i++) {
        html += `<button class="cap-boton" data-cap="${i}">Capítulo ${i}</button>`;
    }
    capitulosLista.innerHTML = html;
    
    document.querySelectorAll('.cap-boton').forEach(btn => {
        if (btn.dataset.cap) {
            btn.addEventListener('click', () => {
                const cap = parseInt(btn.dataset.cap);
                cargarCapitulo(cap);
            });
        }
    });
    
    const primerBoton = document.querySelector('.cap-boton[data-cap="1"]');
    if (primerBoton) primerBoton.classList.add('active');
}

function cerrarModal() {
    modalOverlay.classList.remove('active');
    videoIframe.src = '';
    novelaActual = null;
    document.body.style.overflow = '';
}

// ===== MENÚ MÓVIL =====
function toggleMobileMenu() {
    mobileMenu.classList.toggle('active');
    menuOverlay.classList.toggle('active');
    document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
}

function cerrarMobileMenu() {
    mobileMenu.classList.remove('active');
    menuOverlay.classList.remove('active');
    document.body.style.overflow = '';
}

// ===== EVENT LISTENERS =====
document.addEventListener('DOMContentLoaded', () => {
    cargarNovelas();
    
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const categoria = btn.dataset.category;
            document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            filtrarPorCategoria(categoria);
        });
    });
    
    document.querySelectorAll('.mobile-category-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const categoria = btn.dataset.category;
            document.querySelectorAll('.mobile-category-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            filtrarPorCategoria(categoria);
            cerrarMobileMenu();
        });
    });
    
    if (menuToggle) menuToggle.addEventListener('click', toggleMobileMenu);
    if (closeMenu) closeMenu.addEventListener('click', cerrarMobileMenu);
    if (menuOverlay) menuOverlay.addEventListener('click', cerrarMobileMenu);
    if (closeModal) closeModal.addEventListener('click', cerrarModal);
    
    modalOverlay?.addEventListener('click', (e) => {
        if (e.target === modalOverlay) cerrarModal();
    });
    
    if (capAnteriorBtn) {
        capAnteriorBtn.addEventListener('click', () => {
            if (novelaActual && capituloActual > 1) {
                cargarCapitulo(capituloActual - 1);
            }
        });
    }
    
    if (capSiguienteBtn) {
        capSiguienteBtn.addEventListener('click', () => {
            if (novelaActual && capituloActual < (novelaActual.CapitulosTotales || 0)) {
                cargarCapitulo(capituloActual + 1);
            }
        });
    }
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            cerrarModal();
            cerrarMobileMenu();
        }
    });
});