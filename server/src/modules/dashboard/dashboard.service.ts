import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getStudentDashboard(userId: string) {
    const now = new Date();
    const cutoffTime = new Date(now.getTime() - 30 * 60 * 1000);

    // Auto-end expired classrooms past scheduledEndTime by > 30 minutes
    try {
      await this.prisma.classroom.updateMany({
        where: {
          status: { in: ['SCHEDULED', 'ACTIVE'] },
          scheduledEndTime: { lte: cutoffTime },
        },
        data: {
          status: 'ENDED',
          actualEndTime: now,
        },
      });
    } catch {
      // Continue even if update fails
    }

    const [
      enrolledCoursesCount,
      enrollments,
      completedLessonsCount,
      completedQuizzesCount,
      writingSubmissionsCount,
      speakingSubmissionsCount,
      upcomingClassrooms,
      recentWriting,
      recentSpeaking,
      attendanceRecords,
    ] = await Promise.all([
      this.prisma.enrollment.count({ where: { userId } }),
      this.prisma.enrollment.findMany({
        where: { userId },
        include: {
          course: {
            select: {
              id: true,
              title: true,
              slug: true,
              thumbnail: true,
              category: true,
            },
          },
        },
        orderBy: { enrolledAt: 'desc' },
        take: 4,
      }),
      this.prisma.lessonProgress.count({
        where: { userId, isCompleted: true },
      }),
      this.prisma.quizSubmission.count({
        where: { userId, isPassed: true },
      }),
      this.prisma.writingSubmission.count({ where: { userId } }),
      this.prisma.speakingSubmission.count({ where: { userId } }),
      this.prisma.classroom.findMany({
        where: {
          status: { in: ['SCHEDULED', 'ACTIVE'] },
          scheduledEndTime: { gt: cutoffTime },
        },
        orderBy: { scheduledStartTime: 'asc' },
        take: 3,
        include: {
          host: { select: { fullName: true } },
          course: { select: { title: true } },
        },
      }),
      this.prisma.writingSubmission.findMany({
        where: { userId },
        orderBy: { submittedAt: 'desc' },
        take: 3,
        include: {
          prompt: { select: { title: true, taskType: true } },
        },
      }),
      this.prisma.speakingSubmission.findMany({
        where: { userId },
        orderBy: { submittedAt: 'desc' },
        take: 3,
        include: {
          prompt: { select: { title: true, topic: true } },
        },
      }),
      this.prisma.attendanceRecord.findMany({
        where: { studentId: userId },
        include: {
          classroom: {
            select: { name: true, scheduledStartTime: true },
          },
        },
      }),
    ]);

    const totalProgress = enrollments.reduce((acc, curr) => acc + (curr.progressPercent || 0), 0);
    const averageProgress = enrollments.length > 0 ? Math.round((totalProgress / enrollments.length) * 10) / 10 : 0;

    const presentCount = attendanceRecords.filter((a) => a.status === 'PRESENT').length;
    const lateCount = attendanceRecords.filter((a) => a.status === 'LATE').length;
    const absentCount = attendanceRecords.filter((a) => a.status === 'ABSENT').length;

    return {
      overview: {
        enrolledCoursesCount,
        averageProgress,
        completedLessonsCount,
        completedQuizzesCount,
        writingSubmissionsCount,
        speakingSubmissionsCount,
      },
      recentCourses: enrollments.map((e) => ({
        id: e.course.id,
        title: e.course.title,
        slug: e.course.slug,
        thumbnail: e.course.thumbnail,
        category: e.course.category,
        progressPercent: e.progressPercent,
        enrolledAt: e.enrolledAt,
      })),
      upcomingClassrooms,
      recentWriting,
      recentSpeaking,
      attendanceSummary: {
        totalSessions: attendanceRecords.length,
        present: presentCount,
        late: lateCount,
        absent: absentCount,
      },
    };
  }

  async getAdminDashboard() {
    const now = new Date();
    const cutoffTime = new Date(now.getTime() - 30 * 60 * 1000);

    // Auto-end expired classrooms past scheduledEndTime by > 30 minutes
    try {
      await this.prisma.classroom.updateMany({
        where: {
          status: { in: ['SCHEDULED', 'ACTIVE'] },
          scheduledEndTime: { lte: cutoffTime },
        },
        data: {
          status: 'ENDED',
          actualEndTime: now,
        },
      });
    } catch {
      // Continue even if update fails
    }

    const [
      totalStudents,
      totalCourses,
      totalLessons,
      totalClassrooms,
      totalWritingSubmissions,
      totalSpeakingSubmissions,
      pendingWritingApprovals,
      pendingSpeakingGradings,
      recentStudents,
      activeOrUpcomingClassrooms,
      attendanceStatusGroups,
      recentWritingSubmissions,
      recentSpeakingSubmissions,
    ] = await Promise.all([
      this.prisma.user.count({ where: { role: 'STUDENT' } }),
      this.prisma.course.count(),
      this.prisma.lesson.count(),
      this.prisma.classroom.count(),
      this.prisma.writingSubmission.count(),
      this.prisma.speakingSubmission.count(),
      this.prisma.writingSubmission.count({
        where: { status: 'AI_EVALUATED' },
      }),
      this.prisma.speakingSubmission.count({
        where: { status: 'PENDING' },
      }),
      this.prisma.user.findMany({
        where: { role: 'STUDENT' },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          email: true,
          fullName: true,
          phone: true,
          isActive: true,
          createdAt: true,
        },
      }),
      this.prisma.classroom.findMany({
        where: {
          status: { in: ['ACTIVE', 'SCHEDULED'] },
          scheduledEndTime: { gt: cutoffTime },
        },
        orderBy: { scheduledStartTime: 'asc' },
        take: 5,
        include: {
          host: { select: { fullName: true } },
          course: { select: { title: true } },
          _count: { select: { attendanceRecords: true } },
        },
      }),
      this.prisma.attendanceRecord.groupBy({
        by: ['status'],
        _count: { _all: true },
      }),
      this.prisma.writingSubmission.findMany({
        orderBy: { submittedAt: 'desc' },
        take: 5,
        include: {
          user: { select: { fullName: true, email: true } },
          prompt: { select: { title: true, taskType: true } },
        },
      }),
      this.prisma.speakingSubmission.findMany({
        orderBy: { submittedAt: 'desc' },
        take: 5,
        include: {
          user: { select: { fullName: true, email: true } },
          prompt: { select: { title: true, topic: true } },
        },
      }),
    ]);

    let totalAttendance = 0;
    let presentCount = 0;
    let lateCount = 0;
    let absentCount = 0;

    for (const g of attendanceStatusGroups as any[]) {
      const count = g._count?._all || 0;
      totalAttendance += count;
      if (g.status === 'PRESENT') presentCount = count;
      else if (g.status === 'LATE') lateCount = count;
      else if (g.status === 'ABSENT') absentCount = count;
    }

    const presentRate = totalAttendance > 0 ? Math.round((presentCount / totalAttendance) * 100) : 0;
    const lateRate = totalAttendance > 0 ? Math.round((lateCount / totalAttendance) * 100) : 0;
    const absentRate = totalAttendance > 0 ? Math.round((absentCount / totalAttendance) * 100) : 0;

    return {
      metrics: {
        totalStudents,
        totalCourses,
        totalLessons,
        totalClassrooms,
        totalWritingSubmissions,
        totalSpeakingSubmissions,
      },
      actionItems: {
        pendingWritingApprovals,
        pendingSpeakingGradings,
      },
      attendanceOverview: {
        totalRecords: totalAttendance,
        presentCount,
        lateCount,
        absentCount,
        presentRate,
        lateRate,
        absentRate,
      },
      recentStudents,
      activeOrUpcomingClassrooms,
      recentSubmissions: {
        writing: recentWritingSubmissions,
        speaking: recentSpeakingSubmissions,
      },
    };
  }
}
