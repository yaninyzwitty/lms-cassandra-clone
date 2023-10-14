import cassandraDb from "@/cassandra";

export async function getProgess (userId:string, courseId:string) {
    try {
        //   find chapter
  const chapterQuery = `SELECT id, is_published, course_id FROM chapter_by_course`;
  const chapterRes = await cassandraDb.execute(chapterQuery, [], {
    prepare: true,
  });
  const chapterData = chapterRes.rows
    .map((row) => ({
      id: row.id.toString(),
      courseId: row.course_id?.toString(),
      isPublished: row.is_published,
    }));
    

const publishedChapters = chapterData.filter(chapter => chapter.isPublished && chapter.courseId === courseId);
const publishedChapterIds = publishedChapters.map(({id}) => id);

// check completed chapters
const completedQuery = `SELECT * FROM user_progress_by_course`;
const completedChapters = (await cassandraDb.execute(completedQuery, [], { prepare: true })).rows.map(row => ({
    id: row.id?.toString(),
    userId: row.user_id,
    chapterId: row.chapter_id?.toString(),
    isCompleted: row.is_completed,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
})).filter(chapter => chapter.userId === userId && chapter.isCompleted && publishedChapterIds.includes(chapter.chapterId));
const progressPercentage = (completedChapters.length / publishedChapterIds.length) * 100;
return progressPercentage;
     
    } catch (error) {
        console.log("[GET_PROGRESS]", error);
        return 0;
        
    }

}