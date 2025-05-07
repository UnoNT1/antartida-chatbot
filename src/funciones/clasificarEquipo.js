
const clasificarEquipo = (obj) => {
    if (!obj.abr_as00) return obj;
    
    const abr = obj.abr_as00;
    if (abr.startsWith('A')) return 'ASCENSOR';
    if (abr.startsWith('M')) return 'MONTAVEHÍCULO';
    if (abr.startsWith('R')) return 'RAMPA';
    if (abr.startsWith('S')) return 'SAR';
    if (abr.startsWith('PC') || abr.startsWith('PE')) return 'PORTON CORREDIZO/ELEVADIZO';
    
    return abr;
};

export default clasificarEquipo;