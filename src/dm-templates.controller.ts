import { BadRequestException, Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Controller('dm-templates')
export class DmTemplatesController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async findAll() {
    const data = await this.prisma.dmTemplate.findMany({ orderBy: { createdAt: 'desc' } });
    return { data, total: data.length };
  }

  @Post()
  create(@Body() body: any) {
    const { name, body: text } = body;
    if (!name || !text) throw new BadRequestException('name and body are required');
    return this.prisma.dmTemplate.create({ data: { name, body: text } });
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: any) {
    const data: any = {};
    if (body.name !== undefined) data.name = body.name;
    if (body.body !== undefined) data.body = body.body;
    return this.prisma.dmTemplate.update({ where: { id: +id }, data });
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.prisma.dmTemplate.delete({ where: { id: +id } });
  }
}
