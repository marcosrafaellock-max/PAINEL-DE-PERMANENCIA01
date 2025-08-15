const patientTableBody = document.querySelector("#patient-table tbody");
const dateElement = document.getElementById("date");
const timeElement = document.getElementById("time");

// Modal elements
const modal = document.getElementById("edit-modal");
const closeModalButton = document.querySelector(".close-button");
const cancelButton = document.getElementById("cancel-button");
const editForm = document.getElementById("edit-form");
const deleteButton = document.getElementById("delete-button");
const downloadPdfButton = document.getElementById("download-pdf-button");

// Theme switcher
const themeToggleButton = document.getElementById('theme-toggle-button');

themeToggleButton.addEventListener('click', () => {
    document.body.classList.toggle('dark-theme');
    // Save theme preference
    if (document.body.classList.contains('dark-theme')) {
        localStorage.setItem('theme', 'dark');
    } else {
        localStorage.setItem('theme', 'light');
    }
});

function loadTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-theme');
    }
}

const riskLevels = [
    { name: 'Vermelho', class: 'risk-vermelho' },
    { name: 'Amarelo', class: 'risk-amarelo' },
    { name: 'Verde', class: 'risk-verde' },
    { name: 'Azul', class: 'risk-azul' }
];

const patientNames = [
    "Ana Silva", "Bruno Costa", "Carla Dias", "Daniel Farias", "Elisa Gomes", "Fábio Lima", "Gabriel Martins", "Helena Nunes", "Igor Oliveira", "Joana Pereira", "Lucas Ribeiro", "Mariana Santos", "Nelson Teixeira", "Olívia Vieira", "Paulo Almeida"
];

let patients = [];
let nextPatientId = 1;

function formatTime(date) {
    if (!date) return "---";
    return date.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function renderPatients() {
    patientTableBody.innerHTML = "";
    
    // Reordena para colocar pacientes com alta no final
    patients.sort((a, b) => {
        if (a.exitTime && !b.exitTime) return 1;
        if (!a.exitTime && b.exitTime) return -1;
        if (b.entryTime && a.entryTime) return b.entryTime - a.entryTime;
        return 0;
    });

    patients.forEach(patient => {
        const row = document.createElement("tr");
        row.dataset.patientId = patient.id;

        const riskLevel = riskLevels.find(r => r.name === patient.risk);

        row.innerHTML = `
            <td>${patient.name}</td>
            <td>${patient.age || '---'}</td>
            <td>${formatTime(patient.entryTime)}</td>
            <td>${formatTime(patient.exitTime)}</td>
            <td><span class="risk-cell ${riskLevel.class}">${riskLevel.name}</span></td>
            <td>${patient.exitReason || '---'}</td>
            <td><button class="edit-button" data-patient-id="${patient.id}">Editar</button></td>
        `;
        patientTableBody.appendChild(row);
    });

    // Add event listeners to new edit buttons
    document.querySelectorAll('.edit-button').forEach(button => {
        button.addEventListener('click', (e) => {
            const patientId = parseInt(e.target.dataset.patientId);
            openEditModal(patientId);
        });
    });
}

function addNewPatient() {
    if (patients.length >= 15) return; // Limita o número de pacientes na tela

    const name = patientNames[Math.floor(Math.random() * patientNames.length)];
    const risk = riskLevels[Math.floor(Math.random() * riskLevels.length)].name;

    const newPatient = {
        id: nextPatientId++,
        name: `${name} ${String.fromCharCode(65 + Math.floor(Math.random() * 26))}.`, // Add random initial
        entryTime: new Date(),
        exitTime: null,
        risk: risk,
        age: Math.floor(Math.random() * 80) + 1,
        exitReason: null,
        staffName: null,
        staffSector: null
    };

    patients.unshift(newPatient); // Adiciona no início da lista
    renderPatients();
}

function dischargePatient() {
    const activePatients = patients.filter(p => !p.exitTime);
    if (activePatients.length === 0) return;

    const patientToDischarge = activePatients[Math.floor(Math.random() * activePatients.length)];
    patientToDischarge.exitTime = new Date();
    const reasons = ["Alta", "Transferência"];
    patientToDischarge.exitReason = reasons[Math.floor(Math.random() * reasons.length)];
    
    renderPatients();
}

function updateClock() {
    const now = new Date();
    dateElement.textContent = now.toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    timeElement.textContent = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

// Modal Logic
function openEditModal(patientId) {
    const patient = patients.find(p => p.id === patientId);
    if (!patient) return;

    // Populate form
    document.getElementById('patient-id').value = patient.id;
    document.getElementById('patient-name').value = patient.name;
    document.getElementById('patient-age').value = patient.age || '';
    document.getElementById('entry-datetime').value = patient.entryTime ? patient.entryTime.toISOString().slice(0, 16) : '';
    document.getElementById('exit-datetime').value = patient.exitTime ? patient.exitTime.toISOString().slice(0, 16) : '';
    document.getElementById('exit-reason').value = patient.exitReason || '';
    document.getElementById('staff-name').value = patient.staffName || '';
    document.getElementById('staff-sector').value = patient.staffSector || '';

    modal.style.display = "flex";
}

function closeEditModal() {
    modal.style.display = "none";
}

closeModalButton.addEventListener('click', closeEditModal);
cancelButton.addEventListener('click', closeEditModal);
window.addEventListener('click', (event) => {
    if (event.target == modal) {
        closeEditModal();
    }
});

editForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const patientId = parseInt(document.getElementById('patient-id').value);
    const patient = patients.find(p => p.id === patientId);
    if (!patient) return;

    // Update patient data from form
    patient.name = document.getElementById('patient-name').value;
    patient.age = parseInt(document.getElementById('patient-age').value) || null;
    
    const entryDateValue = document.getElementById('entry-datetime').value;
    patient.entryTime = entryDateValue ? new Date(entryDateValue) : null;
    
    const exitDateValue = document.getElementById('exit-datetime').value;
    patient.exitTime = exitDateValue ? new Date(exitDateValue) : null;

    patient.exitReason = document.getElementById('exit-reason').value;
    patient.staffName = document.getElementById('staff-name').value;
    patient.staffSector = document.getElementById('staff-sector').value;
    
    renderPatients();
    closeEditModal();
});

deleteButton.addEventListener('click', () => {
    const patientId = parseInt(document.getElementById('patient-id').value);
    if (isNaN(patientId)) return;

    if (confirm('Tem certeza de que deseja deletar este paciente?')) {
        patients = patients.filter(p => p.id !== patientId);
        renderPatients();
        closeEditModal();
    }
});

// PDF Generation
function generatePDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const now = new Date();

    doc.setFontSize(18);
    doc.text("Relatório de Pacientes - UPA Zona Norte", 14, 22);
    doc.setFontSize(11);
    doc.text(`Gerado em: ${now.toLocaleDateString('pt-BR')} ${now.toLocaleTimeString('pt-BR')}`, 14, 30);

    const tableColumn = ["Paciente", "Idade", "Entrada", "Saída", "Class. Risco", "Motivo da Saída"];
    const tableRows = [];

    const sortedPatients = [...patients].sort((a, b) => {
        if (b.entryTime && a.entryTime) return b.entryTime - a.entryTime;
        return 0;
    });

    sortedPatients.forEach(patient => {
        const patientData = [
            patient.name,
            patient.age || '---',
            formatTime(patient.entryTime),
            formatTime(patient.exitTime),
            patient.risk,
            patient.exitReason || '---'
        ];
        tableRows.push(patientData);
    });

    doc.autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: 35,
        theme: 'grid',
        headStyles: { fillColor: [13, 71, 161] } // Cor --primary-color (azul escuro)
    });

    doc.save(`relatorio_pacientes_${now.toISOString().split('T')[0]}.pdf`);
}

downloadPdfButton.addEventListener('click', generatePDF);

// Inicialização
function init() {
    loadTheme();
    // Adicionar alguns pacientes iniciais
    for (let i = 0; i < 7; i++) {
        addNewPatient();
    }
    renderPatients();
    
    updateClock();
    setInterval(updateClock, 1000);
    setInterval(addNewPatient, 15000); // Adiciona um novo paciente a cada 15 segundos
    setInterval(dischargePatient, 25000); // Libera um paciente a cada 25 segundos
}

init();