import { config } from '../config/config'

export function buildTicketWarReply(originalBody: string): string {
    let result = originalBody

    // Replace participant form block:
    // matches from "1. Nama p(s)erta" through end of "Keterangan : ..." line
    const participantFilled =
        `1. Nama pserta : ${config.ticketWarParticipant1Name}\n` +
        `Tgl lahir: ${config.ticketWarParticipant1Dob}\n` +
        `Jenis kelamin : ${config.ticketWarParticipant1Gender}\n` +
        `No WA : ${config.ticketWarParticipant1Wa}\n` +
        `2. Nama peserta : ${config.ticketWarParticipant2Name}\n` +
        `Tgl lahir : ${config.ticketWarParticipant2Dob}\n` +
        `Jenis kelamin : ${config.ticketWarParticipant2Gender}\n` +
        `No WA : ${config.ticketWarParticipant2Wa}\n` +
        `3. Dst\n\n` +
        `Email : ${config.ticketWarEmail}\n\n` +
        `Keterangan : ${config.ticketWarKeterangan}`

    result = result.replace(/1\. Nama p[\s\S]+?Keterangan\s*:[^\n]*/, participantFilled)

    // Replace refund bank info (may appear multiple times in the message)
    if (config.ticketWarRefundAccountName || config.ticketWarRefundBankName || config.ticketWarRefundAccountNumber) {
        const refundFilled =
            `✅Nama di REKENING : ${config.ticketWarRefundAccountName}\n` +
            `✅Nama bank : ${config.ticketWarRefundBankName}\n` +
            `✅Nomer rekening : ${config.ticketWarRefundAccountNumber}`

        result = result.replace(/✅Nama di REKENING\s*:[^\n]*\n✅Nama bank\s*:[^\n]*\n✅Nomer rekening\s*:[^\n]*/g, refundFilled)
    }

    return result
}
