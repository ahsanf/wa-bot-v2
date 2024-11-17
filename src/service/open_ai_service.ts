import OpenAI from "openai"
import { config } from "../config/config"
import { IncomingMessage } from "http"

export class OpenAIService {
  private openApiKey = config.openAiApiKey
  private openAiOrganization = config.openAiOrganization
  private openAi: OpenAI

  constructor() {
    this.openAi = new OpenAI({
      apiKey: this.openApiKey,
      organization: this.openAiOrganization
    })
  }
  async mappingCommand(command: string, args: string): Promise<string> {
    switch (command) {
      case 'gpt':
        return await this.sendQuestionAnswer(args)
      case 'stream':
        return await this.streamChat(args)
      default:
        return 'Command not found!'
    }
  }

  async sendQuestionAnswer(message: string): Promise<string>{
    try {
      const response = await this.openAi.chat.completions.create({
        messages: [{
          role: 'user',
          content: message
        }],
        model: 'gpt-3.5-turbo',
      })
      return response.choices[0].message.content ?? ''
    } catch (error: any) {
      return `Whoops, something went wrong! ${error.message}`
    }
  }

  async streamChat(message: string): Promise<string>{
    throw new Error('Method not implemented.')
    try {
      const completion = await this.openAi.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: message }],
        stream: true,
    });

      const stream = completion as unknown as IncomingMessage;

      stream.on('data', (chunk: Buffer) => {
          const payloads = chunk.toString().split("\n\n");
          for (const payload of payloads) {
              if (payload.includes('[DONE]')) return;
              if (payload.startsWith("data:")) {
                  const data = JSON.parse(payload.replace("data: ", ""));
                  try {
                      const chunk: undefined | string = data.choices[0].delta?.content;
                      if (chunk) {
                          console.log(chunk);
                      }
                  } catch (error) {
                      console.log(`Error with JSON.parse and ${payload}.\n${error}`);
                  }
              }
          }
      });

      stream.on('end', () => {
          setTimeout(() => {
              console.log('\nStream done');
              
          }, 10);
      });
  
    } catch (error: any) {
      return `Whoops, something went wrong! ${error.message}`
    }
   
  }
}