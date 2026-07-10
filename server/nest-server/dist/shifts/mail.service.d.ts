interface ShiftReportData {
    user: string;
    role: string;
    shiftStart: string;
    shiftEnd: string;
    shiftStartDisplay: string;
    shiftEndDisplay: string;
    billsCount: number;
    totalItemsSold: number;
    totalSalesAmount: number;
    paymentBreakdown: Record<string, number>;
    remainingStockSummary: any;
}
export declare class MailService {
    private transporter;
    private currentEnvSig;
    private refreshRuntimeMailEnv;
    private initTransporter;
    sendShiftReportEmail(options: {
        recipient: string;
        subject: string;
        text: string;
        html: string;
        attachments?: any[];
    }): Promise<any>;
    buildShiftReportText(report: ShiftReportData): string;
    buildShiftReportHtml({ report, shopName, recipientEmail }: {
        report: ShiftReportData;
        shopName: string;
        recipientEmail: string;
    }): string;
}
export {};
