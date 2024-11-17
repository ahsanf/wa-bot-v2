import { Client } from "whatsapp-web.js";
import { config } from "../config/config";
import { PersonalService } from "../service/personal_service";
import { OpenAIService } from "../service/open_ai_service";
import { KarismaService } from "../service/karisma_service";

export class BotController {
  private client: Client
  private commandList = config.commandList
  private publicCommandList = config.publicCommandList
  private permissionList = config.permissionList
  private karismaGroupId = config.karismaGroupId
  private personalService: PersonalService
  private openAiService: OpenAIService
  private karismaService: KarismaService

  constructor(client: Client) {
    this.client = client
    this.personalService = new PersonalService()
    this.openAiService = new OpenAIService()
    this.karismaService = new KarismaService()
  }

  init(){
    this.client.on('message_create', async (message) => {
      const checkIsCommand = message.body.startsWith('!')
      if(!checkIsCommand) return
      const { body, from } = message
      const command = body.split(' ')[0].split('!')[1]
      const args = body.split(' ').slice(1)
      const isCommand = this.commandList.includes(command)

      if (isCommand && message.fromMe === true) {
        if (command === 'gpt') {
          return message.reply(await this.openAiService.sendQuestionAnswer(args.join(' ')))
        } else if (command === 'karisma'){
          return message.reply(await this.karismaService.mappingKarismaCommand(args.join(' ')))
        } else {
          return message.reply(await this.personalService.mappingPersonalCommand(command, args.join(' ')))
        }
      }
    })

    this.client.on('message', async (message) => {
      const checkIsCommand = message.body.startsWith('!')
      if(!checkIsCommand) return
      const { body, from } = message
      const command = body.split(' ')[0].split('!')[1]
      const args = body.split(' ').slice(1)
      const isCommand = this.publicCommandList.includes(command)

      if(isCommand && this.permissionList.includes(from)){
        if(command === 'karisma' && from === this.karismaGroupId){
          return message.reply(await this.karismaService.mappingKarismaCommand(args.join(' ')))
        } else if (command === 'gpt') {
          return message.reply(await this.openAiService.sendQuestionAnswer(args.join(' ')))
        }
      }
    })
  
  }
    
}