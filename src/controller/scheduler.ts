import * as cron from 'node-cron'
import { Client } from "whatsapp-web.js";
import { config } from '../config/config';

export class SchedulerController {
    private client: Client
    private anniversaryDate: Date
    private weddingDate: Date
    private phoneNumber: string = '6282115025986@c.us'
    // private phoneNumber: string = '6281359888622@c.us'

    constructor(client: Client) {
        this.client = client
        const anniversaryDateString = config.anniversaryDate;
        const weddingDateString = config.weddingDate;
        
        // Parse the dates
        this.anniversaryDate = new Date(anniversaryDateString);
        this.weddingDate = new Date(weddingDateString);
    }

    startScheduler() {
        // Run daily at 9:00 AM to check for special dates
        cron.schedule('0 6 8 * *', async () => {
            const today = new Date();
            // Get dates from environment variables, with fallback defaults
            const anniversaryMessage = this.createAnniversaryMessage(today);
            const weddingCountdownMessage = this.createWeddingCountdownMessage();
            
            // Combine both messages
            const combinedMessage = 
                `${anniversaryMessage}\n\n` +
                `---\n\n` +
                `${weddingCountdownMessage}`;
            
            await this.sendMessage(combinedMessage);
            
        });
    }

    private createAnniversaryMessage(today: Date): string {
        const monthsPassed = this.calculateMonthsDifference(this.anniversaryDate, today);
        
        return `❤️ *Happy ${monthsPassed}${this.getOrdinalSuffix(monthsPassed)} Month Anniversary Sayanngku!* ❤️\n\n` +
               `Sudah ${monthsPassed} bulan kita bersama sejak tanggal 8 Maret 2025.\n` +
               `Aku sayang kamu! 💕`;
    }

    private createWeddingCountdownMessage(): string {
        const today = new Date();
        const daysLeft = this.calculateDaysLeft(today, this.weddingDate);
        
        if (daysLeft < 0) {
            // Wedding has already occurred
            const daysPassed = Math.abs(daysLeft);
            return `💍 *Wedding Anniversary Update* 💍\n\n` +
                   `Kita sudah menikah selama ${daysPassed} hari! 💑👰‍♀️🤵‍♂`;
        } else if (daysLeft === 0) {
            // Wedding day
            return `💍 *HARI PERNIKAHAN KITA!* 💍\n\n` +
                   `Hari ini adalah hari yang sangat spesial bagi kita!\n` +
                   `Selamat menikah untuk kita! 👰‍♀️🤵‍♂`;
        } else {
            // Countdown
            return `💍 *Wedding Countdown* 💍\n\n` +
                   `${daysLeft} hari lagi menuju pernikahan kita tanggal 26 Maret 2025!\n` +
                   `Aku tidak sabar untuk menghabiskan sisa hidupku bersamamu! 💕`;
        }
    }

    private calculateMonthsDifference(startDate: Date, endDate: Date): number {
        let months = (endDate.getFullYear() - startDate.getFullYear()) * 12;
        months += endDate.getMonth() - startDate.getMonth();
        
        // If the day of the month in endDate is less than the day in startDate,
        // and we're not exactly on the anniversary day, subtract one month
        if (endDate.getDate() < startDate.getDate() && endDate.getDate() !== startDate.getDate()) {
            months--;
        }
        
        return months;
    }

    private calculateDaysLeft(today: Date, targetDate: Date): number {
        const oneDay = 24 * 60 * 60 * 1000; // milliseconds in one day
        
        // Reset time portion for accurate day calculation
        const todayNoTime = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const targetNoTime = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
        
        // Calculate days difference
        return Math.round((targetNoTime.getTime() - todayNoTime.getTime()) / oneDay);
    }

    private getOrdinalSuffix(num: number): string {
        if (num <= 0) return '';
        
        const j = num % 10;
        const k = num % 100;
        
        if (j === 1 && k !== 11) {
            return 'st';
        }
        if (j === 2 && k !== 12) {
            return 'nd';
        }
        if (j === 3 && k !== 13) {
            return 'rd';
        }
        return 'th';
    }

    startTicketWarScheduler() {
        const { ticketWarEnabled, ticketWarPhoneNumber, ticketWarDate, ticketWarTime, ticketWarMessage } = config

        if (!ticketWarEnabled || !ticketWarPhoneNumber || !ticketWarDate || !ticketWarTime) {
            console.log('Ticket war scheduler disabled or missing config, skipping.')
            return
        }

        const [year, month, day] = ticketWarDate.split('-').map(Number)
        const timeParts = ticketWarTime.split(':').map(Number)
        const [hour, minute] = timeParts
        const targetSecond = timeParts[2] ?? 0

        // cron: minute hour day-of-month month *
        const cronExpression = `${minute} ${hour} ${day} ${month} *`

        cron.schedule(cronExpression, () => {
            const nowJakarta = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }))
            if (nowJakarta.getFullYear() !== year) return

            // Use setTimeout to hit the exact second within this minute
            const elapsedMs = nowJakarta.getSeconds() * 1000 + nowJakarta.getMilliseconds()
            const delay = Math.max(0, targetSecond * 1000 - elapsedMs)

            setTimeout(async () => {
                // Log before send — this timestamp reflects when message is initiated
                console.log('Ticket war sending at', new Date().toISOString())
                try {
                    await this.client.sendMessage(`${ticketWarPhoneNumber}@c.us`, ticketWarMessage)
                    console.log('Ticket war acknowledged at', new Date().toISOString())
                } catch (error) {
                    console.error('Failed to send ticket war message:', error)
                }
            }, delay)
        }, { timezone: 'Asia/Jakarta' })

        console.log(`Ticket war scheduler set: send on ${ticketWarDate} at ${ticketWarTime} WIB → cron "${cronExpression}"`)
    }

    private async sendMessage(message: string): Promise<void> {
        try {
            await this.client.sendMessage(this.phoneNumber, message);
            console.log('Message sent successfully on', new Date().toISOString());
        } catch (error) {
            console.error('Failed to send message:', error);
        }
    }
}