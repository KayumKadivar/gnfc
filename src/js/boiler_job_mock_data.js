// ============================================================================
// MOCK DATA FOR THE BOILER JOB DETAIL PAGE
// This file contains statically defined mock objects to power the Job Detail UI
// ============================================================================

const JB_DATABASE = {
    'ACJB-2': {
        location: 'MTR FLOOR', cableNo: 'ACJB2-CCAbl', cableType: 'SIGNAL 12 PAIR', cabinet: 'C C Ab1', docNo: '', drawingNo: '', drawingName: '', excl: '',
        channels: [
            { ch: 1, rows: [
                { tag: '1LT302', func: 'HEATER FLOOR', jbTerm: 1, cabTerm: '', cabStrip: 'B3' },
                { tag: '', func: 'HPH-1 LEVEL', jbTerm: 2, cabTerm: '1AITB-2', cabStrip: 'B4' },
                { tag: '', func: 'CLOSE LOOP', jbTerm: 3, cabTerm: '', cabStrip: '' }
            ]},
            { ch: 2, rows: [
                { tag: '1LT301', func: 'HEATER FLOOR', jbTerm: 4, cabTerm: '', cabStrip: 'A2' },
                { tag: '', func: 'HPH-1 LEVEL', jbTerm: 5, cabTerm: '1AITB-2', cabStrip: 'A4' },
                { tag: '', func: 'CLOSE LOOP', jbTerm: 6, cabTerm: '', cabStrip: '' }
            ]},
            { ch: 3, rows: [
                { tag: '1FT301', func: 'HEATER FLOOR', jbTerm: 7, cabTerm: '', cabStrip: '' },
                { tag: '', func: 'BFW FLOW', jbTerm: 8, cabTerm: '1AITB-2', cabStrip: 'F2' },
                { tag: '', func: 'OPEN LOOP', jbTerm: 9, cabTerm: '', cabStrip: '' }
            ]},
            { ch: 4, rows: [
                { tag: '1PT706', func: 'HEATER FLOOR', jbTerm: 10, cabTerm: '', cabStrip: 'A2' },
                { tag: '', func: '26/15 ATA STEAM PRESS', jbTerm: 11, cabTerm: '1AITB-2', cabStrip: 'B0' },
                { tag: '', func: 'CLOSE LOOP', jbTerm: 12, cabTerm: '', cabStrip: '' }
            ]},
            { ch: 5, rows: [
                { tag: '1FT301', func: 'DEAERATOR FLOOR', jbTerm: 13, cabTerm: '', cabStrip: 'B5' },
                { tag: '', func: 'DM MAKE UP FLOW', jbTerm: 14, cabTerm: '1AITB-2', cabStrip: 'B6' },
                { tag: '', func: 'OPEN LOOP', jbTerm: 15, cabTerm: '', cabStrip: '' }
            ]},
            { ch: 6, rows: [
                { tag: '1PT78B', func: 'HEATER FLOOR', jbTerm: 16, cabTerm: '', cabStrip: 'B7' },
                { tag: '', func: 'INST AIR PRESS', jbTerm: 17, cabTerm: '1AITB-3', cabStrip: 'B3' },
                { tag: '', func: 'CLOSE LOOP', jbTerm: 18, cabTerm: '', cabStrip: '' }
            ]}
        ]
    },
    'ACJB-1': {
        location: 'GROUND FLOOR', cableNo: 'ACJB1-CCAb1', cableType: 'SIGNAL 12 PAIR', cabinet: 'C C Ab1', docNo: '', drawingNo: '', drawingName: '', excl: '',
        channels: [
            { ch: 1, rows: [
                { tag: '1TT101', func: 'GROUND FLOOR', jbTerm: 1, cabTerm: '', cabStrip: 'A1' },
                { tag: '', func: 'FURNACE TEMP', jbTerm: 2, cabTerm: '1AITB-1', cabStrip: 'A2' },
                { tag: '', func: 'CLOSE LOOP', jbTerm: 3, cabTerm: '', cabStrip: '' }
            ]},
            { ch: 2, rows: [
                { tag: '1TT102', func: 'GROUND FLOOR', jbTerm: 4, cabTerm: '', cabStrip: 'A3' },
                { tag: '', func: 'SH OUTLET TEMP', jbTerm: 5, cabTerm: '1AITB-1', cabStrip: 'A4' },
                { tag: '', func: 'CLOSE LOOP', jbTerm: 6, cabTerm: '', cabStrip: '' }
            ]}
        ]
    }
};

const JB_INDEX_DATA = [
    { group: 'SIGNAL 12 PAIR', items: [
        { jb: 'TEST',    loc: 'BOOYWO',                              cable: 'SIGNAL 12 PAIR', cab: 'test' },
        { jb: 'AUB-7',  loc: 'NEAR CW PUMP',                        cable: 'SIGNAL 12 PAIR', cab: 'C.U02' },
        { jb: 'AUB-6',  loc: 'HTR FLOOR, NORTH SIDE WALL',         cable: 'SIGNAL 12 PAIR', cab: 'C.U02' },
        { jb: 'AUB-5',  loc: 'GND FLOOR, NEAR BFP 2',              cable: 'SIGNAL 12 PAIR', cab: 'C.U02' },
        { jb: 'AUB-4',  loc: 'GND FLOOR, NEAR BFP1',               cable: 'SIGNAL 12 PAIR', cab: 'C.U02' },
        { jb: 'AUB-3',  loc: 'GND FLOOR, NEAR HOTWELL',            cable: 'SIGNAL 12 PAIR', cab: 'C.U02' },
        { jb: 'AUB-2',  loc: 'GND FLOOR, NORTH SIDE WALL',         cable: 'SIGNAL 12 PAIR', cab: 'C.U02' },
        { jb: 'AUB-11', loc: 'TG FLOOR, NEAR NORTH SIDE WALL',     cable: 'SIGNAL 12 PAIR', cab: 'C.U01' },
        { jb: 'AUB-1',  loc: 'TG FLOOR, NORTH SIDE WALL',          cable: 'SIGNAL 12 PAIR', cab: 'C.U02' },
        { jb: 'ACJB-8', loc: 'DEAERATOR FLOOR, IN FRONT OF DEAERATOR', cable: 'SIGNAL 12 PAIR', cab: 'CCA01' },
        { jb: 'ACJB-7', loc: 'GND FLOOR, NEAR BFW PUMP',           cable: 'SIGNAL 12 PAIR', cab: 'CCA01' },
        { jb: 'ACJB-6', loc: 'TG FLOOR, NORTH SIDE WALL',          cable: 'SIGNAL 12 PAIR', cab: 'CCA01' },
        { jb: 'ACJB-5', loc: 'GND FLOOR, NEAR CW SUMP, EAST SIDE', cable: 'SIGNAL 12 PAIR', cab: 'CCA01' },
        { jb: 'ACJB-4', loc: 'GND FLOOR, NORTH SIDE WALL',         cable: 'SIGNAL 12 PAIR', cab: 'CCA01' },
        { jb: 'ACJB-3', loc: 'HTR FLOOR',                          cable: 'SIGNAL 12 PAIR', cab: 'CCA01' },
        { jb: 'ACJB-2', loc: 'HTR FLOOR',                          cable: 'SIGNAL 12 PAIR', cab: 'CCA01' },
        { jb: 'ACJB-1', loc: 'GND FLOOR, NEAR BFP, NORTH SIDE',    cable: 'SIGNAL 12 PAIR', cab: 'CCA01' }
    ]},
    { group: 'RTD 8 TRIAD', items: [
        { jb: 'TJB-01',  loc: 'TG FLOOR, NORTH SIDE WALL',    cable: 'RTD 8 TRIAD', cab: 'CCA01' },
        { jb: 'RJB-04',  loc: 'INSIDE BFP LOCAL PANEL',       cable: 'RTD 8 TRIAD', cab: 'CCA01' },
        { jb: 'RJB-03',  loc: 'INSIDE BFP LOCAL PANEL',       cable: 'RTD 8 TRIAD', cab: 'CCA01' },
        { jb: 'RJB-02',  loc: 'HTR FLOOR, SOUTH SIDE',        cable: 'RTD 8 TRIAD', cab: 'CCA01' },
        { jb: 'RJB-01',  loc: 'EJECTOR FLOOR, EAST SIDE',     cable: 'RTD 8 TRIAD', cab: 'CCA01' },
        { jb: 'KSB TB-4', loc: 'INSIDE BFP LOCAL PANEL',      cable: 'RTD 8 TRIAD', cab: 'C.U03' },
        { jb: 'KSB TB-3', loc: 'INSIDE BFP LOCAL PANEL',      cable: 'RTD 8 TRIAD', cab: 'C.U03' }
    ]},
    { group: 'DIGITAL 6 PAIR', items: [
        { jb: 'EJB-7',  loc: 'HTR FLOOR, NORTH SIDE WALL', cable: 'DIGITAL 6 PAIR', cab: 'C.U02' },
        { jb: 'EJB-6B', loc: 'HTR FLOOR, NORTH SIDE WALL', cable: 'DIGITAL 6 PAIR', cab: 'C.U03' },
        { jb: 'EJB-4',  loc: 'GND FLOOR, NEAR CED BOILER', cable: 'DIGITAL 6 PAIR', cab: 'C.U02' }
    ]}
];

// Re-expose so it's in the global window for easy access if necessary without modules
window.JB_DATABASE = JB_DATABASE;
window.JB_INDEX_DATA = JB_INDEX_DATA;
