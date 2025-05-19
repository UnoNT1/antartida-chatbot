
const clasificarEquipo = (obj) => {
    if (!obj.abr_as00) return obj;
    
    const abr = obj.abr_as00;

    if (abr.startsWith('ASC')) return 'ASCENSOR';
    if (abr.startsWith('M')) return 'MONTAVEHÍCULO';
    if (abr.startsWith('R')) return 'RAMPA';
    if (abr.startsWith('S') || abr.startsWith('C.I') || abr.startsWith('ingreso')) return 'SAR';
    if (abr.startsWith('PC') || abr.startsWith('PE') || abr.startsWith('POP' || abr.startsWith('POL'))) return 'PORTON CORREDIZO/ELEVADIZO';
    if (abr.startsWith('TAB') || abr.startsWith('elec')) return 'Problemas Electricos';
    if (abr.startsWith('ALA')) return 'ALARMA';
    if (abr.startsWith('bom')) return 'Bomba de Agua';

    
    return abr;
};

export default clasificarEquipo;