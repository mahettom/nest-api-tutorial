import { CreateBookmarkDto, EditBookmarkDto } from './dto';
import { BookmarkService } from './bookmark.service';
import { GetUser } from '../../src/auth/decorator';
import { JwtGuard } from '../auth/guard';
import {
  Get,
  Post,
  Patch,
  Delete,
  Param,
  UseGuards,
  Controller,
  ParseIntPipe,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';

@UseGuards(JwtGuard)
@Controller('bookmarks')
export class BookmarkController {
  constructor(private bookmarkService: BookmarkService) {}
  // ////////////////////////////////////////////////////////////////////////////
  // ////////////////////////////////////////////////////////// GET ALL /////////
  @Get()
  getBookmarks(@GetUser('id') userId: number) {
    return this.bookmarkService.getBookmarks(userId);
  }
  // ////////////////////////////////////////////////////////////////////////////
  // ////////////////////////////////////////////////////////// GET ONE /////////
  @Get(':id')
  getBookmarkById(
    @GetUser('id') userId: number,
    @Param('id', ParseIntPipe) bookmarkId: number,
  ) {
    return this.bookmarkService.getBookmarkById(userId, bookmarkId);
  }

  // ////////////////////////////////////////////////////////////////////////////
  // ////////////////////////////////////////////////////////// POST ////////////
  @Post()
  createBookmark(
    @GetUser('id') userId: number,
    @Body() dto: CreateBookmarkDto,
  ) {
    return this.bookmarkService.createBookmark(userId, dto);
  }
  // ////////////////////////////////////////////////////////////////////////////
  // ////////////////////////////////////////////////////////// PATCH ///////////
  @Patch(':id')
  editBookmarkById(
    @GetUser('id') userId: number,
    @Body() dto: EditBookmarkDto,
    @Param('id', ParseIntPipe) bookmarkId: number,
  ) {
    return this.bookmarkService.editBookmarkById(userId, dto, bookmarkId);
  }
  // ////////////////////////////////////////////////////////////////////////////
  // ////////////////////////////////////////////////////////// DELETE //////////
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  deleteBookmarkById(
    @GetUser('id') userId: number,
    @Param('id', ParseIntPipe) bookmarkId: number,
  ) {
    return this.bookmarkService.deleteBookmarkById(userId, bookmarkId);
  }
}
