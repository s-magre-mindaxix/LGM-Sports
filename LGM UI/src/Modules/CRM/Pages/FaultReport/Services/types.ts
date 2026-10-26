export interface FaultReport {
    id: number;
    device: string;
    customerId: number;
    customerName?: string; // Optional: Usually returned by backend joins for display
    serialNumber: string;
    firmware: string;
    software: string;
    softwareVersion: string;
    specialSoftware: string;
    configuration: string;
    powerSource: string;
    cabelsConnected: string;
    modulesConnected: string;
    modulesFirmware: string;
    voltage: string;
    led: string;
    internalBattery: string;
    gpsBattery: string;
    coldStarted: boolean;
    defaultReset: boolean;
    settingChecked: boolean;
    firmwareUpdated: boolean;
    notes: string;
    comments: string;
    reportDate: string; // ISO string format
    reportFiles?: File[];
    uploadedFiles?: string;
}