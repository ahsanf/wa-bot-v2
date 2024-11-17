import dotenv from "dotenv"

dotenv.config();

const API_URL = process.env.API_URL ?? ''
const OPENAI_API_KEY = process.env.OPENAI_API_KEY ?? ''
const OPENAI_ORGANIZATION = process.env.OPENAI_ORGANIZATION ?? ''
const PERMSSION_LIST = process.env.PERMISSION_LIST ?? ''
const COMMAND_LIST = process.env.COMMAND_LIST ?? ''
const KARISMA_GROPUP_ID = process.env.KARISMA_GROUP_ID ?? ''
const PUBLIC_COMMAND_LIST = process.env.PUBLIC_COMMAND_LIST ?? ''
const CLIENT_REMOTE_PATH = process.env.CLIENT_REMOTE_PATH ?? ''

export const config = {
  apiUrl: API_URL,
  openAiApiKey: OPENAI_API_KEY,
  openAiOrganization: OPENAI_ORGANIZATION,
  permissionList: PERMSSION_LIST.split(','),
  commandList: COMMAND_LIST.split(','),
  publicCommandList: PUBLIC_COMMAND_LIST.split(','),
  karismaGroupId: KARISMA_GROPUP_ID,
  clientRemotePath: CLIENT_REMOTE_PATH
}