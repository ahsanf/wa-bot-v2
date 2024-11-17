import axios from "axios";
import { config } from "../config/config";
import { formatRupiah, formatType } from "../util/util";

export class PersonalService {
  private apiUrl: string = config.apiUrl

  async mappingPersonalCommand(command: string, args: string): Promise<string> {
    switch (command) {
      case 'ping':
        return 'Pong!'
      case 'in':
        return await this.insertIncomeExpense(command, args)
      case 'out':
        return await this.insertIncomeExpense(command, args)
      case 'show':
        return await this.showAllReport()
      case 'filter':
        return await this.showReportByFilter(args)
      case 'recap':
        return await this.showReportByYear(args)
      case 'ordered':
        return await this.showReportOrdered(args)
      case 'rekening':
        return await this.sendAccounts()
      case 'alamat':
        return await this.sendAddress()
      case 'help':
        return `List Command\n\n1. in nama-jumlah\n2. out nama-jumlah\n3. show\n4. filter bulan-tahun-keyword\n5. recap tahun\n6. ordered bulan-tahun-tipe\n7. rekening\n8. alamat`
      default:
        return 'Command not found!'
    }
  }

  async insertIncomeExpense(command:string, args: string): Promise<string> {
    try {
      let type = command === 'in' ? 'income' : 'expense'
      let [name, amount] = args.split('-')
      const response = await axios.post(`${this.apiUrl}/personal-finance/store`, {
        name,
        amount,
        type
      })
  
      return response.data.message
    } catch (error: any) {
      return `Whoops, something went wrong! ${error.message}`
    }
   
  }

  async showAllReport(): Promise<string> {
    try {
      const response = await axios.get(`${this.apiUrl}/personal-finance/get-all`, {
        headers: {
          Accept: 'application/json'
        }
      })

      const jsonObject = JSON.parse(JSON.stringify(response.data))
  
      return `Total Pengeluaran: ${jsonObject.data.total_expense}\nTotal Pemasukan: ${jsonObject.data.total_income}`
    } catch (error: any) {
      return `Whoops, something went wrong! ${error.message}`
    }
   

  }

  async showReportByFilter(args: string): Promise<string> {
    try {
      const [month, year, search] = args.split('-')
      const response = await axios.get(`${this.apiUrl}/personal-finance/get`, {
        headers: {
          Accept: 'application/json'
        },
        params: {
          month,
          year,
          search
        }
      })

      return `${response.data.data.message}\nTotal Pengeluaran: ${response.data.data.total_expense}\nTotal Pemasukan: ${response.data.data.total_income}`
    } catch (error: any) {
      return `Whoops, something went wrong! ${error.message}`
    }
  }

  async showReportByYear(args: string): Promise<string> {
    try {
      const response = await axios.get(`${this.apiUrl}/personal-finance/recap`, {
        headers: {
          Accept: 'application/json'
        },
        params: {
          args
        }
      })
      const object = JSON.parse(JSON.stringify(response.data))
      let resultFinal: string[] = [`${object.message}\n`]

      object.data.forEach((value: any) => {
        resultFinal.push(`\nBulan ${value.month_name}\nTotal Pengeluaran: ${value.expense}\nTotal Pemasukan: ${value.income}\n`);
      });

      return resultFinal.join('')
    } catch (error: any) {
      return `Whoops, something went wrong! ${error.message}`
    }
  }

  async showReportOrdered(args: string): Promise<string> {
    try {
      const [month, year, type] = args.split('-')
      const finalType = type === 'all' ? '' : (type === 'in' ? 'income' : 'expense')
      const response = await axios.get(`${this.apiUrl}/personal-finance/ordered`, {
        headers: {
          Accept: 'application/json'
        },
        params: {
          month,
          year,
          type: finalType
        }
      })
      const object = JSON.parse(JSON.stringify(response.data))
      let resultFinal = [`${object.message}\n`]
      object.data.forEach((value: any) => {
        resultFinal.push(`\nNama: ${value.name}\nJumlah: ${formatRupiah(value.amount)}\nTipe: ${formatType(value.type)}\n`);
      });
      return resultFinal.join('')
    } catch (error:any) {
      return `Whoops, something went wrong! ${error.message}`
      
    }
  }

  async sendAccounts(): Promise<string>{
    return `1370016753309 (Mandiri) a.n Ahsan Firdaus\n081359888622 (Dana, OVO, Gopay)\n103755631013 (Bank Jago)\nJagoId: ahsan\n1449627309 (BNI) a.n Ahsan Firdaus`;
  }

  async sendAddress(): Promise<string>{
    return `Alamat\n\nRumah Warna Pink Pagar Hitam\nhttps://goo.gl/maps/2UUcq4rV8bX3twGi8\nKemirisewu RT 006/025, Sidorejo, Godean, Sleman, DIY`
  }
}