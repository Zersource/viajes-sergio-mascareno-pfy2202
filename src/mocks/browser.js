import { setupWorker } from 'msw/browser'
import { crearHandlers } from './handlers.js'
import { BASE } from '../config.js'

export const worker = setupWorker(...crearHandlers(BASE))
