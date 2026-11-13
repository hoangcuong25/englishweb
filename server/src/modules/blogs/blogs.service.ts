import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service';
import { CloudinaryService } from '../../core/cloudinary/cloudinary.service';
import { RedisService } from '../../core/redis/redis.service';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { QueryBlogsDto } from './dto/query-blogs.dto';
import { BlogStatus, Role } from '@prisma/client';

@Injectable()
export class BlogsService {
  private readonly logger = new Logger(BlogsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinaryService: CloudinaryService,
    private readonly redisService: RedisService,
  ) {}

  /**
   * Tạo bài viết Blog mới kèm ảnh/video Cloudinary
   */
  async createBlog(
    authorId: string,
    dto: CreateBlogDto,
    coverFile?: Express.Multer.File,
    videoFile?: Express.Multer.File,
  ) {
    let coverImage = dto.coverImage;
    let coverImagePublicId = dto.coverImagePublicId;
    let videoUrl = dto.videoUrl;
    let videoPublicId = dto.videoPublicId;

    // Upload cover image nếu có file đính kèm
    if (coverFile) {
      const uploadRes = await this.cloudinaryService.uploadImage(
        coverFile,
        'teacher_dong_academy/blogs/covers',
      );
      coverImage = uploadRes.secureUrl;
      coverImagePublicId = uploadRes.publicId;
    }

    // Upload video bài giảng / blog review nếu có file đính kèm
    if (videoFile) {
      const uploadRes = await this.cloudinaryService.uploadVideo(
        videoFile,
        'teacher_dong_academy/blogs/videos',
      );
      videoUrl = uploadRes.secureUrl;
      videoPublicId = uploadRes.publicId;
    }

    // Tạo slug thân thiện nếu chưa có
    let slug = dto.slug?.trim() || this.slugify(dto.title);
    const existingSlug = await this.prisma.blogPost.findUnique({
      where: { slug },
    });
    if (existingSlug) {
      slug = `${slug}-${Date.now().toString(36)}`;
    }

    const publishedAt = dto.status === BlogStatus.PUBLISHED ? new Date() : null;

    const res = await this.prisma.blogPost.create({
      data: {
        title: dto.title,
        slug,
        summary: dto.summary,
        content: dto.content,
        coverImage,
        coverImagePublicId,
        videoUrl,
        videoPublicId,
        category: dto.category,
        tags: dto.tags,
        status: dto.status || BlogStatus.DRAFT,
        isFeatured: dto.isFeatured ?? false,
        authorId,
        publishedAt,
      },
      include: {
        author: {
          select: { id: true, fullName: true, avatarUrl: true, role: true },
        },
      },
    });

    await this.redisService.delPattern('cache:blogs:*');
    return res;
  }

  /**
   * Cập nhật bài viết Blog
   */
  async updateBlog(
    id: string,
    dto: UpdateBlogDto,
    coverFile?: Express.Multer.File,
    videoFile?: Express.Multer.File,
  ) {
    const post = await this.prisma.blogPost.findUnique({ where: { id } });
    if (!post) {
      throw new NotFoundException(`Không tìm thấy bài viết Blog có ID: ${id}`);
    }

    let coverImage = dto.coverImage !== undefined ? dto.coverImage : post.coverImage;
    let coverImagePublicId = dto.coverImagePublicId !== undefined ? dto.coverImagePublicId : post.coverImagePublicId;
    let videoUrl = dto.videoUrl !== undefined ? dto.videoUrl : post.videoUrl;
    let videoPublicId = dto.videoPublicId !== undefined ? dto.videoPublicId : post.videoPublicId;

    if (coverFile) {
      const uploadRes = await this.cloudinaryService.uploadImage(
        coverFile,
        'teacher_dong_academy/blogs/covers',
      );
      // Xóa ảnh cũ nếu có
      if (post.coverImagePublicId) {
        await this.cloudinaryService.deleteAsset(post.coverImagePublicId, 'image');
      }
      coverImage = uploadRes.secureUrl;
      coverImagePublicId = uploadRes.publicId;
    }

    if (videoFile) {
      const uploadRes = await this.cloudinaryService.uploadVideo(
        videoFile,
        'teacher_dong_academy/blogs/videos',
      );
      if (post.videoPublicId) {
        await this.cloudinaryService.deleteAsset(post.videoPublicId, 'video');
      }
      videoUrl = uploadRes.secureUrl;
      videoPublicId = uploadRes.publicId;
    }

    let publishedAt = post.publishedAt;
    if (dto.status === BlogStatus.PUBLISHED && post.status !== BlogStatus.PUBLISHED) {
      publishedAt = new Date();
    }

    const updated = await this.prisma.blogPost.update({
      where: { id },
      data: {
        title: dto.title,
        slug: dto.slug,
        summary: dto.summary,
        content: dto.content,
        coverImage,
        coverImagePublicId,
        videoUrl,
        videoPublicId,
        category: dto.category,
        tags: dto.tags,
        status: dto.status,
        isFeatured: dto.isFeatured,
        publishedAt,
      },
      include: {
        author: {
          select: { id: true, fullName: true, avatarUrl: true, role: true },
        },
      },
    });

    await this.redisService.delPattern('cache:blogs:*');
    return updated;
  }

  /**
   * Lấy danh sách bài viết Blog (Học viên chỉ thấy PUBLISHED, Admin thấy tất cả)
   */
  async findAll(query: QueryBlogsDto, userRole?: Role) {
    const cacheKey = `cache:blogs:${userRole || 'PUBLIC'}:${query.category || 'ALL'}:${query.status || 'ANY'}:${query.page || 1}:${query.search || 'NONE'}`;
    const cached = await this.redisService.getJson<any>(cacheKey);
    if (cached) {
      return cached;
    }

    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(query.limit) || 10));
    const skip = (page - 1) * limit;

    const where: any = {};

    // Phân quyền: Người dùng thông thường hoặc học viên chỉ xem bài PUBLISHED
    if (userRole !== Role.ADMIN) {
      where.status = BlogStatus.PUBLISHED;
    } else if (query.status) {
      where.status = query.status;
    }

    if (query.category) {
      where.category = query.category;
    }

    if (query.isFeatured !== undefined) {
      where.isFeatured = query.isFeatured;
    }

    if (query.search) {
      where.OR = [
        { title: { contains: query.search } },
        { summary: { contains: query.search } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.blogPost.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
        include: {
          author: {
            select: { id: true, fullName: true, avatarUrl: true, role: true },
          },
        },
      }),
      this.prisma.blogPost.count({ where }),
    ]);

    const result = {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };

    await this.redisService.setJson(cacheKey, result, 300);
    return result;
  }

  /**
   * Xem chi tiết bài viết Blog qua Slug hoặc ID (tự động tăng viewCount)
   */
  async findBySlugOrId(identifier: string, userRole?: Role) {
    let post = await this.prisma.blogPost.findUnique({
      where: { slug: identifier },
      include: {
        author: {
          select: { id: true, fullName: true, avatarUrl: true, role: true },
        },
      },
    });

    if (!post) {
      post = await this.prisma.blogPost.findUnique({
        where: { id: identifier },
        include: {
          author: {
            select: { id: true, fullName: true, avatarUrl: true, role: true },
          },
        },
      });
    }

    if (!post) {
      throw new NotFoundException(`Không tìm thấy bài viết Blog: ${identifier}`);
    }

    // Nếu bài viết chưa PUBLISHED mà không phải ADMIN thì chặn
    if (post.status !== BlogStatus.PUBLISHED && userRole !== Role.ADMIN) {
      throw new NotFoundException(`Bài viết chưa được xuất bản`);
    }

    // Tăng lượt xem
    return this.prisma.blogPost.update({
      where: { id: post.id },
      data: { viewCount: { increment: 1 } },
      include: {
        author: {
          select: { id: true, fullName: true, avatarUrl: true, role: true },
        },
      },
    });
  }

  /**
   * Xóa bài viết Blog và thu hồi tài nguyên Cloudinary
   */
  async deleteBlog(id: string) {
    const post = await this.prisma.blogPost.findUnique({ where: { id } });
    if (!post) {
      throw new NotFoundException(`Không tìm thấy bài viết Blog có ID: ${id}`);
    }

    if (post.coverImagePublicId) {
      await this.cloudinaryService.deleteAsset(post.coverImagePublicId, 'image');
    }
    if (post.videoPublicId) {
      await this.cloudinaryService.deleteAsset(post.videoPublicId, 'video');
    }

    await this.prisma.blogPost.delete({ where: { id } });
    await this.redisService.delPattern('cache:blogs:*');

    return { success: true, message: 'Xóa bài viết Blog thành công' };
  }

  /**
   * Upload ảnh bìa cho blog qua Cloudinary
   */
  async uploadCoverImage(blogId: string, file: Express.Multer.File) {
    const post = await this.prisma.blogPost.findUnique({ where: { id: blogId } });
    if (!post) {
      throw new NotFoundException(`Không tìm thấy bài viết Blog có ID: ${blogId}`);
    }

    const uploadRes = await this.cloudinaryService.uploadImage(file, 'teacher_dong_academy/blogs/covers');
    if (post.coverImagePublicId) {
      await this.cloudinaryService.deleteAsset(post.coverImagePublicId, 'image');
    }

    return this.prisma.blogPost.update({
      where: { id: blogId },
      data: {
        coverImage: uploadRes.secureUrl,
        coverImagePublicId: uploadRes.publicId,
      },
    });
  }

  /**
   * Upload video cho blog qua Cloudinary
   */
  async uploadBlogVideo(blogId: string, file: Express.Multer.File) {
    const post = await this.prisma.blogPost.findUnique({ where: { id: blogId } });
    if (!post) {
      throw new NotFoundException(`Không tìm thấy bài viết Blog có ID: ${blogId}`);
    }

    const uploadRes = await this.cloudinaryService.uploadVideo(file, 'teacher_dong_academy/blogs/videos');
    if (post.videoPublicId) {
      await this.cloudinaryService.deleteAsset(post.videoPublicId, 'video');
    }

    return this.prisma.blogPost.update({
      where: { id: blogId },
      data: {
        videoUrl: uploadRes.secureUrl,
        videoPublicId: uploadRes.publicId,
      },
    });
  }

  /**
   * Chuyển đổi tiêu đề tiếng Việt sang slug an toàn
   */
  private slugify(str: string): string {
    return str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[đĐ]/g, 'd')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-');
  }
}
