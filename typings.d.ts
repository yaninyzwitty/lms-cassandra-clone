interface Course {
    id: string;
    userId: string;
    title?: string | null;
    description?: string | null;
    imageUrl?: string | null;
    price?: number | null;
    isPublished: boolean;
    categoryId?: string | null;

}

interface Category {
    label: string;
    value: string;
}

interface CategoryProps {
    id: string;
    name: string;
}

interface Chapter {
    id: string;
    title: string;
    description?: string;
    courseId?: string;
    isPublished?: boolean;
    isFree?: boolean;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    position?: number;
    videoUrl?: string;
}

interface Attachment {
    id: string;
    name: string;
    url: string;
    courseId: string;
    createdAt: string;
    updatedAt: string;
}

interface MuxData {
    id: string;
    assetId: string;
    playbackId: string;
    chapterId: string;

}