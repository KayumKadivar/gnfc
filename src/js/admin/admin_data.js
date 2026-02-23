/**
 * Admin Panel — Centralized Data Store
 * All dummy/seed data for the admin panel lives here.
 * Future: Replace with API calls.
 */
const AdminData = (() => {
    'use strict';

    // ── Privilege Master ──
    const privilegeMasterRows = [
        { code: '1', name: 'Tech' },
        { code: '2', name: 'IE/SIE' },
        { code: '3', name: 'M' },
        { code: '4', name: 'SM' },
        { code: '12', name: 'CM' },
        { code: '13', name: 'AGM' },
        { code: '14', name: 'GM' },
        { code: '15', name: 'HOD' }
    ];

    // ── Default Privilege Rows ──
    const defaultPrivilegeRowsTech = [
        { module: 'CMS', add: false, modify: false, del: false, engRemark: false, exRemark: false },
        { module: 'COMDMS', add: false, modify: false, del: false, engRemark: false, exRemark: false },
        { module: 'COSTSAVING_INSTWS', add: false, modify: false, del: false, engRemark: false, exRemark: false },
        { module: 'CYL', add: false, modify: false, del: false, engRemark: false, exRemark: false },
        { module: 'DOCUMENTATION', add: false, modify: false, del: false, engRemark: false, exRemark: false },
        { module: 'ELOGBOOK', add: true, modify: false, del: false, engRemark: false, exRemark: false },
        { module: 'ENG_LOG', add: false, modify: false, del: false, engRemark: false, exRemark: false },
        { module: 'ENGG_DOC', add: true, modify: true, del: false, engRemark: false, exRemark: false },
        { module: 'EXEC-DOC', add: false, modify: false, del: false, engRemark: false, exRemark: false },
        { module: 'GATEPASS', add: false, modify: false, del: false, engRemark: false, exRemark: false },
        { module: 'IIMS_DOC', add: false, modify: false, del: false, engRemark: false, exRemark: false },
        { module: 'INDENT', add: false, modify: false, del: false, engRemark: false, exRemark: false },
        { module: 'INDUSTRY_INFO', add: false, modify: false, del: false, engRemark: false, exRemark: false },
        { module: 'INSTRUMENT_DATA', add: false, modify: false, del: false, engRemark: false, exRemark: false },
        { module: 'ISO', add: false, modify: false, del: false, engRemark: false, exRemark: false },
        { module: 'JBDETAIL', add: false, modify: false, del: false, engRemark: false, exRemark: false },
        { module: 'JOB_HISTORY', add: true, modify: false, del: false, engRemark: false, exRemark: false },
        { module: 'JOB_LIST', add: false, modify: false, del: false, engRemark: false, exRemark: false },
        { module: 'LAB_JOBREGISTER', add: true, modify: false, del: false, engRemark: false, exRemark: false },
        { module: 'MRS', add: false, modify: false, del: false, engRemark: false, exRemark: false },
        { module: 'OFF_LOGBOOK', add: false, modify: false, del: false, engRemark: false, exRemark: false },
        { module: 'OHSAS', add: false, modify: false, del: false, engRemark: false, exRemark: false },
        { module: 'PMFORM', add: true, modify: false, del: false, engRemark: false, exRemark: false },
        { module: 'POST', add: true, modify: false, del: false, engRemark: false, exRemark: false },
        { module: 'SPPADMIN', add: false, modify: false, del: false, engRemark: false, exRemark: false },
        { module: 'SYSTEM_PM', add: true, modify: true, del: false, engRemark: false, exRemark: false },
        { module: 'TESTEQUIPMENT', add: false, modify: false, del: false, engRemark: false, exRemark: false },
        { module: 'TRAINING_DETAIL', add: false, modify: false, del: false, engRemark: false, exRemark: false },
        { module: 'UTILITY', add: false, modify: false, del: false, engRemark: false, exRemark: false },
        { module: 'VENDORDETAIL', add: false, modify: true, del: false, engRemark: false, exRemark: false }
    ];

    const defaultPrivilegeRowsIeSie = [
        { module: 'Module', add: false, modify: false, del: false, engRemark: false, exRemark: false }
    ];

    // ── User Privilege Rows ──
    const userPrivilegeRows = [
        { ec: '4985', name: 'ABC', group: 'Tech' },
        { ec: '0491', name: 'ABG', group: 'Tech' },
        { ec: '7366', name: 'abhay', group: 'Tech' },
        { ec: '2546', name: 'ABO', group: 'R&D' },
        { ec: '8215', name: 'AIP', group: 'Tech' },
        { ec: '7369', name: 'akshay', group: 'Tech' },
        { ec: '5954', name: 'AKV', group: 'SM' },
        { ec: '7365', name: 'ALD', group: 'Tech' },
        { ec: '5410', name: 'ALS', group: 'Tech' },
        { ec: '2895', name: 'AMV', group: 'Tech' },
        { ec: '9361', name: 'ANP', group: 'IE/SIE' },
        { ec: '10856', name: 'ARP', group: 'IE/SIE' },
        { ec: '2091', name: 'ATH', group: 'SM' },
        { ec: '6138', name: 'ATL', group: 'Tech' },
        { ec: '5470', name: 'AVP', group: 'IE/SIE' },
        { ec: '7355', name: 'balbhadra', group: 'IE/SIE' },
        { ec: '5936', name: 'BDR', group: 'Tech' },
        { ec: '2892', name: 'BPB', group: 'SM' },
        { ec: '4964', name: 'BSU', group: 'Tech' },
        { ec: '8292', name: 'CBP', group: 'Tech' },
        { ec: '9408', name: 'CHIRAG VARIA', group: 'IE/SIE' },
        { ec: '0430', name: 'C-LAB', group: 'CLAB' },
        { ec: '7478', name: 'CNJ_ISD', group: 'Tech' },
        { ec: '5659', name: 'CRV', group: 'Tech' },
        { ec: '2454', name: 'DBS', group: 'TS' },
        { ec: '5910', name: 'DCS', group: 'Tech' },
        { ec: '5916', name: 'DKL', group: 'Tech' },
        { ec: '10854', name: 'DKV', group: 'IE/SIE' },
        { ec: '9981', name: 'DMP', group: 'Tech' },
        { ec: '6255', name: 'DNC', group: 'Tech' },
        { ec: '7440', name: 'DVS', group: 'Tech' }
    ];

    // ── Group Options & Group-Code Map ──
    const userInfoGroupOptions = [
        'Tech', 'IE/SIE', 'M', 'SM', 'CM', 'AGM', 'GM', 'IED',
        'GAT', 'DAT', 'GUEST', 'VISITOR', 'TS', 'CLAB', 'R&D',
        'IAT', 'OVS', 'PURCHASE'
    ];

    const userInfoGroupCodeMap = {
        TECH: 1, 'IE/SIE': 2, M: 3, SM: 4, CM: 12, AGM: 13, GM: 14,
        IED: 17, GAT: 18, DAT: 19, GUEST: 23, VISITOR: 24, TS: 25,
        CLAB: 26, 'R&D': 27, IAT: 28, OVS: 29, PURCHASE: 30
    };

    // ── User Info Rows (derived from privilege rows) ──
    const userInfoRows = userPrivilegeRows.map(row => ({
        ec: row.ec, userName: row.name, password: '', group: row.group
    }));

    // ── User Plants Lookup Seed ──
    const userPlantsLookupSeedRows = [
        { ec: '0', userName: 'GUEST', group: 'GUEST' },
        { ec: '430', userName: 'C-LAB', group: 'CLAB' },
        { ec: '1192', userName: 'SAS', group: 'GUEST' },
        { ec: '1682', userName: 'PNV', group: 'SM' },
        { ec: '2091', userName: 'ATH', group: 'SM' },
        { ec: '2454', userName: 'DBS', group: 'TS' },
        { ec: '2533', userName: 'MAD', group: 'SM' },
        { ec: '2546', userName: 'ABO', group: 'R&D' },
        { ec: '2729', userName: 'HRK', group: 'Tech' },
        { ec: '2809', userName: 'LBK', group: 'Tech' },
        { ec: '2891', userName: 'PMP', group: 'M' },
        { ec: '2892', userName: 'BPB', group: 'SM' },
        { ec: '2895', userName: 'AMV', group: 'Tech' },
        { ec: '3039', userName: 'JMD', group: 'Tech' },
        { ec: '3096', userName: 'MNP', group: 'Tech' },
        { ec: '3098', userName: 'NRK', group: 'Tech' },
        { ec: '3101', userName: 'HPM', group: 'M' },
        { ec: '3126', userName: 'VVK', group: 'GUEST' },
        { ec: '3169', userName: 'DVP', group: 'M' },
        { ec: '3174', userName: 'SBP', group: 'Tech' },
        { ec: '3182', userName: 'RKP', group: 'AGM' },
        { ec: '3183', userName: 'PVS', group: 'Tech' },
        { ec: '3718', userName: 'PSG', group: 'Tech' },
        { ec: '3744', userName: 'RDC', group: 'M' },
        { ec: '4028', userName: 'RJP', group: 'Tech' },
        { ec: '4560', userName: 'RVP', group: 'IE/SIE' },
        { ec: '4964', userName: 'BSU', group: 'Tech' },
        { ec: '4985', userName: 'ABC', group: 'Tech' },
        { ec: '5070', userName: 'KSP', group: 'SM' }
    ];

    // ── User Plants Privilege Plant Rows ──
    const userPlantsPrivilegePlantRows = [
        { name: 'ACETIC ACID', code: 'AA' },
        { name: 'AAQM', code: 'AAQM' },
        { name: 'AMMONIA', code: 'AMM' },
        { name: 'ANIP FILLING', code: 'ANIPF' },
        { name: 'ANITDI', code: 'ANITDI' },
        { name: 'ASGP', code: 'ASGP' },
        { name: 'BAGGING', code: 'BAGG' },
        { name: 'BOILER', code: 'BOILER' },
        { name: 'CLAB', code: 'CLAB' },
        { name: 'CMS', code: 'CMS' },
        { name: 'CPSU', code: 'CPSU' },
        { name: 'DM', code: 'DM' },
        { name: 'ETHYL ACETATE', code: 'EA' },
        { name: 'ENG_LOG', code: 'ENG_LOG' },
        { name: 'FORMIC ACID', code: 'FA' },
        { name: 'INCS', code: 'INCS' },
        { name: 'INST_WS', code: 'INSTWS' },
        { name: 'ISO', code: 'ISO' },
        { name: 'METHANOL-1', code: 'M1' },
        { name: 'METHANOL-2', code: 'M2' },
        { name: 'MINMAX', code: 'MINMAX' },
        { name: 'NITRO PHOSPHATE', code: 'NPP' },
        { name: 'OFF_LOGBOOK', code: 'OFFLOG' },
        { name: 'PURCHASE', code: 'PURCHASE' },
        { name: 'R&D', code: 'R&D' },
        { name: 'SPP', code: 'SPP' },
        { name: 'STORE', code: 'STORE' },
        { name: 'UREA', code: 'UREA' },
        { name: 'UTILITY', code: 'UTILITY' },
        { name: 'UTILITY DOC', code: 'UTILDOC' }
    ];

    // ── Plant Master ──
    const plantMasterRows = [
        { code: 'AA', name: 'ACETIC ACID' },
        { code: 'AAQM', name: 'AAQM' },
        { code: 'AMM', name: 'AMMONIA' },
        { code: 'ANIPF', name: 'ANIF FILLING' },
        { code: 'ANITDI', name: 'ANITDI' },
        { code: 'ASGP', name: 'ASGP' },
        { code: 'MINMAX', name: 'MINMAX' },
        { code: 'NPP', name: 'NITRO PHOSPHATE' },
        { code: 'OFFLOG', name: 'OFF_LOGBOOK' },
        { code: 'PURCHASE', name: 'PURCHASE' },
        { code: 'R&D', name: 'R&D' },
        { code: 'SPP', name: 'SPP' },
        { code: 'STORE', name: 'STORE' },
        { code: 'UREA', name: 'UREA' },
        { code: 'UTILDOC', name: 'UTILITY DOCUMENTS' },
        { code: 'UTILITY', name: 'UTILITY' }
    ];

    // ── Module Master (derived from privilege rows) ──
    const moduleMasterRows = Array.from(new Set(defaultPrivilegeRowsTech.map(r => r.module)))
        .map(module => ({ module }));

    // ── Runtime State Maps ──
    const userPlantsPrivilegeByEc = new Map();
    const userEmailByEc = new Map();
    const userPasswordByEc = new Map();
    const adminMemberEcSet = new Set();

    // ── Mail Schedule ──
    const MAIL_SCHEDULE_TO_OPTIONS = ['All', 'Tech', 'IE/SIE', 'SM', 'M', 'CM', 'AGM', 'GM'];
    const MAIL_SCHEDULE_SENDER_OPTIONS = ['noreply@gnfc.in', 'instrument@gnfc.in', 'admin@gnfc.in'];
    const DEFAULT_MAIL_SCHEDULE_ROWS = [
        {
            id: 'monthly-po-report', title: 'MONTHLY PO REPORT', nextDue: '26/02/2026',
            toType: 'All', toAddress: '', sender: 'noreply@gnfc.in', frequencyDays: '0',
            onDay: '', onMonth: '', onYear: '', report: 'PO REPORT',
            subject: 'Monthly PO Report', message: ''
        }
    ];
    const DEFAULT_WHATS_NEW_TEXT = `<FONT COLOR=blue><I><b>GST CALCULATIONS ADDED IN INDENT MODULE\n<BR>\nCPCB MODLE IS DEVELOPED TO MAINTAIN CALIBRATION RECORDS OF CPCB RELATED INSTRUMENTS.</b></I></FONT>`;

    // ── Login Info Seeds ──
    const LOGIN_INFO_LAST_LOGIN_SEED = [
        '29/01/2026 23:38:59', '23/02/2026 13:43:33', '16/03/2010 14:59:22',
        '13/03/2024 16:16:12', '03/06/2017 09:22:56', '16/02/2022 16:21:48',
        '23/02/2026 14:50:31', '24/01/2026 10:38:51', '22/02/2026 16:41:34',
        '23/02/2026 10:29:50', '23/02/2026 08:22:30', '23/02/2026 14:00:20',
        '23/02/2026 14:48:12', '23/02/2026 14:12:29', '21/02/2026 16:24:00',
        '23/02/2026 09:19:54', '23/02/2026 08:44:35', '17/11/2012 14:31:56',
        '23/02/2026 08:30:48', '23/02/2026 09:27:38', '23/02/2026 14:31:19',
        '21/02/2026 15:21:11', '23/02/2026 13:47:52', '22/02/2026 11:12:08',
        '22/02/2026 10:43:17', '23/02/2026 12:32:04', '23/02/2026 07:55:26',
        '23/02/2026 10:12:42', '23/02/2026 09:58:31'
    ];
    const LOGIN_INFO_MACHINE_SEED = [
        '10.10.67.161', '10.10.75.25', '10.10.81.92', '10.10.80.66',
        '10.10.80.173', '10.10.90.37', '10.10.74.40', '10.10.112.78',
        '10.10.90.37', '10.10.92.23', '10.10.94.49', '10.10.91.31',
        '10.10.92.23', '10.10.94.37', '10.10.70.25', '10.10.95.35',
        '10.10.71.61', '10.10.81.73', '10.10.93.105', '10.10.90.95',
        '10.10.74.49', '10.10.94.37', '10.10.90.42', '10.10.89.11',
        '10.10.79.52', '10.10.84.11', '10.10.90.12', '10.10.95.77',
        '10.10.93.64'
    ];
    const LOGIN_INFO_HIT_COUNT_SEED = [
        32, 3650, 6, 201, 4, 51, 14424, 40, 13629, 14767,
        16327, 12640, 12284, 13826, 14761, 16228, 15607, 452, 17531, 18903,
        6807, 13346, 15890, 10244, 9410, 16724, 19911, 8735, 11052
    ];

    // ── Storage Keys ──
    const STORAGE_KEYS = {
        LOGIN_POPUP: 'gnfc_admin_login_popup_enabled',
        WHATS_NEW: 'gnfc_admin_whats_new_text',
        MAIL_SCHEDULE: 'gnfc_admin_mail_schedule_rows'
    };

    // ── Runtime State ──
    let adminCurrentPassword = 'admin';
    let adminLoginPopupSelection = 'no';
    let whatsNewContent = '';
    let mailScheduleRows = [];
    let mailScheduleMode = 'list';
    let mailScheduleEditingId = '';
    let mailScheduleDraft = null;
    let exDmsSelectedUserEc = '3182';

    return {
        privilegeMasterRows,
        defaultPrivilegeRowsTech,
        defaultPrivilegeRowsIeSie,
        userPrivilegeRows,
        userInfoGroupOptions,
        userInfoGroupCodeMap,
        userInfoRows,
        userPlantsLookupSeedRows,
        userPlantsPrivilegePlantRows,
        plantMasterRows,
        moduleMasterRows,
        userPlantsPrivilegeByEc,
        userEmailByEc,
        userPasswordByEc,
        adminMemberEcSet,
        MAIL_SCHEDULE_TO_OPTIONS,
        MAIL_SCHEDULE_SENDER_OPTIONS,
        DEFAULT_MAIL_SCHEDULE_ROWS,
        DEFAULT_WHATS_NEW_TEXT,
        LOGIN_INFO_LAST_LOGIN_SEED,
        LOGIN_INFO_MACHINE_SEED,
        LOGIN_INFO_HIT_COUNT_SEED,
        STORAGE_KEYS,

        // Getters/Setters for runtime state
        get adminCurrentPassword() { return adminCurrentPassword; },
        set adminCurrentPassword(v) { adminCurrentPassword = v; },
        get adminLoginPopupSelection() { return adminLoginPopupSelection; },
        set adminLoginPopupSelection(v) { adminLoginPopupSelection = v; },
        get whatsNewContent() { return whatsNewContent; },
        set whatsNewContent(v) { whatsNewContent = v; },
        get mailScheduleRows() { return mailScheduleRows; },
        set mailScheduleRows(v) { mailScheduleRows = v; },
        get mailScheduleMode() { return mailScheduleMode; },
        set mailScheduleMode(v) { mailScheduleMode = v; },
        get mailScheduleEditingId() { return mailScheduleEditingId; },
        set mailScheduleEditingId(v) { mailScheduleEditingId = v; },
        get mailScheduleDraft() { return mailScheduleDraft; },
        set mailScheduleDraft(v) { mailScheduleDraft = v; },
        get exDmsSelectedUserEc() { return exDmsSelectedUserEc; },
        set exDmsSelectedUserEc(v) { exDmsSelectedUserEc = v; },
    };
})();
