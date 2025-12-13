import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ParentService } from '../../../core/services/parent.service';
import { map } from 'rxjs';

@Component({
    selector: 'app-child-class-details',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './child-class-details.html',
    styleUrl: './child-class-details.css'
})
export class ChildClassDetails {
    private route = inject(ActivatedRoute);
    private parentService = inject(ParentService);

    childId = this.route.snapshot.paramMap.get('childId');
    classId = this.route.snapshot.paramMap.get('classId');

    classDetails$ = this.parentService.getChildClassDetails(Number(this.childId), Number(this.classId)).pipe(
        map((details: any) => ({
            ...details,
            calendarDays: this.getCalendarDays(details.scheduleDays || [], details.scheduleTime)
        }))
    );

    getCalendarDays(scheduleDays: string[], scheduleTime: string) {
        const today = new Date();
        const year = today.getFullYear();
        const month = today.getMonth();

        const firstDay = new Date(year, month, 1);
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay());

        const days = [];
        // Normalize schedule days to match locale string (e.g. "Monday")
        const normalizedSchedule = scheduleDays.map(d => d.trim());

        for (let i = 0; i < 42; i++) {
            const currentDate = new Date(startDate);
            currentDate.setDate(currentDate.getDate() + i);

            const dayName = currentDate.toLocaleDateString('en-US', { weekday: 'long' });
            const hasClass = currentDate.getMonth() === month && normalizedSchedule.includes(dayName);

            days.push({
                date: currentDate.toISOString(),
                dayNumber: currentDate.getDate(),
                isCurrentMonth: currentDate.getMonth() === month,
                hasClass: hasClass,
                classTime: hasClass ? (scheduleTime || '09:00 AM') : '',
                location: hasClass ? 'Room 101' : '' // Location could also come from API if available
            });
        }

        return days;
    }
}
