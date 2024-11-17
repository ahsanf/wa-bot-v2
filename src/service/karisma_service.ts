import axios from "axios"
import { config } from "../config/config"
import { formatRupiah } from "../util/util"

export class KarismaService {
  private apiUrl: string = config.apiUrl

  async mappingKarismaCommand(args: string): Promise<string> {
    console.log(args)
    let splitCommand = args.slice(args.indexOf(' ') + 1).split('-')
    switch (splitCommand[0]) {
      case 'in':
        return await this.sendIncomeExpense('in', args)
      case 'out':
        return await this.sendIncomeExpense('out', args)
      case 'saldo':
        return await this.checkBalance(args)
      case 'kategori':
        return await this.getCateogryList()
      case 'help':
        return await this.getHelp()
      default:
        return 'Command not found!'
    }
  }

  async sendIncomeExpense(type: string, args: string): Promise<string>{
    let name = args.split('-')[1]
    let amount = args.split('-')[2]
    let category = args.split('-')[3]

    try {
      const response = await axios.post(`${this.apiUrl}/karisma/store-financial`, {
        name,
        amount,
        type,
        category
      })
      return response.data.message
    } catch (error: any) {
      return `Whoops, something went wrong! ${error.message}`
    }
   
  }

  async checkBalance(args: string): Promise<string> {
    let categoryId = args.split('-')[1]

    try {
      const response = await axios.get(`${this.apiUrl}/karisma/get-financial-recap?financial_category_id[]=${categoryId}`, {
        headers: {
          Accept: 'application/json'
        }
      })

      const jsonObject = JSON.parse(JSON.stringify(response.data))
  
      return `Kategori: ${jsonObject.data.category}\nJumlah Pengeluaran: ${formatRupiah(parseInt(jsonObject.data.total_expense))}\nJumlah Pemasukan: ${formatRupiah(parseInt(jsonObject.data.total_income))}\nSaldo: ${formatRupiah(parseInt(jsonObject.data.total_balance))}`
    } catch (error: any) {
      return `Whoops, something went wrong! ${error}`
    }
  }

  async getCateogryList(): Promise<string> {
    try {
      const response = await axios.get(`${this.apiUrl}/karisma/get-financial-category`, {
        headers: {
          Accept: 'application/json'
        }
      })
      const jsonObject = JSON.parse(JSON.stringify(response.data))
      const finalCategory: string[] = []
  
      jsonObject.data.forEach((value: any) => {
          finalCategory.push(` \nId Kategori: ${value.id} \nNama Kategori: ${value.category_name} \n`);
      })
  
      return finalCategory.join('')
    } catch (error: any) {
      return `Whoops, something went wrong! ${error}`
      
    }
  }

  async getHelp(): Promise<string> {
    return `List Command Karisma\n\n!karisma kategori\n!karisma {tipe}-{nama}-{jumlah}-{kategori}\ncontoh=!karisma out-Tika beli bakso-10000-4\n!karisma saldo-{kategori}\n`;
  }
}