(function initCalibrationStore(global) {
    "use strict";

    const STORAGE_KEY = "gnfc_calibration_v1";

    const SEED_DATA = [
        {
            id: "CAL-001",
            plant: "BOILER",
            item: "BLR-027 (mAmV Simulator)",
            make: "Fluke",
            modelNo: "715",
            srNo: "",
            lastCalibrated: "20/02/2025",
            calDueDate: "20/02/2026"
        },
        {
            id: "CAL-002",
            plant: "BOILER",
            item: "BLR-003 (Temp Simulator)",
            make: "Fluke",
            modelNo: "724",
            srNo: "3745297",
            lastCalibrated: "17/02/2025",
            calDueDate: "17/02/2026"
        },
        {
            id: "CAL-003",
            plant: "BOILER",
            item: "BLR-002 (Digital Multimeter)",
            make: "MOTWANE",
            modelNo: "M63",
            srNo: "A04071D14",
            lastCalibrated: "17/02/2025",
            calDueDate: "17/02/2026"
        },
        {
            id: "CAL-004",
            plant: "BOILER",
            item: "FT-101 (Flow Transmitter)",
            make: "Rosemount",
            modelNo: "3051",
            srNo: "SN12345",
            lastCalibrated: "01/01/2025",
            calDueDate: "01/01/2026"
        },
        {
             id: "CAL-005",
            plant: "BOILER",
            item: "PT-501 (Pressure Transmitter)",
            make: "ABB",
            modelNo: "266HSH",
            srNo: "ABB98765",
            lastCalibrated: "10/02/2025",
            calDueDate: "10/02/2027" // Not due yet
        }
    ];

    function loadData() {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_DATA));
            return SEED_DATA;
        }
        try {
            return JSON.parse(raw);
        } catch (e) {
            return SEED_DATA;
        }
    }

    function parseDate(dateStr) {
        // dd/mm/yyyy
        const [d, m, y] = dateStr.split('/').map(Number);
        return new Date(y, m - 1, d);
    }

    function getDueItems() {
        const data = loadData();
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        return data.filter(item => {
            const dueDate = parseDate(item.calDueDate);
            return dueDate <= today;
        });
    }

    global.CalibrationStore = {
        loadData,
        getDueItems
    };

})(window);
