import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service';
import { CreateClassroomDto } from './dto/create-classroom.dto';
import { OverrideAttendanceDto } from './dto/override-attendance.dto';
import { MarkAttendanceDto } from './dto/mark-attendance.dto';
import { AttendanceStatus } from '@prisma/client';
import * as XLSX from 'xlsx';

@Injectable()
export class AttendanceService {
  constructor(private prisma: PrismaService) {}

  async createClassroom(dto: CreateClassroomDto, hostId: string) {
    return this.prisma.classroom.create({
      data: {
        name: dto.name,
        courseId: dto.courseId,
        hostId,
        scheduledStartTime: new Date(dto.scheduledStartTime),
        scheduledEndTime: new Date(dto.scheduledEndTime),
      },
    });
  }

  async getClassrooms() {
    return this.prisma.classroom.findMany({
      orderBy: { scheduledStartTime: 'desc' },
      include: {
        host: { select: { id: true, fullName: true, email: true } },
        _count: { select: { attendanceRecords: true } },
      },
    });
  }

  async getAttendanceByClassroom(classroomId: string) {
    const classroom = await this.prisma.classroom.findUnique({
      where: { id: classroomId },
    });

    if (!classroom) {
      throw new NotFoundException(`Không tìm thấy phòng học ID: ${classroomId}`);
    }

    return this.prisma.attendanceRecord.findMany({
      where: { classroomId },
      include: {
        student: {
          select: { id: true, fullName: true, email: true, phone: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async getMyAttendance(studentId: string) {
    return this.prisma.attendanceRecord.findMany({
      where: { studentId },
      include: {
        classroom: {
          select: {
            id: true,
            name: true,
            scheduledStartTime: true,
            scheduledEndTime: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async overrideAttendance(recordId: string, dto: OverrideAttendanceDto) {
    const record = await this.prisma.attendanceRecord.findUnique({
      where: { id: recordId },
    });

    if (!record) {
      throw new NotFoundException(`Không tìm thấy bản ghi điểm danh ID: ${recordId}`);
    }

    return this.prisma.attendanceRecord.update({
      where: { id: recordId },
      data: {
        status: dto.status,
        note: dto.note,
        isManualOverride: true,
      },
      include: {
        student: { select: { id: true, fullName: true, email: true } },
      },
    });
  }

  async markAttendance(dto: MarkAttendanceDto) {
    const classroom = await this.prisma.classroom.findFirst({
      where: {
        OR: [{ id: dto.classroomId }, { name: dto.classroomId }],
      },
    });

    if (!classroom) {
      throw new NotFoundException(`Không tìm thấy phòng học: ${dto.classroomId}`);
    }

    const student = await this.prisma.user.findUnique({
      where: { id: dto.studentId },
    });

    if (!student) {
      throw new NotFoundException(`Không tìm thấy học viên ID: ${dto.studentId}`);
    }

    const now = new Date();
    const defaultMins = dto.status === AttendanceStatus.ABSENT ? 0 : 85;
    const totalMinutes = dto.totalMinutes !== undefined ? dto.totalMinutes : defaultMins;

    return this.prisma.attendanceRecord.upsert({
      where: {
        classroomId_studentId: {
          classroomId: classroom.id,
          studentId: student.id,
        },
      },
      create: {
        classroomId: classroom.id,
        studentId: student.id,
        status: dto.status,
        totalMinutes,
        firstJoinedAt: dto.status === AttendanceStatus.ABSENT ? null : now,
        isManualOverride: true,
        note: dto.note || 'Admin điểm danh thủ công',
      },
      update: {
        status: dto.status,
        totalMinutes,
        firstJoinedAt: dto.status === AttendanceStatus.ABSENT ? null : undefined,
        isManualOverride: true,
        note: dto.note || 'Admin cập nhật điểm danh',
      },
      include: {
        student: { select: { id: true, fullName: true, email: true } },
        classroom: { select: { id: true, name: true } },
      },
    });
  }

  async exportAttendanceToExcel(classroomId: string) {
    const classroom = await this.prisma.classroom.findUnique({
      where: { id: classroomId },
    });

    if (!classroom) {
      throw new NotFoundException(`Không tìm thấy phòng học ID: ${classroomId}`);
    }

    const records = await this.prisma.attendanceRecord.findMany({
      where: { classroomId },
      include: {
        student: {
          select: { id: true, fullName: true, email: true, phone: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    // Construct structured Excel rows
    const rows = records.map((r, idx) => ({
      'STT': idx + 1,
      'Mã Học Viên': `TD-STU-${r.student.id.substring(0, 4).toUpperCase()}`,
      'Họ Và Tên': r.student.fullName,
      'Email': r.student.email,
      'Số Điện Thoại': r.student.phone || 'Chưa cập nhật',
      'Giờ Vào Đầu Tiên': r.firstJoinedAt
        ? new Date(r.firstJoinedAt).toLocaleString('vi-VN')
        : 'Chưa vào',
      'Giờ Rời Cuối Cùng': r.lastLeftAt
        ? new Date(r.lastLeftAt).toLocaleString('vi-VN')
        : '-',
      'Tổng Số Phút Học': `${r.totalMinutes} phút`,
      'Trạng Thái Chuyên Cần': r.status,
      'Điều Chỉnh Thủ Công': r.isManualOverride ? 'Có' : 'Không',
      'Ghi Chú Của Admin': r.note || '',
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'DiemDanh');

    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    const filename = `Attendance_${classroom.name}_${new Date().toISOString().substring(0, 10)}.xlsx`;

    return { buffer, filename };
  }

  async exportRangeToExcel(startDate?: string, endDate?: string, courseId?: string) {
    const where: any = {};
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        where.createdAt.lte = end;
      }
    }

    if (courseId) {
      where.classroom = { courseId };
    }

    const records = await this.prisma.attendanceRecord.findMany({
      where,
      include: {
        student: {
          select: { id: true, fullName: true, email: true, phone: true },
        },
        classroom: {
          select: { id: true, name: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const rows = records.map((r, idx) => ({
      'STT': idx + 1,
      'Phòng Học': r.classroom?.name || 'Lớp Học',
      'Mã Học Viên': `TD-STU-${r.student.id.substring(0, 4).toUpperCase()}`,
      'Họ Và Tên': r.student.fullName,
      'Email': r.student.email,
      'Số Điện Thoại': r.student.phone || 'Chưa cập nhật',
      'Giờ Vào Đầu Tiên': r.firstJoinedAt
        ? new Date(r.firstJoinedAt).toLocaleString('vi-VN')
        : 'Chưa vào',
      'Giờ Rời Cuối Cùng': r.lastLeftAt
        ? new Date(r.lastLeftAt).toLocaleString('vi-VN')
        : '-',
      'Tổng Số Phút Học': `${r.totalMinutes} phút`,
      'Trạng Thái Chuyên Cần': r.status,
      'Điều Chỉnh Thủ Công': r.isManualOverride ? 'Có' : 'Không',
      'Ghi Chú Của Admin': r.note || '',
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'BaoCaoChuyenCan');

    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    const filename = `Bao_Cao_Chuyen_Can_${startDate || 'ToanBo'}_${endDate || 'HienTai'}.xlsx`;

    return { buffer, filename };
  }
}
