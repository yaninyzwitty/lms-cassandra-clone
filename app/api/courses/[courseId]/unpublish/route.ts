import cassandraDb from "@/cassandra";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

export async function PATCH(req:Request, { params: { courseId }}: { params: { courseId: string }}) {
    try {
        const { userId } = auth();

        if(!userId) {
            return new NextResponse('Unauthorized', { status: 401 })
        };
        // finding course to modify
        const query = `SELECT * FROM course WHERE id = ?`;
        const params = [courseId];
        const courseData = (await cassandraDb.execute(query, params, { prepare: true })).rows.map(row => ({
            id: row.id.toString(),
            userId: row.user_id,
            title: row.title,
            description: row.description,
            imageUrl: row.image_url,
            price: row.price,
            isPublished: row.is_published,
            categoryId: row.category_id?.toString(),
        }));

        const course = courseData.find(user => user.id === courseId && user.userId === userId);



        if(!course) {
            return new NextResponse('Course data is required', { status: 400 })
        };
           // making sure client has published chapter

           const chapterQuery = `SELECT * FROM chapter_by_course`;
           const chapterData = (await cassandraDb.execute(chapterQuery, [], { prepare: true })).rows.map(row => ({
               id: row.id.toString(),
               title: row.title,
               description: row.description,
               courseId: row.course_id?.toString(),
               isPublished: row.is_published,
               isFree: row.is_free,
               createdAt: row.created_at,
               updatedAt: row.updated_at,
               position: row.position,
               videoUrl: row.video_url?.toString(),
           }));
           const hasPublishedChapter = chapterData.some(chapter => chapter.courseId === courseId);
           if(!hasPublishedChapter) {
               return new NextResponse('Missing required fields', { status: 401 })
           };
   
           const publishQuery = `UPDATE course SET is_published = ? WHERE id = ?`;
           const publishParams = [false, courseId];
           await cassandraDb.execute(publishQuery, publishParams, { prepare: true })
           .then(() => console.log('Updated details succesfully'))
           .catch(err => console.log('Error updating details', err));
           return NextResponse.json({ message: "Unpublihed succesfully"})        
   


        

     

    } catch (error) {
        console.log('[UNPUBLISH_PATCH]', error);
        return new NextResponse('Internal error', { status: 500 })
        
    }

}
