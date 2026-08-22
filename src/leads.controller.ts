import { BadRequestException, Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { interpolate, DEFAULT_TEMPLATE } from './interpolate.util';

const VALID_STATUSES = ['PENDING', 'DM_SENT', 'SKIPPED', 'REPLIED'];

// The pipeline itself — ported from leadMarketing's app/api/instagram-leads
// /route.ts (status filter incl. "PENDING matches null too", q search over
// name/country/city) generalized off its phase-6-only scoping.
@Controller('leads')
export class LeadsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async findAll(
    @Query('page') page = '1',
    @Query('limit') limit = '20',
    @Query('status') status?: string,
    @Query('q') q?: string,
  ) {
    const take = +limit;
    const skip = (+page - 1) * take;
    const where: any = { deletedAt: null };
    if (status === 'PENDING') where.instagramStatus = 'PENDING';
    else if (status) where.instagramStatus = status;
    if (q) {
      where.OR = [
        { name: { contains: q } },
        { country: { contains: q } },
        { city: { contains: q } },
      ];
    }
    const [data, total] = await Promise.all([
      this.prisma.lead.findMany({ where, skip, take, orderBy: { createdAt: 'desc' } }),
      this.prisma.lead.count({ where }),
    ]);
    return { data, total, page: +page, limit: take };
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.prisma.lead.findUnique({ where: { id: +id } });
  }

  @Post()
  create(@Body() body: any) {
    const { name, category, city, country, website, instagramUrl } = body;
    if (!name) throw new BadRequestException('name is required');
    return this.prisma.lead.create({ data: { name, category, city, country, website, instagramUrl } });
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: any) {
    const data: any = {};
    for (const key of ['name', 'category', 'city', 'country', 'website', 'instagramUrl']) {
      if (body[key] !== undefined) data[key] = body[key];
    }
    return this.prisma.lead.update({ where: { id: +id }, data });
  }

  // Ported from instagram-leads/route.ts's PATCH — same status-transition
  // side effects (instagramDmAt set on DM_SENT, cleared on PENDING/undo).
  @Post(':id/status')
  update_status(@Param('id') id: string, @Body() body: { status: string }) {
    if (!VALID_STATUSES.includes(body.status)) throw new BadRequestException(`status must be one of ${VALID_STATUSES.join(', ')}`);
    return this.prisma.lead.update({
      where: { id: +id },
      data: {
        instagramStatus: body.status,
        instagramDmAt: body.status === 'DM_SENT' ? new Date() : body.status === 'PENDING' ? null : undefined,
      },
    });
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.prisma.lead.update({ where: { id: +id }, data: { deletedAt: new Date() } });
  }

  // New — no equivalent in the source (which has no DM message builder at
  // all). Same "Copy Email"-style workflow as Warmup-as-a-Service's
  // /compose: interpolated preview, human copies and pastes into Instagram.
  @Get(':id/compose')
  async compose(@Param('id') id: string, @Query('templateId') templateId?: string) {
    const lead = await this.prisma.lead.findUnique({ where: { id: +id } });
    if (!lead) throw new BadRequestException('Lead not found');

    let template: { id: number | null; body: string };
    if (templateId) {
      const t = await this.prisma.dmTemplate.findUnique({ where: { id: +templateId } });
      if (!t) throw new BadRequestException('Template not found');
      template = t;
    } else {
      template = { id: null, body: DEFAULT_TEMPLATE.body };
    }

    return { templateId: template.id, body: interpolate(template.body, lead) };
  }
}
