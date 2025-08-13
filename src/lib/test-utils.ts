/**
 * 이미지 프록시 테스트 유틸리티
 *
 * S3 이미지 프록시 시스템 테스트를 위한 유틸리티 함수들
 * 개발 환경에서 API 연결 상태 및 이미지 로딩 테스트용
 */

import { apiClient } from "@/lib/api-client";
import {
    getImageUrl,
    validateImageUrl,
    testImageLoad,
} from "@/lib/image-utils";

// =============================================================================
// 🔧 API 연결 테스트
// =============================================================================

/**
 * 백엔드 API 서버 연결 테스트
 */
export async function testApiConnection(): Promise<{
    connected: boolean;
    baseUrl: string;
    responseTime: number;
    error?: string;
}> {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
    const startTime = Date.now();

    try {
        const response = await fetch(`${baseUrl}/health`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });

        const responseTime = Date.now() - startTime;

        if (response.ok) {
            return {
                connected: true,
                baseUrl,
                responseTime,
            };
        } else {
            return {
                connected: false,
                baseUrl,
                responseTime,
                error: `HTTP ${response.status}: ${response.statusText}`,
            };
        }
    } catch (error) {
        return {
            connected: false,
            baseUrl,
            responseTime: Date.now() - startTime,
            error: error instanceof Error ? error.message : "알 수 없는 오류",
        };
    }
}

/**
 * 이미지 프록시 서비스 연결 테스트
 */
export async function testImageProxyService(): Promise<{
    available: boolean;
    baseUrl: string;
    error?: string;
}> {
    const baseUrl =
        process.env.NEXT_PUBLIC_IMAGE_BASE_URL ||
        "http://localhost:3001/api/images";

    try {
        const response = await fetch(`${baseUrl}/health`, {
            method: "GET",
        });

        return {
            available: response.ok,
            baseUrl,
            error: response.ok
                ? undefined
                : `HTTP ${response.status}: ${response.statusText}`,
        };
    } catch (error) {
        return {
            available: false,
            baseUrl,
            error:
                error instanceof Error
                    ? error.message
                    : "이미지 프록시 서비스 연결 실패",
        };
    }
}

// =============================================================================
// 🖼️ 이미지 로딩 테스트
// =============================================================================

interface ImageTestResult {
    photoId: number;
    thumbnail: boolean;
    url: string;
    success: boolean;
    loadTime: number;
    error?: string;
    metadata?: {
        contentType?: string;
        contentLength?: number;
    };
}

/**
 * 단일 이미지 로딩 테스트
 */
export async function testImageLoad_Single(
    photoId: number,
    thumbnail = false
): Promise<ImageTestResult> {
    const startTime = Date.now();
    const url = getImageUrl(photoId, thumbnail);

    try {
        // URL 유효성 검사
        if (!validateImageUrl(url)) {
            throw new Error("유효하지 않은 이미지 URL");
        }

        // 이미지 로드 테스트
        const success = await testImageLoad(url);
        const loadTime = Date.now() - startTime;

        let metadata;
        if (success) {
            try {
                // 메타데이터 조회 시도
                metadata = await apiClient.getImageMetadata(photoId, thumbnail);
            } catch {
                // 메타데이터 조회 실패는 치명적이지 않음
            }
        }

        return {
            photoId,
            thumbnail,
            url,
            success,
            loadTime,
            metadata,
        };
    } catch (error) {
        return {
            photoId,
            thumbnail,
            url,
            success: false,
            loadTime: Date.now() - startTime,
            error: error instanceof Error ? error.message : "알 수 없는 오류",
        };
    }
}

/**
 * 여러 이미지 배치 테스트
 */
export async function testImageLoadBatch(
    photoIds: number[],
    includeThumbnails = true
): Promise<{
    results: ImageTestResult[];
    summary: {
        total: number;
        successful: number;
        failed: number;
        averageLoadTime: number;
        successRate: number;
    };
}> {
    const promises: Promise<ImageTestResult>[] = [];

    for (const photoId of photoIds) {
        promises.push(testImageLoad_Single(photoId, false));

        if (includeThumbnails) {
            promises.push(testImageLoad_Single(photoId, true));
        }
    }

    const results = await Promise.all(promises);

    const successful = results.filter((r) => r.success).length;
    const failed = results.length - successful;
    const averageLoadTime =
        results.reduce((sum, r) => sum + r.loadTime, 0) / results.length;

    return {
        results,
        summary: {
            total: results.length,
            successful,
            failed,
            averageLoadTime: Math.round(averageLoadTime),
            successRate: results.length > 0 ? successful / results.length : 0,
        },
    };
}

// =============================================================================
// 🎯 성능 벤치마크 테스트
// =============================================================================

interface PerformanceBenchmark {
    testName: string;
    samples: number;
    averageTime: number;
    minTime: number;
    maxTime: number;
    successRate: number;
    timestamp: string;
}

/**
 * 이미지 로딩 성능 벤치마크
 */
export async function benchmarkImageLoading(
    photoIds: number[],
    iterations = 3
): Promise<PerformanceBenchmark> {
    const results: ImageTestResult[] = [];

    for (let i = 0; i < iterations; i++) {
        const batchResult = await testImageLoadBatch(photoIds.slice(0, 10)); // 최대 10개만 테스트
        results.push(...batchResult.results);

        // 반복 간 짧은 대기
        if (i < iterations - 1) {
            await new Promise((resolve) => setTimeout(resolve, 1000));
        }
    }

    const loadTimes = results.map((r) => r.loadTime);
    const successful = results.filter((r) => r.success).length;

    return {
        testName: `Image Loading Benchmark (${photoIds.length} photos × ${iterations} iterations)`,
        samples: results.length,
        averageTime: Math.round(
            loadTimes.reduce((sum, time) => sum + time, 0) / loadTimes.length
        ),
        minTime: Math.min(...loadTimes),
        maxTime: Math.max(...loadTimes),
        successRate: results.length > 0 ? successful / results.length : 0,
        timestamp: new Date().toISOString(),
    };
}

// =============================================================================
// 🔍 디버깅 유틸리티
// =============================================================================

/**
 * 이미지 프록시 시스템 전체 진단
 */
export async function diagnoseImageProxySystem(): Promise<{
    apiConnection: Awaited<ReturnType<typeof testApiConnection>>;
    proxyService: Awaited<ReturnType<typeof testImageProxyService>>;
    sampleImageTest?: ImageTestResult;
    recommendations: string[];
}> {
    console.group("🔍 이미지 프록시 시스템 진단 시작");

    // API 연결 테스트
    console.log("1. API 서버 연결 테스트 중...");
    const apiConnection = await testApiConnection();
    console.log("API 연결:", apiConnection);

    // 프록시 서비스 테스트
    console.log("2. 이미지 프록시 서비스 테스트 중...");
    const proxyService = await testImageProxyService();
    console.log("프록시 서비스:", proxyService);

    // 샘플 이미지 테스트 (photoId 1 사용)
    let sampleImageTest;
    if (apiConnection.connected) {
        console.log("3. 샘플 이미지 로딩 테스트 중...");
        sampleImageTest = await testImageLoad_Single(1, false);
        console.log("샘플 이미지 테스트:", sampleImageTest);
    }

    // 추천사항 생성
    const recommendations: string[] = [];

    if (!apiConnection.connected) {
        recommendations.push("백엔드 API 서버를 시작하세요 (npm run dev)");
    }

    if (!proxyService.available) {
        recommendations.push(
            "이미지 프록시 라우터가 올바르게 등록되었는지 확인하세요"
        );
    }

    if (apiConnection.responseTime > 1000) {
        recommendations.push(
            "API 응답 시간이 느립니다. 서버 성능을 확인하세요"
        );
    }

    if (sampleImageTest && !sampleImageTest.success) {
        recommendations.push(
            "샘플 이미지가 존재하지 않거나 권한 문제가 있을 수 있습니다"
        );
    }

    if (recommendations.length === 0) {
        recommendations.push("모든 시스템이 정상 작동 중입니다 ✅");
    }

    console.groupEnd();

    return {
        apiConnection,
        proxyService,
        sampleImageTest,
        recommendations,
    };
}

/**
 * 환경 변수 검증
 */
export function validateEnvironmentConfig(): {
    valid: boolean;
    variables: Record<
        string,
        { value: string | undefined; required: boolean; valid: boolean }
    >;
    issues: string[];
} {
    const envVars = {
        NEXT_PUBLIC_API_URL: {
            value: process.env.NEXT_PUBLIC_API_URL,
            required: true,
        },
        NEXT_PUBLIC_IMAGE_BASE_URL: {
            value: process.env.NEXT_PUBLIC_IMAGE_BASE_URL,
            required: false,
        },
        NEXT_PUBLIC_DEBUG: {
            value: process.env.NEXT_PUBLIC_DEBUG,
            required: false,
        },
    };

    const issues: string[] = [];
    let valid = true;

    const variables = Object.fromEntries(
        Object.entries(envVars).map(([key, config]) => {
            const isValid = config.required ? !!config.value : true;

            if (!isValid) {
                issues.push(`필수 환경변수 ${key}가 설정되지 않았습니다`);
                valid = false;
            }

            return [
                key,
                {
                    ...config,
                    valid: isValid,
                },
            ];
        })
    );

    return {
        valid,
        variables,
        issues,
    };
}

// =============================================================================
// 🎮 개발자 도구
// =============================================================================

/**
 * 브라우저 콘솔에서 사용할 수 있는 테스트 함수들을 전역으로 노출
 */
export function exposeTestUtils() {
    if (
        typeof window !== "undefined" &&
        process.env.NODE_ENV === "development"
    ) {
        (window as unknown as Record<string, unknown>).epiksodeImageTests = {
            testConnection: testApiConnection,
            testProxy: testImageProxyService,
            testImage: testImageLoad_Single,
            testBatch: testImageLoadBatch,
            benchmark: benchmarkImageLoading,
            diagnose: diagnoseImageProxySystem,
            validateEnv: validateEnvironmentConfig,
        };

        console.log(
            "🎮 이미지 테스트 유틸리티가 window.epiksodeImageTests에 노출되었습니다"
        );
        console.log("사용 예시:");
        console.log("- await epiksodeImageTests.diagnose()");
        console.log("- await epiksodeImageTests.testImage(1)");
        console.log("- await epiksodeImageTests.benchmark([1,2,3])");
    }
}
