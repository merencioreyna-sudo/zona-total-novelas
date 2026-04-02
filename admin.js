// ===== CONFIGURACIÓN ADMIN =====
// const ADMIN_PASSWORD = 'admin123';
let ADMIN_PASSWORD = '';
let adminAutenticado = false;
let todasLasNovelasAdmin = [];

// ===== OBTENER CONTRASEÑA DESDE SHEETS =====
async function cargarPasswordAdmin() {
    try {
        const response = await fetch(SHEET_URL);
        const data = await response.json();
        if (data.success && data.data && data.data[0]) {
            ADMIN_PASSWORD = data.data[0].AdminPassword || '';
            console.log('Contraseña cargada desde Sheets');
        } else {
            ADMIN_PASSWORD = '';
        }
    } catch (error) {
        console.error('Error al cargar contraseña:', error);
        ADMIN_PASSWORD = '';
    }
}

// ===== DOM ELEMENTS ADMIN =====
const adminBtn = document.getElementById('adminBtn');
const adminModalOverlay = document.getElementById('adminModalOverlay');
const adminCerrar = document.getElementById('adminCerrar');
const adminLoginPanel = document.getElementById('adminLoginPanel');
const adminGestionPanel = document.getElementById('adminGestionPanel');
const adminPasswordInput = document.getElementById('adminPassword');
const adminLoginBtn = document.getElementById('adminLoginBtn');

// ===== MOSTRAR MODAL ADMIN =====
function mostrarModalAdmin() {
    adminModalOverlay.classList.add('active');
    adminPasswordInput.value = '';
    adminLoginPanel.style.display = 'block';
    adminGestionPanel.style.display = 'none';
    document.body.style.overflow = 'hidden';
}

function cerrarModalAdmin() {
    adminModalOverlay.classList.remove('active');
    document.body.style.overflow = '';
    adminAutenticado = false;
}

async function verificarAdmin() {
    const pass = adminPasswordInput.value;
    await cargarPasswordAdmin();
    if (pass === ADMIN_PASSWORD) {
        adminAutenticado = true;
        adminLoginPanel.style.display = 'none';
        cargarPanelGestion();
    } else {
        alert('❌ Contraseña incorrecta');
        adminPasswordInput.value = '';
        adminPasswordInput.focus();
    }
}

// ===== CARGAR PANEL DE GESTIÓN =====
async function cargarPanelGestion() {
    adminGestionPanel.style.display = 'block';
    await cargarNovelasAdmin();
    renderizarPanelGestion();
}

// ===== CARGAR NOVELAS DESDE SHEETS (PARA ADMIN) =====
async function cargarNovelasAdmin() {
    try {
        const response = await fetch(SHEET_URL);
        const data = await response.json();
        if (data.success && data.data) {
            todasLasNovelasAdmin = data.data;
        } else {
            todasLasNovelasAdmin = [];
        }
    } catch (error) {
        console.error('Error al cargar novelas:', error);
        todasLasNovelasAdmin = [];
    }
}

// ===== RENDERIZAR PANEL ADMIN =====
function renderizarPanelGestion() {
    adminGestionPanel.innerHTML = `
        <h2>📋 GESTIÓN DE NOVELAS</h2>
        
        <!-- Formulario para agregar nueva novela -->
        <div style="margin-bottom: 30px; padding: 15px; background: var(--bg-secondary); border-radius: 12px;">
            <h3 style="color: var(--accent-coral); margin-bottom: 15px;">➕ Agregar nueva novela</h3>
            <form id="formAgregarNovela">
                <input type="text" id="nuevoId" placeholder="ID (ej: nov001)" required>
                <input type="text" id="nuevoTitulo" placeholder="Título" required>
                <input type="text" id="nuevoPais" placeholder="País" required>
                <input type="text" id="nuevoAnio" placeholder="Año" required>
                <input type="text" id="nuevoGenero" placeholder="Género (ej: Romántica)" required>
                <select id="nuevoEstado" required>
                    <option value="Completa">Completa</option>
                    <option value="En emisión">En emisión</option>
                </select>
                <input type="number" id="nuevoCapitulos" placeholder="Número de capítulos" required>
                <input type="url" id="nuevaImagen" placeholder="URL de la imagen" required>
                <input type="url" id="nuevoEmbedUrl" placeholder="URL base del reproductor (ej: https://embed.com/novela/capitulo-)" required>
                <textarea id="nuevaSinopsis" rows="3" placeholder="Sinopsis" required></textarea>
                <button type="submit" style="background: var(--accent-purple); margin-top: 10px;">💾 Guardar novela</button>
            </form>
        </div>
        
        <!-- Lista de novelas existentes -->
        <div style="margin-top: 20px;">
            <h3 style="color: var(--accent-coral); margin-bottom: 15px;">📚 Novelas existentes</h3>
            <div id="listaNovelasAdmin" style="max-height: 400px; overflow-y: auto;">
                ${renderizarListaNovelasAdmin()}
            </div>
        </div>
        
        <button onclick="cerrarModalAdmin()" style="margin-top: 20px; background: var(--bg-secondary); color: white;">Cerrar</button>
    `;
    
    // Event listener para el formulario
    document.getElementById('formAgregarNovela').addEventListener('submit', agregarNovela);
}

// ===== RENDERIZAR LISTA DE NOVELAS EN ADMIN =====
function renderizarListaNovelasAdmin() {
    if (todasLasNovelasAdmin.length === 0) {
        return '<p style="color: var(--text-secondary);">No hay novelas cargadas.</p>';
    }
    
    return todasLasNovelasAdmin.map(novela => `
        <div style="background: var(--bg-card); border-radius: 8px; padding: 12px; margin-bottom: 10px; border-left: 3px solid var(--accent-coral);">
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
                <div>
                    <strong style="color: var(--accent-coral);">${novela.titulo}</strong><br>
                    <small style="color: var(--text-secondary);">${novela.pais} · ${novela.anio} · ${novela.capitulosTotales} capítulos · ${novela.estado}</small>
                </div>
                <div style="display: flex; gap: 8px;">
                    <button onclick="editarNovela('${novela.id}')" style="background: var(--accent-purple); color: white; padding: 5px 12px; font-size: 0.8rem;">✏️ Editar</button>
                    <button onclick="eliminarNovela('${novela.id}')" style="background: var(--accent-coral-dark); color: white; padding: 5px 12px; font-size: 0.8rem;">🗑️ Eliminar</button>
                </div>
            </div>
        </div>
    `).join('');
}

// ===== AGREGAR NOVELA =====
async function agregarNovela(e) {
    e.preventDefault();
    
    const nuevaNovela = {
        action: 'agregar',
        id: document.getElementById('nuevoId').value,
        titulo: document.getElementById('nuevoTitulo').value,
        pais: document.getElementById('nuevoPais').value,
        anio: document.getElementById('nuevoAnio').value,
        genero: document.getElementById('nuevoGenero').value,
        estado: document.getElementById('nuevoEstado').value,
        capitulosTotales: parseInt(document.getElementById('nuevoCapitulos').value),
        imagen: document.getElementById('nuevaImagen').value,
        embedBaseUrl: document.getElementById('nuevoEmbedUrl').value,
        sinopsis: document.getElementById('nuevaSinopsis').value
    };
    
    try {
        const response = await fetch(SHEET_URL, {
            method: 'POST',
            body: JSON.stringify(nuevaNovela)
        });
        const data = await response.json();
        
        if (data.success) {
            alert('✅ Novela agregada correctamente');
            await cargarNovelasAdmin();
            renderizarPanelGestion();
            cargarNovelas(); // Recargar grilla principal
        } else {
            alert('❌ Error al agregar: ' + (data.error || 'desconocido'));
        }
    } catch (error) {
        console.error('Error:', error);
        alert('❌ Error de conexión');
    }
}

// ===== EDITAR NOVELA =====
function editarNovela(id) {
    const novela = todasLasNovelasAdmin.find(n => n.id === id);
    if (!novela) return;
    
    // Llenar formulario con datos actuales
    document.getElementById('nuevoId').value = novela.id;
    document.getElementById('nuevoTitulo').value = novela.titulo;
    document.getElementById('nuevoPais').value = novela.pais;
    document.getElementById('nuevoAnio').value = novela.anio;
    document.getElementById('nuevoGenero').value = novela.genero;
    document.getElementById('nuevoEstado').value = novela.estado;
    document.getElementById('nuevoCapitulos').value = novela.capitulosTotales;
    document.getElementById('nuevaImagen').value = novela.imagen;
    document.getElementById('nuevoEmbedUrl').value = novela.embedBaseUrl;
    document.getElementById('nuevaSinopsis').value = novela.sinopsis;
    
    // Cambiar texto del botón
    const btn = document.querySelector('#formAgregarNovela button');
    btn.textContent = '✏️ Actualizar novela';
    btn.style.background = 'var(--accent-coral)';
    
    // Guardar ID para actualizar
    document.getElementById('formAgregarNovela').dataset.editId = id;
    
    // Cambiar acción del formulario
    document.getElementById('formAgregarNovela').onsubmit = (e) => actualizarNovela(e, id);
}

// ===== ACTUALIZAR NOVELA =====
async function actualizarNovela(e, id) {
    e.preventDefault();
    
    const novelaActualizada = {
        action: 'actualizar',
        id: id,
        titulo: document.getElementById('nuevoTitulo').value,
        pais: document.getElementById('nuevoPais').value,
        anio: document.getElementById('nuevoAnio').value,
        genero: document.getElementById('nuevoGenero').value,
        estado: document.getElementById('nuevoEstado').value,
        capitulosTotales: parseInt(document.getElementById('nuevoCapitulos').value),
        imagen: document.getElementById('nuevaImagen').value,
        embedBaseUrl: document.getElementById('nuevoEmbedUrl').value,
        sinopsis: document.getElementById('nuevaSinopsis').value
    };
    
    try {
        const response = await fetch(SHEET_URL, {
            method: 'POST',
            body: JSON.stringify(novelaActualizada)
        });
        const data = await response.json();
        
        if (data.success) {
            alert('✅ Novela actualizada correctamente');
            // Resetear formulario
            document.getElementById('formAgregarNovela').reset();
            document.getElementById('formAgregarNovela').removeAttribute('data-edit-id');
            const btn = document.querySelector('#formAgregarNovela button');
            btn.textContent = '💾 Guardar novela';
            btn.style.background = 'var(--accent-purple)';
            document.getElementById('formAgregarNovela').onsubmit = agregarNovela;
            
            await cargarNovelasAdmin();
            renderizarPanelGestion();
            cargarNovelas();
        } else {
            alert('❌ Error al actualizar');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('❌ Error de conexión');
    }
}

// ===== ELIMINAR NOVELA =====
async function eliminarNovela(id) {
    if (!confirm('¿Estás seguro de eliminar esta novela? Esta acción no se puede deshacer.')) return;
    
    try {
        const response = await fetch(SHEET_URL, {
            method: 'POST',
            body: JSON.stringify({ action: 'eliminar', id: id })
        });
        const data = await response.json();
        
        if (data.success) {
            alert('🗑️ Novela eliminada correctamente');
            await cargarNovelasAdmin();
            renderizarPanelGestion();
            cargarNovelas();
        } else {
            alert('❌ Error al eliminar');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('❌ Error de conexión');
    }
}

// ===== EVENT LISTENERS ADMIN =====
if (adminBtn) adminBtn.addEventListener('click', mostrarModalAdmin);
if (adminCerrar) adminCerrar.addEventListener('click', cerrarModalAdmin);
if (adminLoginBtn) adminLoginBtn.addEventListener('click', verificarAdmin);
adminPasswordInput?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') verificarAdmin();
});

// Cerrar modal con ESC
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && adminModalOverlay?.classList.contains('active')) {
        cerrarModalAdmin();
    }
});