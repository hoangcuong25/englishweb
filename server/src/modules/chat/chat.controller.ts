import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../core/common/guards/jwt-auth.guard';
import { CurrentUser } from '../../core/common/decorators/current-user.decorator';
import { ResponseMessage } from '../../core/common/decorators/response-message.decorator';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { SendMessageDto } from './dto/send-message.dto';

@ApiTags('Realtime Chat & Messaging')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('chat')
export class ChatController {
  constructor(
    private readonly chatService: ChatService,
    private readonly chatGateway: ChatGateway,
  ) {}

  @Get('conversations')
  @ApiOperation({ summary: 'Get conversations list for authenticated user' })
  @ApiResponse({ status: 200, description: 'Conversations list' })
  @ResponseMessage('Lấy danh sách cuộc trò chuyện thành công')
  async getConversations(
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: string,
  ) {
    return this.chatService.getConversations(userId, role);
  }

  @Get('conversations/:id/messages')
  @ApiOperation({ summary: 'Get messages for a conversation' })
  @ApiResponse({ status: 200, description: 'Messages list' })
  @ResponseMessage('Lấy tin nhắn thành công')
  async getMessages(
    @Param('id') conversationId: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: string,
    @Query('take') take?: number,
    @Query('skip') skip?: number,
  ) {
    return this.chatService.getMessages(
      conversationId,
      userId,
      role,
      take ? Number(take) : 50,
      skip ? Number(skip) : 0,
    );
  }

  @Post('conversations/:id/messages')
  @ApiOperation({ summary: 'Send message in conversation via HTTP fallback' })
  @ApiResponse({ status: 201, description: 'Message sent successfully' })
  @ResponseMessage('Gửi tin nhắn thành công')
  async sendMessage(
    @Param('id') conversationId: string,
    @CurrentUser('id') senderId: string,
    @CurrentUser('role') role: string,
    @Body() dto: SendMessageDto,
  ) {
    const message = await this.chatService.sendMessage(
      conversationId,
      senderId,
      role,
      dto.content,
    );

    // Notify realtime listeners
    this.chatGateway.broadcastNewMessage(conversationId, message);

    return message;
  }

  @Put('conversations/:id/read')
  @ApiOperation({ summary: 'Mark messages as read in conversation' })
  @ApiResponse({ status: 200, description: 'Messages marked as read' })
  @ResponseMessage('Đã đánh dấu đã đọc tin nhắn')
  async markAsRead(
    @Param('id') conversationId: string,
    @CurrentUser('id') userId: string,
    @CurrentUser('role') role: string,
  ) {
    return this.chatService.markAsRead(conversationId, userId, role);
  }
}
