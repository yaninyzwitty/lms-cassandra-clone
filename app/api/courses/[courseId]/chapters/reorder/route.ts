import cassandraDb from "@/cassandra";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

export async function PUT(req:Request, { params: { courseId}}: { params: { courseId: string }}) {
    try {
        const { userId } = auth();
        if(!userId) {
            return new NextResponse('Unauthorized', { status: 401 })
        
        }
        const { list } = await req.json();

        // find own course
    

        const ownCourseQuery = `SELECT * FROM course WHERE id = ?`;
        const ownCourseParams = [courseId];
        const ownCourseData = await cassandraDb.execute(ownCourseQuery, ownCourseParams, { prepare: true })
        const ownCourse = ownCourseData.rows.find(row => row.user_id === userId);

        if (!ownCourse) {
            return new NextResponse("Unauthorized", { status: 401 });
          }

        //   find all chapters
        const chapterQuery = `SELECT * FROM chapter_by_course`;
        const chapterData = await cassandraDb.execute(chapterQuery, [], { prepare: true });
        const chapters = chapterData.rows.map(row => ({
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

        })).sort((a, b) => a.position - b.position); 

        const chaptersWithCourse = chapters.filter(chapter => chapter.courseId === courseId);

if(list.length < 2) {
  return new NextResponse('Cannot update the position', { status: 400 })
}

for (let item of list) {
  const updateQuery = `UPDATE chapter_by_course SET position = ? WHERE id = ?`;
  const updateParams = [item.position, item.id];
  await cassandraDb.execute(updateQuery, updateParams, { prepare: true })
  .then(() => console.log("Updated details succesfully"))
  .catch(err => console.log(err));

}
return NextResponse.json(list)       
    } catch (error) {
        console.log('PUT_CHAPTER_ID', error);

        return new NextResponse('Internal Error', { status: 500 })
    }
        
    
}
 