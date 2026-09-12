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
const PUPPETEER_EXECUTABLE_PATH = process.env.PUPPETEER_EXECUTABLE_PATH ?? ''
const ANNIVERSARY_DATE = process.env.ANNIVERSARY_DATE ?? '2000-03-08'
const WEDDING_DATE = process.env.WEDDING_DATE ?? '2000-03-26'

const TICKET_WAR_ENABLED = process.env.TICKET_WAR_ENABLED === 'true'
const TICKET_WAR_PHONE_NUMBER = process.env.TICKET_WAR_PHONE_NUMBER ?? ''
const TICKET_WAR_DATE = process.env.TICKET_WAR_DATE ?? ''
const TICKET_WAR_TIME = process.env.TICKET_WAR_TIME ?? ''
const TICKET_WAR_MESSAGE = process.env.TICKET_WAR_MESSAGE ?? ''
const TICKET_WAR_AUTO_REPLY_ENABLED = process.env.TICKET_WAR_AUTO_REPLY_ENABLED === 'true'

const TICKET_WAR_PARTICIPANT_1_PASSPORT = process.env.TICKET_WAR_PARTICIPANT_1_PASSPORT ?? ''
const TICKET_WAR_PARTICIPANT_2_PASSPORT = process.env.TICKET_WAR_PARTICIPANT_2_PASSPORT ?? ''
const TICKET_WAR_PARTICIPANT_1_NAME = process.env.TICKET_WAR_PARTICIPANT_1_NAME ?? ''
const TICKET_WAR_PARTICIPANT_1_DOB = process.env.TICKET_WAR_PARTICIPANT_1_DOB ?? ''
const TICKET_WAR_PARTICIPANT_1_GENDER = process.env.TICKET_WAR_PARTICIPANT_1_GENDER ?? ''
const TICKET_WAR_PARTICIPANT_1_WA = process.env.TICKET_WAR_PARTICIPANT_1_WA ?? ''
const TICKET_WAR_PARTICIPANT_2_NAME = process.env.TICKET_WAR_PARTICIPANT_2_NAME ?? ''
const TICKET_WAR_PARTICIPANT_2_DOB = process.env.TICKET_WAR_PARTICIPANT_2_DOB ?? ''
const TICKET_WAR_PARTICIPANT_2_GENDER = process.env.TICKET_WAR_PARTICIPANT_2_GENDER ?? ''
const TICKET_WAR_PARTICIPANT_2_WA = process.env.TICKET_WAR_PARTICIPANT_2_WA ?? ''
const TICKET_WAR_EMAIL = process.env.TICKET_WAR_EMAIL ?? ''
const TICKET_WAR_KETERANGAN = process.env.TICKET_WAR_KETERANGAN ?? ''
const TICKET_WAR_REFUND_ACCOUNT_NAME = process.env.TICKET_WAR_REFUND_ACCOUNT_NAME ?? ''
const TICKET_WAR_REFUND_BANK_NAME = process.env.TICKET_WAR_REFUND_BANK_NAME ?? ''
const TICKET_WAR_REFUND_ACCOUNT_NUMBER = process.env.TICKET_WAR_REFUND_ACCOUNT_NUMBER ?? ''

export const config = {
  apiUrl: API_URL,
  openAiApiKey: OPENAI_API_KEY,
  openAiOrganization: OPENAI_ORGANIZATION,
  permissionList: PERMSSION_LIST.split(','),
  commandList: COMMAND_LIST.split(','),
  publicCommandList: PUBLIC_COMMAND_LIST.split(','),
  karismaGroupId: KARISMA_GROPUP_ID,
  clientRemotePath: CLIENT_REMOTE_PATH,
  puppeteerExecutablePath: PUPPETEER_EXECUTABLE_PATH || undefined,
  anniversaryDate: ANNIVERSARY_DATE,
  weddingDate: WEDDING_DATE,
  ticketWarEnabled: TICKET_WAR_ENABLED,
  ticketWarPhoneNumber: TICKET_WAR_PHONE_NUMBER,
  ticketWarDate: TICKET_WAR_DATE,
  ticketWarTime: TICKET_WAR_TIME,
  ticketWarMessage: TICKET_WAR_MESSAGE,
  ticketWarAutoReplyEnabled: TICKET_WAR_AUTO_REPLY_ENABLED,
  ticketWarParticipant1Passport: TICKET_WAR_PARTICIPANT_1_PASSPORT,
  ticketWarParticipant2Passport: TICKET_WAR_PARTICIPANT_2_PASSPORT,
  ticketWarParticipant1Name: TICKET_WAR_PARTICIPANT_1_NAME,
  ticketWarParticipant1Dob: TICKET_WAR_PARTICIPANT_1_DOB,
  ticketWarParticipant1Gender: TICKET_WAR_PARTICIPANT_1_GENDER,
  ticketWarParticipant1Wa: TICKET_WAR_PARTICIPANT_1_WA,
  ticketWarParticipant2Name: TICKET_WAR_PARTICIPANT_2_NAME,
  ticketWarParticipant2Dob: TICKET_WAR_PARTICIPANT_2_DOB,
  ticketWarParticipant2Gender: TICKET_WAR_PARTICIPANT_2_GENDER,
  ticketWarParticipant2Wa: TICKET_WAR_PARTICIPANT_2_WA,
  ticketWarEmail: TICKET_WAR_EMAIL,
  ticketWarKeterangan: TICKET_WAR_KETERANGAN,
  ticketWarRefundAccountName: TICKET_WAR_REFUND_ACCOUNT_NAME,
  ticketWarRefundBankName: TICKET_WAR_REFUND_BANK_NAME,
  ticketWarRefundAccountNumber: TICKET_WAR_REFUND_ACCOUNT_NUMBER,
}