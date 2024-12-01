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
  broadcastInventoryUpdate(inventoryCount: number) {
    this.server.emit('inventoryUpdate', inventoryCount);
  }

  // Emitir un evento de prueba cada 5 segundos
  emitTestEvent() {
    setInterval(() => {
      this.server.emit('inventoryUpdate', { eventId: 1, availableTickets: Math.floor(Math.random() * 100) });
    }, 5000);
  }
}
