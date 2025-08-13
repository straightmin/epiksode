# S3 이미지 프록시 구현 및 Presigned URL 마이그레이션 가이드

## 📋 개요

AWS S3 이미지 접근 문제 해결을 위한 단계별 구현 가이드입니다.

**문제**: S3 버킷이 비공개로 설정되어 브라우저에서 직접 접근 시 403 Forbidden 에러 발생  
**해결**: 백엔드 프록시 → Presigned URL 마이그레이션

---

## 🚀 Phase 1: 이미지 프록시 구현 (즉시 해결)

### 1.1 백엔드 서비스 함수 추가

**파일**: `src/services/photo.service.ts`

```javascript
import { GetObjectCommand } from '@aws-sdk/client-s3';

/**
 * S3에서 이미지를 가져와 스트림으로 반환
 * @param s3Key S3 객체 키 (예: "photos/13/1754823820302-Yellow.jpg")
 * @returns S3 이미지 스트림
 */
export const getImageFromS3 = async (s3Key: string) => {
  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: s3Key,
  });

  try {
    const response = await s3Client.send(command);
    return {
      body: response.Body,
      contentType: response.ContentType,
      contentLength: response.ContentLength,
      lastModified: response.LastModified,
    };
  } catch (error) {
    throw new Error(`S3 이미지 조회 실패: ${error.message}`);
  }
};

/**
 * 사진 ID로 S3 키 정보 조회
 */
export const getPhotoS3Keys = async (photoId: number) => {
  const photo = await prisma.photo.findUnique({
    where: { id: photoId },
    select: { imageUrl: true, thumbnailUrl: true }
  });

  if (!photo) {
    throw new Error('사진을 찾을 수 없습니다.');
  }

  // URL에서 S3 키 추출
  const extractS3Key = (url: string) => {
    const match = url.match(/amazonaws\.com\/(.+)$/);
    return match ? match[1] : null;
  };

  return {
    imageKey: extractS3Key(photo.imageUrl),
    thumbnailKey: extractS3Key(photo.thumbnailUrl),
  };
};
```

### 1.2 이미지 프록시 컨트롤러 추가

**파일**: `src/controllers/image.controller.ts`

```javascript
import { Request, Response } from 'express';
import { getImageFromS3, getPhotoS3Keys } from '../services/photo.service';
import { asyncHandler } from '../utils/asyncHandler';

/**
 * 사진 이미지 프록시
 */
export const getPhotoImage = asyncHandler(async (req: Request, res: Response) => {
  const photoId = parseInt(req.params.photoId);

  if (!photoId) {
    return res.status(400).json({ message: '유효하지 않은 사진 ID입니다.' });
  }

  const { imageKey } = await getPhotoS3Keys(photoId);

  if (!imageKey) {
    return res.status(404).json({ message: '이미지를 찾을 수 없습니다.' });
  }

  const imageData = await getImageFromS3(imageKey);

  // 캐싱 헤더 설정
  res.set({
    'Content-Type': imageData.contentType || 'image/jpeg',
    'Content-Length': imageData.contentLength,
    'Cache-Control': 'public, max-age=86400', // 24시간 캐싱
    'Last-Modified': imageData.lastModified?.toUTCString(),
  });

  // 이미지 스트림을 브라우저로 전송
  imageData.body.pipe(res);
});

/**
 * 썸네일 이미지 프록시
 */
export const getThumbnailImage = asyncHandler(async (req: Request, res: Response) => {
  const photoId = parseInt(req.params.photoId);

  if (!photoId) {
    return res.status(400).json({ message: '유효하지 않은 사진 ID입니다.' });
  }

  const { thumbnailKey } = await getPhotoS3Keys(photoId);

  if (!thumbnailKey) {
    return res.status(404).json({ message: '썸네일을 찾을 수 없습니다.' });
  }

  const imageData = await getImageFromS3(thumbnailKey);

  res.set({
    'Content-Type': imageData.contentType || 'image/jpeg',
    'Content-Length': imageData.contentLength,
    'Cache-Control': 'public, max-age=86400',
    'Last-Modified': imageData.lastModified?.toUTCString(),
  });

  imageData.body.pipe(res);
});
```

### 1.3 라우터 추가

**파일**: `src/routes/image.routes.ts`

```javascript
import { Router } from "express";
import {
    getPhotoImage,
    getThumbnailImage,
} from "../controllers/image.controller";

const router = Router();

/**
 * @swagger
 * /images/{photoId}:
 *   get:
 *     summary: Get photo image by ID
 *     parameters:
 *       - in: path
 *         name: photoId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Image data
 *         content:
 *           image/jpeg:
 *             schema:
 *               type: string
 *               format: binary
 */
router.get("/:photoId", getPhotoImage);

/**
 * @swagger
 * /images/thumbnails/{photoId}:
 *   get:
 *     summary: Get thumbnail image by ID
 */
router.get("/thumbnails/:photoId", getThumbnailImage);

export default router;
```

### 1.4 메인 서버에 라우터 등록

**파일**: `src/server.ts`

```javascript
import imageRoutes from "./routes/image.routes";

// 이미지 프록시 라우트 등록
app.use("/api/images", imageRoutes);
```

### 1.5 프론트엔드 URL 수정

**파일**: `src/services/photo.service.ts` (백엔드)

```javascript
// 기존 URL 생성 방식 수정
export const createPhoto = async (photoData: any) => {
  // ... S3 업로드 로직

  // 프록시 URL로 변경
  const imageUrl = `${process.env.BACKEND_URL || 'http://localhost:3001'}/api/images/${photo.id}`;
  const thumbnailUrl = `${process.env.BACKEND_URL || 'http://localhost:3001'}/api/images/thumbnails/${photo.id}`;

  // DB 업데이트
  const updatedPhoto = await prisma.photo.update({
    where: { id: photo.id },
    data: { imageUrl, thumbnailUrl }
  });

  return updatedPhoto;
};
```

---

## 🔄 Phase 2: Presigned URL 마이그레이션 (성능 최적화)

### 2.1 Presigned URL 서비스 함수

**파일**: `src/services/presigned-url.service.ts`

```javascript
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import s3Client, { bucketName } from '../lib/s3Client';

/**
 * 사진 이미지용 Presigned URL 생성
 * @param s3Key S3 객체 키
 * @param expiresIn 만료 시간 (초, 기본 1시간)
 * @returns Presigned URL
 */
export const generatePresignedUrl = async (
  s3Key: string,
  expiresIn: number = 3600
): Promise<string> => {
  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: s3Key,
  });

  return await getSignedUrl(s3Client, command, { expiresIn });
};

/**
 * 여러 이미지의 Presigned URL 일괄 생성
 */
export const generateBatchPresignedUrls = async (
  s3Keys: string[],
  expiresIn: number = 3600
): Promise<Record<string, string>> => {
  const urlPromises = s3Keys.map(async (key) => {
    const url = await generatePresignedUrl(key, expiresIn);
    return { key, url };
  });

  const results = await Promise.all(urlPromises);

  return results.reduce((acc, { key, url }) => {
    acc[key] = url;
    return acc;
  }, {} as Record<string, string>);
};
```

### 2.2 사진 서비스에 Presigned URL 통합

```javascript
export const getPhotosWithPresignedUrls = async (
  sortBy?: string,
  currentUserId?: number
) => {
  const photos = await getPhotos(sortBy, currentUserId);

  // S3 키 추출
  const s3Keys = photos.flatMap(photo => [
    extractS3Key(photo.imageUrl),
    extractS3Key(photo.thumbnailUrl)
  ]).filter(Boolean);

  // Presigned URL 일괄 생성
  const presignedUrls = await generateBatchPresignedUrls(s3Keys, 7200); // 2시간 유효

  // URL 교체
  return photos.map(photo => ({
    ...photo,
    imageUrl: presignedUrls[extractS3Key(photo.imageUrl)] || photo.imageUrl,
    thumbnailUrl: presignedUrls[extractS3Key(photo.thumbnailUrl)] || photo.thumbnailUrl,
  }));
};
```

### 2.3 URL 캐싱 전략

**Redis 캐싱 구현**:

```javascript
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

export const getCachedPresignedUrl = async (s3Key: string): Promise<string | null> => {
  const cacheKey = `presigned:${s3Key}`;
  const cachedUrl = await redis.get(cacheKey);

  if (cachedUrl) {
    return cachedUrl;
  }

  // 새 URL 생성 및 캐싱 (만료 30분 전에 캐시 삭제)
  const presignedUrl = await generatePresignedUrl(s3Key, 3600);
  await redis.setex(cacheKey, 2700, presignedUrl); // 45분 캐싱

  return presignedUrl;
};
```

---

## 📊 성능 비교

### 프록시 방식

- **장점**: 즉시 구현, 보안 강화, 접근 제어
- **단점**: 서버 부하, 지연시간 증가, 대역폭 2배 사용
- **응답시간**: 평균 200-500ms

### Presigned URL 방식

- **장점**: S3 직접 접근, CDN 캐싱 활용, 서버 부하 감소
- **단점**: URL 만료 관리, 복잡한 캐싱 로직
- **응답시간**: 평균 50-150ms

---

## 🗓️ 마이그레이션 일정

### 1주차: 프록시 구현

- [x] 백엔드 프록시 엔드포인트 구현
- [ ] 프론트엔드 URL 교체
- [ ] 테스트 및 성능 측정

### 2주차: Presigned URL 준비

- [ ] Presigned URL 서비스 구현
- [ ] Redis 캐싱 시스템 구축
- [ ] A/B 테스트 환경 구성

### 3주차: 단계적 마이그레이션

- [ ] 신규 업로드부터 Presigned URL 적용
- [ ] 기존 이미지 점진적 마이그레이션
- [ ] 성능 모니터링 및 최적화

### 4주차: 완전 마이그레이션

- [ ] 모든 이미지 Presigned URL로 전환
- [ ] 프록시 엔드포인트 제거 또는 폴백 용도로 유지
- [ ] 문서화 및 운영 가이드 작성

---

## 🔧 운영 고려사항

### 모니터링

- 이미지 로드 성공률
- 평균 응답시간
- 서버 리소스 사용량
- S3 API 호출 비용

### 장애 복구

- Presigned URL 생성 실패 시 프록시로 폴백
- Redis 장애 시 직접 생성
- S3 접근 불가 시 기본 이미지 표시

### 보안

- Presigned URL 만료시간 적절히 설정
- 무단 접근 방지를 위한 리퍼러 체크
- 이미지 접근 로그 수집 및 분석

---

## 📝 참고 자료

- [AWS S3 Presigned URLs](https://docs.aws.amazon.com/AmazonS3/latest/userguide/presigned-urls.html)
- [Express.js Stream Handling](https://expressjs.com/en/api.html#res.pipe)
- [Redis Caching Strategies](https://redis.io/docs/manual/patterns/)

---

_작성일: 2025-08-10_  
_버전: 1.0_
