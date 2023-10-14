import cassandraDb from "@/cassandra";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

export async function POST(req: Request, { params: { courseId }}: { params: { courseId: string }}) {
    try {
        const { userId } = auth();
        const { title } = await req.json();
        const randomId = crypto.randomUUID();
        
        if(!userId) {
            return new NextResponse('Unauthorized', { status: 401})
        }
        
        if(!title) {
            return new NextResponse('Title is missing', { status: 401})
        }
        

        const courseQuery = `SELECT * FROM course where id = ?`;
        const courseParams = [courseId];

        const courseData = await cassandraDb.execute(courseQuery, courseParams, { prepare: true });

        const courseOwner = courseData.rows.find(user => user.user_id === userId);

        if(!courseOwner) {
            return new NextResponse('Unauthorized', { status: 401 })
        
        };
        // if no course return;
        const getChapterQuery = `SELECT * FROM chapter_by_course`;
        const chapterData = await cassandraDb.execute(getChapterQuery, [], { prepare: true });
        const chapters = chapterData.rows.map(chapter => ({
            id: chapter.id?.toString(),
            title: chapter.title,
            description: chapter.description,
            videoUrl: chapter.video_url,
            position: chapter.position,
            isPublished: chapter.is_published,
            isFree: chapter.is_free,
            courseId: chapter.course_id?.toString(),
            createdAt: chapter.created_at,
            updatedAt: chapter.updated_at,
        }));

        const chapterCourseToBeModified = chapters.filter(chapter => chapter.courseId === courseId);
        // good start
        const chapterCoursePositions = chapterCourseToBeModified.map(chapter => chapter.position);
        const chapterCourseSet = new Set(chapterCoursePositions);
        // const array converted from set
        const chapterArrayFromSet = Array.from(chapterCourseSet);
        const maxNumber = Math.max(...chapterArrayFromSet);

        const lastChapter = chapterCourseToBeModified.find(chapter => chapter.position === maxNumber);
        const newPosition = lastChapter ? lastChapter.position + 1 : 1;

        // create chapter
        const insertChapterQuery = `INSERT INTO chapter_by_course (id, title, course_id, position, is_published, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)`;
        const insertChapterParams = [randomId, title, courseId, newPosition, false, Date.now(), Date.now()];
        await cassandraDb.execute(insertChapterQuery, insertChapterParams, { prepare: true })
        .catch((error) => console.log(error));
    
        const chapter = {
            id: randomId,
            title,
            courseId,
            newPosition
        }
    
    

        return NextResponse.json(chapter);
    }  
     catch (error) {
        console.log('[CHAPTERS_POST_ERROR]', error);
        return new NextResponse('Internal Error', {
            status: 500
        })
        
    }
}




