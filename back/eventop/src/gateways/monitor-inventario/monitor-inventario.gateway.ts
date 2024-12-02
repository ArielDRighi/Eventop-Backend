import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class MonitorInventarioGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  afterInit(server: Server) {
    console.log('WebSocket server initialized');
  }

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('message')
  handleMessage(@MessageBody() data: string): string {
    console.log('Message received:', data);
    return 'Message received';
  }

    // Método para transmitir cambios de inventario
    broadcastInventoryUpdate(eventId: number, quantityAvailable: number) {
      console.log(`Emitiendo actualización de inventario: eventId=${eventId}, quantityAvailable=${quantityAvailable}`);
      this.server.emit('inventoryUpdate', { eventId, quantityAvailable });
    }
  }

 