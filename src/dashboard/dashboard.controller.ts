import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { Request } from 'express';

@Controller('dashboard')
export class DashboardController {
    constructor(private dashboardService: DashboardService) { }

    @UseGuards(JwtAuthGuard)
    @Get('stats')
    async getStats(@Req() req: Request) {
        const userId = (req.user as any).userId;
        return this.dashboardService.getKpis(userId);
    }
}
