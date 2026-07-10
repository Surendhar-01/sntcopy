import { SettingsService } from './settings.service';
export declare class SettingsController {
    private readonly settingsService;
    constructor(settingsService: SettingsService);
    findOne(): Promise<any>;
    update(body: any): Promise<{
        success: boolean;
        id: any;
        settings: {
            gst: any;
            shop: any;
            addr: any;
            gstin: any;
            fssai: any;
            phone: any;
        };
    }>;
}
