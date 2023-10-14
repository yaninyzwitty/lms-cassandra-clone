import cassandraDb from "@/cassandra";
import { auth } from "@clerk/nextjs";
import Mux from "@mux/mux-node";

import { NextResponse } from "next/server";
const { Video } = new Mux(
    process.env.MUX_TOKEN_ID!,
    process.env.MUX_TOKEN_SECRET!,
);

export async function DELETE (req:Request, { params: { courseId, chapterId}}: { params: { courseId: string, chapterId: string }}) {
    try {
           const { userId } = auth();
    if(!userId) {
      return new NextResponse('Unauthorized', { status: 401 })
    };

    
        // check if own course
         const courseQuery = `SELECT * FROM course WHERE id = ?`;
    const courseParams = [courseId];
    const courseRes = await cassandraDb.execute(courseQuery, courseParams, { prepare: true })
    const courseData = courseRes.rows.map(row => ({
      id: row.id.toString(),
      userId: row.user_id,
      title: row.title,
      description: row.description,
      imageUrl: row.image_url,
      price: row.price,
      isPublished: row.is_published,
      categoryId: row.category_id?.toString(),

    }));

    const courseOwner = courseData.find(user => user.userId === userId);
    if(!courseOwner) {
      return new NextResponse('Unauthorized', { status: 401 })
    };


    // find unique chapter
        const chapterQuery = `SELECT * FROM chapter_by_course WHERE id = ?`;
        const chapterParams = [chapterId];
        const chapterRes = await cassandraDb.execute(chapterQuery, chapterParams, { prepare: true });
        const chapterData = chapterRes.rows.map(row => ({
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

        const chapter = chapterData.find((chapter) => chapter.courseId === courseId);

        if(!chapter) {
            return new NextResponse('Chapter is required', { status: 400 })
        }

        // check video url

    if(chapter.videoUrl) {
            // check mux data

        const muxQuery = `SELECT * FROM mux_data_by_course`;
        const muxRes = await cassandraDb.execute(muxQuery, [], { prepare: true });
        const muxData = muxRes.rows.map(row => ({
            id: row.id?.toString(),
            assetId: row.asset_id,
            playbackId: row.playback_id,
            chapterId: row.chapter_id?.toString(),

        }));
        const muxDataByChapterId = muxData.find(chapter => chapter.chapterId === chapterId);
         if(muxDataByChapterId) {
             await Video.Assets.del(muxDataByChapterId.assetId);
        // delete mux data based on chapter data
            const deleteQuery = `DELETE FROM mux_data_by_course WHERE id = ?`;
            const deleteParams = [muxDataByChapterId.id];
            await cassandraDb.execute(deleteQuery, deleteParams, { prepare: true })
            .then(() => console.log('Deleted succcesfully'))
            .catch(err => console.log(err));
      }

    };
    // delete chapter
    const deleteChapter = {
        chapterId,
        courseId
    }
    const deleteQuery = `DELETE FROM chapter_by_course WHERE id = ?`;
    const deleteParams = [chapterId];
    await cassandraDb.execute(deleteQuery, deleteParams, { prepare: true });

    const publishedChaptersQuery = `SELECT * FROM chapter_by_course WHERE id = ?`;
    const publishedChaptersParams = [courseId];
    const publishedChapters = (await cassandraDb.execute(publishedChaptersQuery, publishedChaptersParams, { prepare: true })).rows.map(row => ({
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
    const publishedChaptersInCourse = publishedChapters.filter(chapter => chapter.isPublished === true);
    if(!publishedChapters.length) {
        // course update
        const courseQueryUpdate = `UPDATE course SET is_published = ? WHERE id = ?`;
        const courseParams = [false, courseId];
        await cassandraDb.execute(courseQueryUpdate, courseParams, { prepare: true });

        return NextResponse.json(deleteChapter);
    


    }
    }
     catch (error) {
        console.log('[CHAPTER_DELETE]', error);
        return new NextResponse('Internal Error', { status: 500  })
        
    }

}