import { Request, ResponseObject, ResponseToolkit } from 'hapi'
import { MojaloopErrorQueueMessage, MojaloopError } from '../types/queueMessages'
import { ErrorInformationObject } from '../types/mojaloop'

export async function create (request: Request, h: ResponseToolkit): Promise<ResponseObject> {
  try {
    request.server.app.logger.info('Quote Errors Controller: Received quote error. quoteId: ' + request.params.ID + ' payload: ' + JSON.stringify(request.payload))

    const message: MojaloopErrorQueueMessage = {
      type: MojaloopError.quote,
      typeId: request.params.ID,
      errorInformation: (request.payload as ErrorInformationObject).errorInformation
    }
    await request.server.app.queueService.addToQueue('ErrorResponses', message)

    return h.response().code(200)
  } catch (error) {
    request.server.app.logger.error(`Quote Errors Controller: Error handling quote error. ${error.message}`)

    return h.response({
      errorInformation: {
        errorCode: '2001',
        errorDescription: 'An internal error occurred.'
      }
    }).code(500)
  }

}
